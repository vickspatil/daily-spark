import type { ApiProvider } from "@/store/useAppStore";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function friendly(status: number, fallback?: string): string {
  if (status === 401 || status === 403)
    return "Invalid API key. Check your key in Settings.";
  if (status === 402)
    return "Your API credits are exhausted. Top up at the provider's console.";
  if (status === 429) return "Rate limit hit. Wait a minute and try again.";
  return fallback || "Something went wrong. Please retry.";
}

async function callClaude(
  apiKey: string,
  prompt: string,
  useWebSearch: boolean,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: useWebSearch
        ? [{ type: "web_search_20250305", name: "web_search" }]
        : [],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.json();
      msg = j?.error?.message || "";
    } catch {}
    throw new ApiError(friendly(res.status, msg), res.status);
  }
  const data = await res.json();
  const text = (data?.content || [])
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
    .join("\n\n");
  return text.trim();
}

async function callGemini(
  apiKey: string,
  prompt: string,
  useWebSearch: boolean,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: useWebSearch ? [{ google_search: {} }] : [],
      generationConfig: { maxOutputTokens: 4000 },
    }),
  });
  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.json();
      msg = j?.error?.message || "";
    } catch {}
    throw new ApiError(friendly(res.status, msg), res.status);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p: any) => p?.text || "")
    .join("")
    .trim();
}

export async function generateContent(
  provider: ApiProvider,
  apiKey: string,
  prompt: string,
  useWebSearch = true,
): Promise<string> {
  try {
    if (provider === "claude")
      return await callClaude(apiKey, prompt, useWebSearch);
    return await callGemini(apiKey, prompt, useWebSearch);
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "No connection. Check your internet and try again.",
      0,
    );
  }
}

export async function testApiKey(
  provider: ApiProvider,
  apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!apiKey.trim()) return { ok: false, error: "Key is empty" };
  try {
    const out = await generateContent(
      provider,
      apiKey.trim(),
      "Reply with exactly the word 'ok' and nothing else.",
      false,
    );
    if (!out) return { ok: false, error: "Empty response from provider" };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Validation failed" };
  }
}
