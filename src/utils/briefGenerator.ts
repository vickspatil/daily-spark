import type { ApiProvider } from "@/store/useAppStore";
import { generateContent } from "./apiClient";
import { buildPrompt } from "./prompts";
import { distributeTime, type TopicAllocation } from "./timeDistribution";
import {
  saveDailyBrief,
  todayKey,
  type DailyBrief,
  type TopicBrief,
} from "./historyStorage";

export function buildEmptyDailyBrief(
  topicIds: string[],
  minutes: number,
): DailyBrief {
  const allocations = distributeTime(topicIds, minutes);
  const briefs: Record<string, TopicBrief> = {};
  for (const a of allocations) {
    briefs[a.topicId] = {
      topicId: a.topicId,
      content: "",
      minutesAllocated: a.minutes,
      generatedAt: "",
      status: "idle",
    };
  }
  return { date: todayKey(), allocations, briefs };
}

export async function generateTopicBrief(
  brief: DailyBrief,
  topicId: string,
  provider: ApiProvider,
  apiKey: string,
): Promise<DailyBrief> {
  const alloc = brief.allocations.find((a) => a.topicId === topicId);
  if (!alloc) return brief;

  // Mark loading and persist
  const loading: DailyBrief = {
    ...brief,
    briefs: {
      ...brief.briefs,
      [topicId]: {
        ...brief.briefs[topicId],
        status: "loading",
        error: undefined,
      },
    },
  };
  saveDailyBrief(loading);

  try {
    const prompt = buildPrompt(topicId, alloc.wordTarget);
    const content = await generateContent(provider, apiKey, prompt, true);
    const done: DailyBrief = {
      ...loading,
      briefs: {
        ...loading.briefs,
        [topicId]: {
          topicId,
          minutesAllocated: alloc.minutes,
          content,
          generatedAt: new Date().toISOString(),
          status: "done",
        },
      },
    };
    saveDailyBrief(done);
    return done;
  } catch (e: any) {
    const err: DailyBrief = {
      ...loading,
      briefs: {
        ...loading.briefs,
        [topicId]: {
          ...loading.briefs[topicId],
          status: "error",
          error: e?.message || "Failed to generate",
        },
      },
    };
    saveDailyBrief(err);
    return err;
  }
}

export function getOrInitBrief(
  topicIds: string[],
  minutes: number,
  existing: DailyBrief | null,
): DailyBrief {
  if (existing && existing.date === todayKey()) {
    // If topics changed, rebuild
    const same =
      existing.allocations.length === topicIds.length &&
      existing.allocations.every((a, i) => a.topicId === topicIds[i]);
    if (same) return existing;
  }
  return buildEmptyDailyBrief(topicIds, minutes);
}

export type { TopicAllocation };
