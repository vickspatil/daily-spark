import { motion } from "framer-motion";
import { topicColor, type Topic } from "@/data/topics";

interface Props {
  topic: Topic;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function TopicCard({ topic, selected, onToggle }: Props) {
  const color = topicColor(topic.id);
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(topic.id)}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex h-20 w-full items-center gap-3 overflow-hidden rounded-[12px] border bg-[#0f0f1a] px-4 text-left transition-colors"
      style={{
        borderColor: selected ? color : "#1a1a2e",
        borderWidth: selected ? 1.5 : 1,
        backgroundColor: selected
          ? `color-mix(in oklab, ${color} 10%, #0f0f1a)`
          : "#0f0f1a",
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: color, opacity: selected ? 1 : 0.5 }}
      />
      <span className="text-2xl leading-none">{topic.emoji}</span>
      <span
        className="font-sans text-sm"
        style={{ color: selected ? color : "#e8e8f0" }}
      >
        {topic.label}
      </span>
    </motion.button>
  );
}
