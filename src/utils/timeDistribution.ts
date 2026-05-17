export interface TopicAllocation {
  topicId: string;
  minutes: number;
  wordTarget: number;
}

/**
 * Split minutes across topics with a minimum of 2 min each.
 * If budget doesn't allow all topics at 2min, drop the tail.
 */
export function distributeTime(
  topicIds: string[],
  totalMinutes: number,
): TopicAllocation[] {
  const MIN = 2;
  const maxFit = Math.floor(totalMinutes / MIN);
  const included = topicIds.slice(0, Math.max(1, maxFit));
  const n = included.length;
  if (n === 0) return [];

  const baseEach = Math.floor(totalMinutes / n);
  const remainder = totalMinutes - baseEach * n;
  return included.map((topicId, i) => {
    const minutes = Math.max(MIN, baseEach + (i < remainder ? 1 : 0));
    return {
      topicId,
      minutes,
      wordTarget: Math.floor(minutes * 200 * 0.85),
    };
  });
}
