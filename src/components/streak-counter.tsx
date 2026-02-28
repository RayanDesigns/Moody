"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5",
        className
      )}
    >
      <Flame
        className={cn(
          "h-5 w-5",
          streak > 0 ? "text-accent" : "text-muted-foreground"
        )}
      />
      <span className="text-sm font-semibold text-accent-foreground">
        {streak} day{streak !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
