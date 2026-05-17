import { motion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { useRef, useState } from "react";
import { formatTime, useSpeech } from "@/hooks/useSpeech";

interface Props {
  markdown: string;
  topicColor: string;
  onClose: () => void;
}

export function SpeechPlayer({ markdown, topicColor, onClose }: Props) {
  const s = useSpeech(markdown);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragFrac, setDragFrac] = useState<number | null>(null);

  const frac = dragFrac ?? s.progress;

  const setFromEvent = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setDragFrac(f);
  };

  const commit = () => {
    if (dragFrac !== null) s.seek(dragFrac);
    setDragFrac(null);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-full border bg-[#141420] px-3 py-2 shadow-lg"
    >
      <button
        type="button"
        onClick={s.toggle}
        aria-label={s.isPlaying ? "Pause" : "Play"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0a0a0f]"
        style={{ backgroundColor: topicColor }}
      >
        {s.isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div
        ref={trackRef}
        className="relative h-2 flex-1 cursor-pointer touch-none rounded-full bg-[#2a2a3e]"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setFromEvent(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragFrac !== null) setFromEvent(e.clientX);
        }}
        onPointerUp={commit}
        onPointerCancel={commit}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${frac * 100}%`, backgroundColor: topicColor }}
        />
        <motion.div
          className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full"
          style={{
            left: `${frac * 100}%`,
            backgroundColor: topicColor,
            boxShadow: "inset 0 0 0 3px #0a0a0f",
          }}
          animate={{ scale: dragFrac !== null ? 1.3 : 1 }}
        />
      </div>

      <div className="font-mono text-[11px] text-[#888899] tabular-nums">
        {formatTime(s.currentTime)} / {formatTime(s.duration)}
      </div>

      <button
        type="button"
        onClick={() => {
          s.stop();
          onClose();
        }}
        aria-label="Close player"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#888899] hover:text-[#e8e8f0]"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
