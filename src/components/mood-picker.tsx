"use client";

import { cn } from "@/lib/utils";
import { MOOD_OPTIONS } from "@/types";
import { motion } from "framer-motion";

interface MoodPickerProps {
  selected: number | null;
  onSelect: (score: number, emoji: string) => void;
  size?: "sm" | "lg";
}

export function MoodPicker({ selected, onSelect, size = "lg" }: MoodPickerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {MOOD_OPTIONS.map((mood) => (
        <motion.button
          key={mood.score}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(mood.score, mood.emoji)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl p-3 transition-all cursor-pointer",
            size === "lg" ? "text-3xl" : "text-xl p-2",
            selected === mood.score
              ? "bg-primary/10 ring-2 ring-primary shadow-sm"
              : "hover:bg-muted"
          )}
        >
          <span className={size === "lg" ? "text-4xl" : "text-2xl"}>
            {mood.emoji}
          </span>
          <span
            className={cn(
              "font-medium",
              size === "lg" ? "text-xs" : "text-[10px]",
              selected === mood.score
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {mood.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
