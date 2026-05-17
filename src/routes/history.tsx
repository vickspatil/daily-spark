import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { BriefContent } from "@/components/BriefContent";
import { TopicTab } from "@/components/TopicTab";
import { getTopic, topicColor } from "@/data/topics";
import { useAppStore } from "@/store/useAppStore";
import { loadAllBriefs, type DailyBrief } from "@/utils/historyStorage";
import { getStreakData } from "@/utils/streakTracker";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const done = useAppStore((s) => s.hasCompletedOnboarding);
  const [mounted, setMounted] = useState(false);
  const [briefs, setBriefs] = useState<DailyBrief[]>([]);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [open, setOpen] = useState<DailyBrief | null>(null);

  useEffect(() => {
    setMounted(true);
    setBriefs(loadAllBriefs());
    const s = getStreakData();
    setStreak({ current: s.current, best: s.best });
  }, []);

  useEffect(() => {
    if (mounted && !done) navigate({ to: "/onboarding" });
  }, [mounted, done, navigate]);

  if (!mounted) return <AppLayout><div /></AppLayout>;

  return (
    <AppLayout>
      <h1 className="pt-6 pb-4 font-serif text-3xl">History</h1>

      <div className="rounded-2xl border border-[#1a1a2e] bg-[#0f0f1a] p-5">
        <div className="font-mono text-xs uppercase tracking-wider text-[#888899]">
          🔥 Current streak
        </div>
        <div className="mt-1 font-serif text-4xl text-[#00ff9d]">
          {streak.current} {streak.current === 1 ? "day" : "days"}
        </div>
        <div className="mt-2 font-mono text-xs text-[#888899]">
          Best: {streak.best} days
        </div>
      </div>

      <div className="mt-8 space-y-3 pb-8">
        {briefs.length === 0 && (
          <p className="font-sans text-sm text-[#888899]">
            No briefs yet. Generate one on the Today tab.
          </p>
        )}
        {briefs.map((b, i) => {
          const date = new Date(b.date + "T00:00:00");
          const label = date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          return (
            <button
              key={`${b.date}_${b.session ?? 0}_${i}`}
              onClick={() => setOpen(b)}
              className="w-full rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] p-4 text-left transition-colors hover:border-[#2a2a3e]"
            >
              <div className="flex items-center justify-between">
                <div className="font-serif text-base">{label}</div>
                {b.session ? (
                  <div className="font-mono text-xs text-[#888899]">
                    Session {b.session + 1}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.allocations.map((a) => (
                  <span
                    key={a.topicId}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${topicColor(a.topicId)} 25%, #0f0f1a)`,
                    }}
                    title={getTopic(a.topicId)?.label}
                  >
                    {getTopic(a.topicId)?.emoji}
                  </span>
                ))}
              </div>
              <div className="mt-2 font-mono text-xs text-[#888899]">
                {b.allocations.length} topics
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && <Reader brief={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </AppLayout>
  );
}

function Reader({ brief, onClose }: { brief: DailyBrief; onClose: () => void }) {
  const [active, setActive] = useState(brief.allocations[0]?.topicId ?? null);
  const cur = active ? brief.briefs[active] : null;
  const color = active ? topicColor(active) : "#00ff9d";
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#0a0a0f]"
    >
      <div className="mx-auto max-w-[680px] px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="font-serif text-lg">
            {new Date(brief.date + "T00:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1a2e] text-[#888899]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="no-scrollbar mt-4 -mx-4 overflow-x-auto border-b border-[#1a1a2e]">
          <div className="flex w-max px-4">
            {brief.allocations.map((a) => (
              <TopicTab
                key={a.topicId}
                topicId={a.topicId}
                minutes={a.minutes}
                status={brief.briefs[a.topicId]?.status ?? "idle"}
                active={a.topicId === active}
                onClick={() => setActive(a.topicId)}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 pb-20">
          {cur?.content ? (
            <BriefContent content={cur.content} topicColor={color} />
          ) : (
            <p className="py-12 text-center font-sans text-sm text-[#888899]">
              No content saved for this topic.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
