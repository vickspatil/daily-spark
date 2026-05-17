import { useCallback, useEffect, useRef, useState } from "react";
import { splitIntoChunks, stripMarkdown } from "@/utils/stripMarkdown";

interface UseSpeechReturn {
  isPlaying: boolean;
  isReady: boolean;
  progress: number; // 0..1
  currentTime: number; // seconds (estimated)
  duration: number; // seconds (estimated)
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  seek: (frac: number) => void;
}

// rough estimate: ~14 chars/sec at rate 0.95
function estimateSeconds(text: string) {
  return Math.max(1, text.length / 14);
}

export function useSpeech(markdown: string): UseSpeechReturn {
  const chunks = useRef<string[]>([]);
  const durations = useRef<number[]>([]);
  const totalRef = useRef(0);
  const idx = useRef(0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0); // re-render progress
  const startedAt = useRef<number>(0);
  const elapsedBefore = useRef<number>(0);

  // Build chunks when markdown changes
  useEffect(() => {
    const plain = stripMarkdown(markdown);
    const c = splitIntoChunks(plain, 380);
    chunks.current = c;
    durations.current = c.map(estimateSeconds);
    totalRef.current = durations.current.reduce((a, b) => a + b, 0);
    idx.current = 0;
    elapsedBefore.current = 0;
    setTick((t) => t + 1);
  }, [markdown]);

  // cleanup
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    };
  }, []);

  const speakFrom = useCallback((i: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (i >= chunks.current.length) {
      setIsPlaying(false);
      idx.current = 0;
      elapsedBefore.current = 0;
      setTick((t) => t + 1);
      return;
    }
    idx.current = i;
    elapsedBefore.current = durations.current
      .slice(0, i)
      .reduce((a, b) => a + b, 0);
    startedAt.current = Date.now();

    const u = new SpeechSynthesisUtterance(chunks.current[i]);
    u.rate = 0.95;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const eng = voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
    if (eng) u.voice = eng;
    u.onend = () => {
      // advance
      speakFrom(i + 1);
    };
    u.onerror = () => {
      setIsPlaying(false);
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setIsPlaying(true);
    setTick((t) => t + 1);
  }, []);

  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (chunks.current.length === 0) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      startedAt.current = Date.now();
      setIsPlaying(true);
      return;
    }
    speakFrom(idx.current);
  }, [speakFrom]);

  const pause = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis.pause();
    } catch {}
    // Save progress within current chunk
    const elapsedInChunk = (Date.now() - startedAt.current) / 1000;
    elapsedBefore.current += elapsedInChunk;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, pause, play]);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    idx.current = 0;
    elapsedBefore.current = 0;
    setIsPlaying(false);
    setTick((t) => t + 1);
  }, []);

  const seek = useCallback(
    (frac: number) => {
      const target = Math.max(0, Math.min(1, frac)) * totalRef.current;
      let acc = 0;
      let i = 0;
      for (; i < durations.current.length; i++) {
        if (acc + durations.current[i] >= target) break;
        acc += durations.current[i];
      }
      idx.current = Math.min(i, chunks.current.length - 1);
      elapsedBefore.current = acc;
      if (isPlaying) {
        speakFrom(idx.current);
      } else {
        setTick((t) => t + 1);
      }
    },
    [isPlaying, speakFrom],
  );

  // Tick while playing
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [isPlaying]);

  const elapsedInChunk = isPlaying
    ? (Date.now() - startedAt.current) / 1000
    : 0;
  const currentTime = Math.min(
    totalRef.current,
    elapsedBefore.current + elapsedInChunk,
  );
  const duration = totalRef.current || 1;
  const progress = currentTime / duration;
  void tick;

  return {
    isPlaying,
    isReady: chunks.current.length > 0,
    progress,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    stop,
    seek,
  };
}

export function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
