import { Link, useRouterState } from "@tanstack/react-router";
import { Clock, Home, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const TABS = [
  { to: "/home", label: "Today", icon: Home },
  { to: "/history", label: "History", icon: Clock },
  { to: "/settings", label: "Settings", icon: SlidersHorizontal },
] as const;

export function AppLayout({ children }: Props) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#e8e8f0]">
      {/* Desktop top nav */}
      <header className="hidden md:block border-b border-[#1a1a2e]">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-4 py-3">
          <Link to="/home" className="font-serif text-lg text-[#00ff9d]">
            DailyBrief
          </Link>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = path.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="rounded-full px-3 py-1.5 text-sm transition-colors"
                  style={{
                    color: active ? "#00ff9d" : "#888899",
                    backgroundColor: active ? "rgba(0,255,157,0.08)" : "transparent",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[680px] px-4 pb-24 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1a1a2e] bg-[#0a0a0f]/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-[680px] items-stretch justify-around">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = path.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-[11px]"
                style={{ color: active ? "#00ff9d" : "#888899" }}
              >
                <Icon size={20} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
