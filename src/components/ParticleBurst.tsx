import { useMemo } from "react";

const COLORS = [
  "#00ff9d",
  "#3cb9ff",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#f43f5e",
];

interface Props {
  show: boolean;
}

export function ParticleBurst({ show }: Props) {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const dist = 120 + Math.random() * 80;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: COLORS[i % COLORS.length],
          delay: Math.random() * 80,
        };
      }),
    [],
  );
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div className="relative">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle absolute left-0 top-0 h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: p.color,
              ["--dx" as any]: `${p.dx}px`,
              ["--dy" as any]: `${p.dy}px`,
              animationDelay: `${p.delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
