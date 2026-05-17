import type { TopicAllocation } from "./timeDistribution";

export type BriefStatus = "idle" | "loading" | "done" | "error";

export interface TopicBrief {
  topicId: string;
  content: string;
  minutesAllocated: number;
  generatedAt: string;
  status: BriefStatus;
  error?: string;
}

export interface DailyBrief {
  date: string;
  session?: number;
  allocations: TopicAllocation[];
  briefs: Record<string, TopicBrief>;
}

const MAX_DAYS = 30;

export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function safeLS(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveDailyBrief(b: DailyBrief) {
  const ls = safeLS();
  if (!ls) return;
  const key = b.session
    ? `brief_${b.date}_v${b.session}`
    : `brief_${b.date}`;
  ls.setItem(key, JSON.stringify(b));
  pruneOld();
}

export function loadDailyBrief(date: string): DailyBrief | null {
  const ls = safeLS();
  if (!ls) return null;
  const raw = ls.getItem(`brief_${date}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyBrief;
  } catch {
    return null;
  }
}

export function loadAllBriefs(): DailyBrief[] {
  const ls = safeLS();
  if (!ls) return [];
  const out: DailyBrief[] = [];
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k || !k.startsWith("brief_")) continue;
    try {
      const v = ls.getItem(k);
      if (v) out.push(JSON.parse(v));
    } catch {}
  }
  return out.sort((a, b) => {
    const ad = a.date + "_" + (a.session ?? 0);
    const bd = b.date + "_" + (b.session ?? 0);
    return bd.localeCompare(ad);
  });
}

export function archiveBrief(date: string): DailyBrief | null {
  const ls = safeLS();
  if (!ls) return null;
  const raw = ls.getItem(`brief_${date}`);
  if (!raw) return null;
  // Find next session number
  let s = 1;
  while (ls.getItem(`brief_${date}_v${s}`)) s++;
  ls.setItem(`brief_${date}_v${s}`, raw);
  ls.removeItem(`brief_${date}`);
  return loadDailyBrief(date);
}

function pruneOld() {
  const ls = safeLS();
  if (!ls) return;
  const dates = new Set<string>();
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k || !k.startsWith("brief_")) continue;
    const date = k.replace(/^brief_/, "").split("_")[0];
    dates.add(date);
  }
  const sorted = Array.from(dates).sort().reverse();
  const keep = new Set(sorted.slice(0, MAX_DAYS));
  for (let i = ls.length - 1; i >= 0; i--) {
    const k = ls.key(i);
    if (!k || !k.startsWith("brief_")) continue;
    const date = k.replace(/^brief_/, "").split("_")[0];
    if (!keep.has(date)) ls.removeItem(k);
  }
}
