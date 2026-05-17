import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TopicCard } from "@/components/TopicCard";
import { ALL_TOPICS, CATEGORIES, topicColor } from "@/data/topics";
import { useAppStore, type ApiProvider } from "@/store/useAppStore";
import { testApiKey } from "@/utils/apiClient";
import { distributeTime } from "@/utils/timeDistribution";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const store = useAppStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const finish = () => {
    store.completeOnboarding();
    navigate({ to: "/home" });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] text-[#e8e8f0]">
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-5 py-8">
        <StepDots step={step} />
        <div className="relative mt-8 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ x: 40 * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40 * dir, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {step === 1 && <Step1 onNext={() => go(2)} />}
              {step === 2 && (
                <Step2
                  selected={store.selectedTopics}
                  onChange={store.setSelectedTopics}
                  onNext={() => go(3)}
                  onBack={() => go(1)}
                />
              )}
              {step === 3 && (
                <Step3
                  topics={store.selectedTopics}
                  minutes={store.dailyMinutes}
                  onChange={store.setDailyMinutes}
                  onNext={() => go(4)}
                  onBack={() => go(2)}
                />
              )}
              {step === 4 && (
                <Step4
                  provider={store.apiProvider}
                  apiKey={store.apiKey}
                  onSave={store.setApiConfig}
                  onNext={() => go(5)}
                  onBack={() => go(3)}
                />
              )}
              {step === 5 && (
                <Step5
                  topics={store.selectedTopics}
                  minutes={store.dailyMinutes}
                  provider={store.apiProvider}
                  onFinish={finish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i === step;
        const done = i < step;
        return (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: active ? 28 : 8,
              backgroundColor: done
                ? "#00ff9d"
                : active
                  ? "#00ff9d"
                  : "#2a2a3e",
              boxShadow: active ? "0 0 12px #00ff9d80" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-14 w-full rounded-full bg-[#00ff9d] font-sans text-base font-medium text-[#0a0a0f] transition-opacity disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-full rounded-full border border-[#2a2a3e] font-sans text-sm text-[#888899] hover:text-[#e8e8f0]"
    >
      {children}
    </button>
  );
}

// ---------- Steps ----------

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-8 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="font-serif text-5xl text-[#00ff9d]">DailyBrief</h1>
        <p className="mt-4 font-sans text-base text-[#888899]">
          Your morning brief. Your API key. Your privacy.
        </p>
        <p className="mt-6 max-w-sm font-serif text-base leading-relaxed text-[#e8e8f0]">
          Pick the topics you care about. Set how many minutes you have each
          day. We generate a fresh, grounded brief — straight from your AI key
          to your browser. Nothing in between.
        </p>
      </div>
      <PrimaryButton onClick={onNext}>Get started →</PrimaryButton>
    </div>
  );
}

function Step2({
  selected,
  onChange,
  onNext,
  onBack,
}: {
  selected: string[];
  onChange: (t: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  };
  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-3xl text-[#e8e8f0]">
        What do you want to read?
      </h2>
      <p className="mt-2 font-sans text-sm text-[#888899]">
        Pick at least one topic. You can change these later.
      </p>

      <div className="mt-6 flex-1 space-y-6 overflow-y-auto pb-4">
        {CATEGORIES.map((cat) => (
          <section key={cat}>
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-[#888899]">
              {cat}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_TOPICS.filter((t) => t.category === cat).map((t) => (
                <TopicCard
                  key={t.id}
                  topic={t}
                  selected={selected.includes(t.id)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between pb-1 font-mono text-xs text-[#888899]">
        <button onClick={onBack} className="hover:text-[#e8e8f0]">
          ← Back
        </button>
        <span>{selected.length} selected</span>
      </div>
      <div className="mt-3">
        <PrimaryButton onClick={onNext} disabled={selected.length < 1}>
          Continue →
        </PrimaryButton>
      </div>
    </div>
  );
}

function Step3({
  topics,
  minutes,
  onChange,
  onNext,
  onBack,
}: {
  topics: string[];
  minutes: number;
  onChange: (m: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allocs = useMemo(() => distributeTime(topics, minutes), [topics, minutes]);
  const dropped = topics.length - allocs.length;
  const presets = [5, 10, 15, 20, 30, 45, 60];

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-3xl">How many minutes a day?</h2>
      <p className="mt-2 font-sans text-sm text-[#888899]">
        We'll split this across your topics.
      </p>

      <div className="mt-8 text-center">
        <div className="font-serif text-6xl text-[#00ff9d]">
          {minutes}
          <span className="ml-2 font-sans text-2xl text-[#888899]">min</span>
        </div>
      </div>

      <div className="mt-6">
        <input
          type="range"
          min={3}
          max={60}
          step={1}
          value={minutes}
          onChange={(e) => onChange(Number(e.target.value))}
          className="db-slider"
          style={{
            background: `linear-gradient(to right, #00ff9d 0%, #00ff9d ${
              ((minutes - 3) / 57) * 100
            }%, #2a2a3e ${((minutes - 3) / 57) * 100}%, #2a2a3e 100%)`,
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="rounded-full border px-3 py-1 font-mono text-xs"
            style={{
              borderColor: p === minutes ? "#00ff9d" : "#2a2a3e",
              color: p === minutes ? "#00ff9d" : "#888899",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-6 flex-1 space-y-2 overflow-y-auto">
        {allocs.map((a) => (
          <div key={a.topicId} className="flex items-center gap-3">
            <div className="w-28 truncate font-sans text-xs text-[#e8e8f0]">
              {ALL_TOPICS.find((t) => t.id === a.topicId)?.emoji}{" "}
              {ALL_TOPICS.find((t) => t.id === a.topicId)?.label}
            </div>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(a.minutes / minutes) * 100}%`,
                  backgroundColor: topicColor(a.topicId),
                }}
              />
            </div>
            <div className="w-10 text-right font-mono text-xs text-[#888899]">
              {a.minutes}m
            </div>
          </div>
        ))}
        {dropped > 0 && (
          <p className="pt-2 font-mono text-xs text-[#f0a500]">
            {dropped} topic{dropped > 1 ? "s" : ""} won't fit in {minutes} min —
            the last {dropped} won't be included today.
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <GhostButton onClick={onBack}>← Back</GhostButton>
        <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
      </div>
    </div>
  );
}

function Step4({
  provider,
  apiKey,
  onSave,
  onNext,
  onBack,
}: {
  provider: ApiProvider;
  apiKey: string;
  onSave: (p: ApiProvider, k: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [p, setP] = useState<ApiProvider>(provider);
  const [k, setK] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [state, setState] = useState<
    "idle" | "checking" | "ok" | "bad"
  >(apiKey ? "ok" : "idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!k.trim()) {
      setState("idle");
      return;
    }
    setState("checking");
    const id = setTimeout(async () => {
      const res = await testApiKey(p, k.trim());
      if (res.ok) {
        setState("ok");
        onSave(p, k.trim());
      } else {
        setState("bad");
        setErr(res.error || "Invalid key");
      }
    }, 800);
    return () => clearTimeout(id);
  }, [k, p, onSave]);

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-3xl">Your AI, your key</h2>
      <p className="mt-2 font-sans text-sm text-[#888899]">
        DailyBrief calls Claude or Gemini directly from your browser. Your key
        never leaves your device.
      </p>

      <div className="mt-6 flex gap-6 border-b border-[#1a1a2e]">
        {(["claude", "gemini"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setP(opt)}
            className="-mb-px border-b-2 pb-3 font-sans text-sm capitalize transition-colors"
            style={{
              borderColor: p === opt ? "#00ff9d" : "transparent",
              color: p === opt ? "#00ff9d" : "#888899",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={k}
            onChange={(e) => setK(e.target.value)}
            placeholder={p === "claude" ? "sk-ant-..." : "AIza..."}
            className="w-full rounded-md border border-[#2a2a3e] bg-[#0f0f1a] px-4 py-3 pr-12 font-mono text-sm text-[#e8e8f0] outline-none placeholder:text-[#444455] focus:border-[#00ff9d]"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888899]"
            aria-label={show ? "Hide key" : "Show key"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="mt-3 flex h-5 items-center gap-2 text-xs">
          {state === "checking" && (
            <>
              <Loader2 size={14} className="animate-spin text-[#888899]" />
              <span className="text-[#888899]">Checking key…</span>
            </>
          )}
          {state === "ok" && (
            <>
              <Check size={14} className="text-[#00ff9d]" />
              <span className="text-[#00ff9d]">Key looks good</span>
            </>
          )}
          {state === "bad" && (
            <>
              <X size={14} className="text-[#f43f5e]" />
              <span className="text-[#f43f5e]">{err}</span>
            </>
          )}
        </div>

        <p className="mt-4 font-mono text-xs text-[#888899]">
          {p === "claude"
            ? "Get a Claude key at console.anthropic.com"
            : "Get a Gemini key at aistudio.google.com"}
        </p>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#444455]">
          Your key is stored only in this browser. Don't use this on a shared
          computer.
        </p>
      </div>

      <div className="flex-1" />

      <div className="grid grid-cols-2 gap-3">
        <GhostButton onClick={onBack}>← Back</GhostButton>
        <PrimaryButton onClick={onNext} disabled={state !== "ok"}>
          Continue →
        </PrimaryButton>
      </div>
    </div>
  );
}

function Step5({
  topics,
  minutes,
  provider,
  onFinish,
}: {
  topics: string[];
  minutes: number;
  provider: ApiProvider;
  onFinish: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-8 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="mb-6">
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#00ff9d"
            strokeWidth="3"
            strokeDasharray="276"
            strokeDashoffset="276"
            style={{ animation: "draw 600ms ease-in-out forwards" }}
          />
          <path
            d="M30 50 L44 64 L68 36"
            fill="none"
            stroke="#00ff9d"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset="60"
            style={{
              animation: "draw 500ms 500ms ease-in-out forwards",
            }}
          />
        </svg>
        <h2 className="font-serif text-3xl">You're all set</h2>
        <p className="mt-3 font-mono text-sm text-[#888899]">
          {topics.length} topics · {minutes} min/day ·{" "}
          <span className="capitalize">{provider}</span>
        </p>
      </div>
      <PrimaryButton onClick={onFinish}>Open my brief →</PrimaryButton>
    </div>
  );
}
