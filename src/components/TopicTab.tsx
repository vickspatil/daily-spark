import { topicColor, getTopic } from "@/data/topics";
import type { BriefStatus } from "@/utils/historyStorage";

interface Props {
  topicId: string;
  minutes: number;
  status: BriefStatus;
  active: boolean;
  onClick: () => void;
}

export function TopicTab({ topicId, minutes, status, active, onClick }: Props) {
  const topic = getTopic(topicId);
  const color = topicColor(topicId);
  const dot =
    status === "done" ? (
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    ) : status === "loading" ? (
      <span
        className="inline-block h-2 w-2 animate-pulse rounded-full border"
        style={{ borderColor: color }}
      />
    ) : status === "error" ? (
      <span className="inline-block h-2 w-2 rounded-full bg-[#f43f5e]" />
    ) : (
      <span
        className="inline-block h-2 w-2 rounded-full border"
        style={{ borderColor: "#444455" }}
      />
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 snap-start items-center gap-2 border-b-2 px-3 py-3 transition-colors"
      style={{
        borderColor: active ? color : "transparent",
        color: active ? color : "#888899",
      }}
    >
      <span className="text-base">{topic?.emoji}</span>
      <span className="font-sans text-sm">{topic?.label}</span>
      <span className="font-mono text-xs opacity-70">· {minutes}m</span>
      {dot}
    </button>
  );
}
