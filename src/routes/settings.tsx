import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { TopicCard } from "@/components/TopicCard";
import { ALL_TOPICS, CATEGORIES, topicColor } from "@/data/topics";
import { useAppStore, type ApiProvider } from "@/store/useAppStore";
import { testApiKey } from "@/utils/apiClient";
import { distributeTime } from "@/utils/timeDistribution";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const store = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !store.hasCompletedOnboarding)
      navigate({ to: "/onboarding" });
  }, [mounted, store.hasCompletedOnboarding, navigate]);

  if (!mounted) return <AppLayout><div /></AppLayout>;

  const allocs = distributeTime(store.selectedTopics, store.dailyMinutes);

  const toggleTopic = (id: string) => {
    store.setSelectedTopics(
      store.selectedTopics.includes(id)
        ? store.selectedTopics.filter((x) => x !== id)
        : [...store.selectedTopics, id],
    );
  };

  return (
    <AppLayout>
      <h1 className="pt-6 pb-6 font-serif text-3xl">Settings</h1>

      <Section title="Your Topics">
        <div className="space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-[#888899]">
                {cat}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_TOPICS.filter((t) => t.category === cat).map((t) => (
                  <TopicCard
                    key={t.id}
                    topic={t}
                    selected={store.selectedTopics.includes(t.id)}
                    onToggle={toggleTopic}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Daily Reading Time">
        <div className="text-center font-serif text-4xl text-[#00ff9d]">
          {store.dailyMinutes}{" "}
          <span className="font-sans text-lg text-[#888899]">min</span>
        </div>
        <input
          type="range"
          min={3}
          max={60}
          value={store.dailyMinutes}
          onChange={(e) => store.setDailyMinutes(Number(e.target.value))}
          className="db-slider mt-4"
          style={{
            background: `linear-gradient(to right, #00ff9d 0%, #00ff9d ${
              ((store.dailyMinutes - 3) / 57) * 100
            }%, #2a2a3e ${((store.dailyMinutes - 3) / 57) * 100}%, #2a2a3e 100%)`,
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 10, 15, 20, 30, 45, 60].map((p) => (
            <button
              key={p}
              onClick={() => store.setDailyMinutes(p)}
              className="rounded-full border px-3 py-1 font-mono text-xs"
              style={{
                borderColor: p === store.dailyMinutes ? "#00ff9d" : "#2a2a3e",
                color: p === store.dailyMinutes ? "#00ff9d" : "#888899",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {allocs.map((a) => (
            <div key={a.topicId} className="flex items-center gap-3">
              <div className="w-28 truncate font-sans text-xs">
                {ALL_TOPICS.find((t) => t.id === a.topicId)?.emoji}{" "}
                {ALL_TOPICS.find((t) => t.id === a.topicId)?.label}
              </div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
                <div
                  className="h-full"
                  style={{
                    width: `${(a.minutes / store.dailyMinutes) * 100}%`,
                    backgroundColor: topicColor(a.topicId),
                  }}
                />
              </div>
              <div className="w-10 text-right font-mono text-xs text-[#888899]">
                {a.minutes}m
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="API Key">
        <div className="flex items-center justify-between rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] p-4">
          <div>
            <div className="font-sans text-xs uppercase tracking-wider text-[#888899]">
              Provider
            </div>
            <div className="font-serif text-lg capitalize text-[#00ff9d]">
              {store.apiProvider}
            </div>
            <div className="mt-3 font-mono text-xs text-[#888899]">
              {store.apiKey
                ? `${store.apiKey.slice(0, 6)}••••••••${store.apiKey.slice(-4)}`
                : "No key set"}
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="rounded-full border border-[#2a2a3e] px-4 py-2 font-sans text-sm hover:border-[#00ff9d]"
          >
            Change key
          </button>
        </div>
      </Section>

      <Section title="Notifications">
        <label className="flex items-center justify-between rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] p-4">
          <div>
            <div className="font-serif text-base">Daily reminder</div>
            <div className="mt-1 font-mono text-[11px] leading-relaxed text-[#888899]">
              Reminders only fire while DailyBrief is open in a browser tab.
            </div>
          </div>
          <Toggle
            checked={store.notificationsEnabled}
            onChange={async (v) => {
              if (v && typeof window !== "undefined" && "Notification" in window) {
                const perm = await Notification.requestPermission();
                if (perm !== "granted") return;
              }
              store.setNotificationsEnabled(v);
            }}
          />
        </label>
        {store.notificationsEnabled && (
          <div className="mt-3 flex items-center justify-center gap-4 rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] p-4">
            <TimeStepper
              value={store.notificationTime.hour}
              min={0}
              max={23}
              onChange={(h) =>
                store.setNotificationTime(h, store.notificationTime.minute)
              }
              label="Hour"
            />
            <span className="font-mono text-xl text-[#888899]">:</span>
            <TimeStepper
              value={store.notificationTime.minute}
              step={15}
              min={0}
              max={45}
              onChange={(m) =>
                store.setNotificationTime(store.notificationTime.hour, m)
              }
              label="Minute"
            />
          </div>
        )}
      </Section>

      <Section title="Privacy & Reset">
        <p className="font-sans text-sm text-[#888899]">
          All your data lives in this browser only. No accounts. No tracking.
          Your API key, topics, briefs and streak never leave your device.
        </p>
        <button
          onClick={() => {
            if (confirmReset) {
              store.resetOnboarding();
              navigate({ to: "/onboarding" });
            } else {
              setConfirmReset(true);
              setTimeout(() => setConfirmReset(false), 3000);
            }
          }}
          className="mt-4 rounded-full border border-[#f43f5e] px-4 py-2 font-sans text-sm text-[#f43f5e] hover:bg-[#f43f5e]/10"
        >
          {confirmReset ? "Tap again to confirm reset" : "Reset app"}
        </button>
      </Section>

      {showKeyModal && (
        <KeyModal
          provider={store.apiProvider}
          onClose={() => setShowKeyModal(false)}
          onSave={(p, k) => {
            store.setApiConfig(p, k);
            setShowKeyModal(false);
          }}
        />
      )}
    </AppLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-[#888899]">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 rounded-full transition-colors"
      style={{ backgroundColor: checked ? "#00ff9d" : "#2a2a3e" }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-[#0a0a0f] transition-transform"
        style={{ transform: `translateX(${checked ? 20 : 2}px)` }}
      />
    </button>
  );
}

function TimeStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const inc = () => {
    const next = value + step > max ? min : value + step;
    onChange(next);
  };
  const dec = () => {
    const next = value - step < min ? max : value - step;
    onChange(next);
  };
  return (
    <div className="flex flex-col items-center">
      <button onClick={inc} className="text-[#888899] hover:text-[#00ff9d]">
        ▲
      </button>
      <div className="font-mono text-2xl text-[#e8e8f0]">
        {String(value).padStart(2, "0")}
      </div>
      <button onClick={dec} className="text-[#888899] hover:text-[#00ff9d]">
        ▼
      </button>
      <span className="mt-1 font-mono text-[10px] uppercase text-[#444455]">
        {label}
      </span>
    </div>
  );
}

function KeyModal({
  provider,
  onClose,
  onSave,
}: {
  provider: ApiProvider;
  onClose: () => void;
  onSave: (p: ApiProvider, k: string) => void;
}) {
  const [p, setP] = useState<ApiProvider>(provider);
  const [k, setK] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!k.trim()) {
      setState("idle");
      return;
    }
    setState("checking");
    const id = setTimeout(async () => {
      const r = await testApiKey(p, k.trim());
      if (r.ok) setState("ok");
      else {
        setState("bad");
        setErr(r.error || "Invalid key");
      }
    }, 800);
    return () => clearTimeout(id);
  }, [k, p]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a3e] bg-[#0f0f1a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl">Update API key</h3>
          <button onClick={onClose} className="text-[#888899]">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-6 border-b border-[#1a1a2e]">
          {(["claude", "gemini"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setP(opt)}
              className="-mb-px border-b-2 pb-2 font-sans text-sm capitalize"
              style={{
                borderColor: p === opt ? "#00ff9d" : "transparent",
                color: p === opt ? "#00ff9d" : "#888899",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="relative mt-4">
          <input
            type={show ? "text" : "password"}
            value={k}
            onChange={(e) => setK(e.target.value)}
            placeholder={p === "claude" ? "sk-ant-..." : "AIza..."}
            className="w-full rounded-md border border-[#2a2a3e] bg-[#0a0a0f] px-4 py-3 pr-12 font-mono text-sm outline-none focus:border-[#00ff9d]"
            autoComplete="off"
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888899]"
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
        <button
          onClick={() => onSave(p, k.trim())}
          disabled={state !== "ok"}
          className="mt-6 h-12 w-full rounded-full bg-[#00ff9d] font-sans text-sm font-medium text-[#0a0a0f] disabled:opacity-30"
        >
          Save key
        </button>
      </div>
    </div>
  );
}

// stub to satisfy lint when allocations becomes unused via memo path
function _unused() {
  useMemo(() => null, []);
}
void _unused;
