import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { RotateCcw, Share2, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { BriefContent } from "@/components/BriefContent";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ParticleBurst } from "@/components/ParticleBurst";
import { SpeechPlayer } from "@/components/SpeechPlayer";
import { StreakBadge } from "@/components/StreakBadge";
import { TopicTab } from "@/components/TopicTab";
import { getTopic, topicColor } from "@/data/topics";
import { useAppStore } from "@/store/useAppStore";
import {
  buildEmptyDailyBrief,
  generateTopicBrief,
  getOrInitBrief,
} from "@/utils/briefGenerator";
import {
  archiveBrief,
  loadDailyBrief,
  saveDailyBrief,
  todayKey,
  type DailyBrief,
} from "@/utils/historyStorage";
import {
  extractHeadline,
  extractTeaser,
} from "@/utils/extractMeta";
import { getStreakData, markDayComplete } from "@/utils/streakTracker";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { selectedTopics, dailyMinutes, apiProvider, apiKey, hasCompletedOnboarding } =
    useAppStore();
  const [mounted, setMounted] = useState(false);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [streak, setStreak] = useState(getStreakData());
  const [celebrated, setCelebrated] = useState(false);
  const [burst, setBurst] = useState(false);
  const [confirmingReload, setConfirmingReload] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!hasCompletedOnboarding) {
      navigate({ to: "/onboarding" });
    }
  }, [mounted, hasCompletedOnboarding, navigate]);

  // Initialize brief
  useEffect(() => {
    if (!mounted) return;
    const existing = loadDailyBrief(todayKey());
    const next = getOrInitBrief(selectedTopics, dailyMinutes, existing);
    setBrief(next);
    if (!loadDailyBrief(todayKey())) saveDailyBrief(next);
    setActiveTopic(next.allocations[0]?.topicId ?? null);
  }, [mounted, selectedTopics, dailyMinutes]);

  // Scroll progress
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
  });

  const activeBrief = activeTopic && brief?.briefs[activeTopic];
  const activeColor = activeTopic ? topicColor(activeTopic) : "#00ff9d";

  const generate = async (topicId: string) => {
    if (!brief || !apiKey) return;
    const updated = await generateTopicBrief(brief, topicId, apiProvider, apiKey);
    setBrief(updated);
  };

  const allDone = useMemo(
    () =>
      brief &&
      brief.allocations.length > 0 &&
      brief.allocations.every((a) => brief.briefs[a.topicId]?.status === "done"),
    [brief],
  );

  // Celebration trigger
  useEffect(() => {
    if (allDone && !celebrated) {
      setCelebrated(true);
      setBurst(true);
      setStreak(markDayComplete());
      setTimeout(() => setBurst(false), 900);
    }
  }, [allDone, celebrated]);

  const nextUnread = useMemo(() => {
    if (!brief || !activeTopic) return null;
    const ids = brief.allocations.map((a) => a.topicId);
    const i = ids.indexOf(activeTopic);
    for (let j = 1; j <= ids.length; j++) {
      const cand = ids[(i + j) % ids.length];
      if (cand === activeTopic) continue;
      if (brief.briefs[cand]?.status !== "done") return cand;
    }
    return null;
  }, [brief, activeTopic]);

  const startFresh = () => {
    archiveBrief(todayKey());
    const fresh = buildEmptyDailyBrief(selectedTopics, dailyMinutes);
    saveDailyBrief(fresh);
    setBrief(fresh);
    setActiveTopic(fresh.allocations[0]?.topicId ?? null);
    setCelebrated(false);
    setShowPlayer(false);
  };

  const onShare = async () => {
    if (!activeBrief?.content) return;
    const headline = extractHeadline(activeBrief.content);
    const teaser = extractTeaser(activeBrief.content);
    const text = `${headline}\n\n${teaser}\n\nRead the full brief on DailyBrief`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: headline, text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Brief copied to clipboard ✓");
      }
    } catch {}
  };

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!mounted || !brief) {
    return (
      <AppLayout>
        <div className="pt-8" />
      </AppLayout>
    );
  }

  if (brief.allocations.length === 0) {
    return (
      <AppLayout>
        <div className="py-16 text-center">
          <p className="font-serif text-lg">Pick at least one topic in Settings.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ParticleBurst show={burst} />

      <header className="flex items-center justify-between pt-6 pb-3">
        <StreakBadge count={streak.current} />
        <div className="font-serif text-sm text-[#888899]">{dateLabel}</div>
        <button
          onClick={() => {
            if (confirmingReload) {
              startFresh();
              setConfirmingReload(false);
            } else {
              setConfirmingReload(true);
              setTimeout(() => setConfirmingReload(false), 2000);
            }
          }}
          aria-label="Start fresh brief"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1a2e] text-[#888899] hover:text-[#e8e8f0]"
          style={{
            borderColor: confirmingReload ? "#00ff9d" : "#1a1a2e",
            color: confirmingReload ? "#00ff9d" : "#888899",
          }}
          title={confirmingReload ? "Tap again to confirm" : "Start fresh"}
        >
          <RotateCcw size={16} />
        </button>
      </header>

      {/* Tabs */}
      <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-[#1a1a2e]">
        <div className="flex w-max snap-x snap-mandatory items-stretch px-4">
          {brief.allocations.map((a) => (
            <TopicTab
              key={a.topicId}
              topicId={a.topicId}
              minutes={a.minutes}
              status={brief.briefs[a.topicId]?.status ?? "idle"}
              active={a.topicId === activeTopic}
              onClick={() => {
                setActiveTopic(a.topicId);
                setShowPlayer(false);
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="sticky top-0 z-10 -mx-4">
        <motion.div
          style={{ scaleX: progress, backgroundColor: activeColor, transformOrigin: "0% 50%" }}
          className="h-[2px]"
        />
      </div>

      <div ref={scrollRef} className="min-h-[50vh] pb-32">
        {activeTopic && activeBrief && (
          <TopicView
            key={activeTopic}
            topicId={activeTopic}
            status={activeBrief.status}
            content={activeBrief.content}
            error={activeBrief.error}
            color={activeColor}
            onGenerate={() => generate(activeTopic)}
            onRetry={() => generate(activeTopic)}
            onListen={() => setShowPlayer(true)}
            onShare={onShare}
          />
        )}
      </div>

      {/* Action bar / completion */}
      <div className="fixed inset-x-0 bottom-16 z-20 md:bottom-4">
        <div className="mx-auto flex max-w-[680px] flex-col gap-2 px-4">
          <AnimatePresence>
            {showPlayer && activeBrief?.status === "done" && (
              <SpeechPlayer
                markdown={activeBrief.content}
                topicColor={activeColor}
                onClose={() => setShowPlayer(false)}
              />
            )}
          </AnimatePresence>

          {allDone ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="rounded-2xl border bg-[#0f0f1a] p-4 shadow-lg"
              style={{ borderColor: "#00ff9d", boxShadow: "0 0 24px rgba(0,255,157,0.15)" }}
            >
              <div className="font-serif text-lg text-[#00ff9d]">
                ✓ Daily brief complete
              </div>
              <div className="font-mono text-xs text-[#888899]">
                You read {brief.allocations.length} topics ·{" "}
                {brief.allocations.reduce((s, a) => s + a.minutes, 0)} min
              </div>
              <div className="mt-1 font-mono text-xs text-[#888899]">
                🔥 Streak: {streak.current} days
              </div>
            </motion.div>
          ) : (
            activeBrief?.status === "done" && (
              <div className="flex items-center justify-between rounded-full border border-[#1a1a2e] bg-[#0f0f1a]/95 px-2 py-1.5 backdrop-blur">
                <button
                  onClick={() => generate(activeTopic!)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs text-[#888899] hover:text-[#e8e8f0]"
                >
                  <RotateCcw size={12} /> Regenerate
                </button>
                {nextUnread ? (
                  <button
                    onClick={() => {
                      setActiveTopic(nextUnread);
                      setShowPlayer(false);
                    }}
                    className="rounded-full px-3 py-1.5 font-sans text-sm"
                    style={{ color: activeColor }}
                  >
                    Next: {getTopic(nextUnread)?.label} →
                  </button>
                ) : (
                  <span className="px-3 py-1.5 font-sans text-sm text-[#00ff9d]">
                    All done ✓
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function TopicView({
  topicId,
  status,
  content,
  error,
  color,
  onGenerate,
  onRetry,
  onListen,
  onShare,
}: {
  topicId: string;
  status: "idle" | "loading" | "done" | "error";
  content: string;
  error?: string;
  color: string;
  onGenerate: () => void;
  onRetry: () => void;
  onListen: () => void;
  onShare: () => void;
}) {
  const topic = getTopic(topicId);

  if (status === "loading") {
    return (
      <div className="pt-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="text-3xl">⚠</div>
        <p className="font-sans text-sm text-[#f43f5e]">
          {error || "Something went wrong."}
        </p>
        <button
          onClick={onRetry}
          className="mt-2 rounded-full border border-[#2a2a3e] px-4 py-2 font-sans text-sm hover:border-[#00ff9d]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="text-5xl">{topic?.emoji}</div>
        <div className="font-serif text-2xl">{topic?.label}</div>
        <p className="font-sans text-sm text-[#888899]">
          Ready to generate your brief
        </p>
        <button
          onClick={onGenerate}
          className="mt-4 h-12 rounded-full bg-[#00ff9d] px-6 font-sans text-sm font-medium text-[#0a0a0f]"
          style={{ backgroundColor: color, color: "#0a0a0f" }}
        >
          Generate brief →
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <BriefContent content={content} topicColor={color} />
      <div className="mt-8 flex items-center gap-3 border-t border-[#1a1a2e] pt-4">
        <button
          onClick={onListen}
          className="flex items-center gap-2 rounded-full border border-[#2a2a3e] px-4 py-2 font-sans text-sm hover:border-[#00ff9d]"
        >
          <Volume2 size={14} /> Listen
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-full border border-[#2a2a3e] px-4 py-2 font-sans text-sm hover:border-[#00ff9d]"
        >
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  );
}
