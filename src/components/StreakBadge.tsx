interface Props {
  count: number;
}

export function StreakBadge({ count }: Props) {
  return (
    <div className="flex items-center gap-1.5 font-mono">
      <span aria-hidden>🔥</span>
      <span className="text-[#00ff9d]">{count}</span>
    </div>
  );
}
