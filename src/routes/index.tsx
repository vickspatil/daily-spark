import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/")({
  component: Gate,
});

function Gate() {
  const [mounted, setMounted] = useState(false);
  const done = useAppStore((s) => s.hasCompletedOnboarding);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="min-h-dvh bg-[#0a0a0f]" />;
  }
  return <Navigate to={done ? "/home" : "/onboarding"} replace />;
}
