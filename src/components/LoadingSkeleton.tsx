const WIDTHS = ["100%", "90%", "100%", "85%", "100%", "70%", "100%", "95%", "60%"];

export function LoadingSkeleton() {
  return (
    <div className="space-y-3 py-4" aria-label="Loading">
      {WIDTHS.map((w, i) => (
        <div
          key={i}
          className="shimmer h-4 rounded-[6px]"
          style={{ width: w, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
