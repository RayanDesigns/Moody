"use client";

import { format, eachDayOfInterval, startOfYear, endOfYear, getDay, getWeek } from "date-fns";
import { cn, getMoodColor } from "@/lib/utils";
import type { MoodRecord } from "@/types";

interface YearInPixelsProps {
  moods: MoodRecord[];
  year?: number;
}

export function YearInPixels({ moods, year = new Date().getFullYear() }: YearInPixelsProps) {
  const moodMap = new Map(moods.map((m) => [m.date, m]));

  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  const days = eachDayOfInterval({ start, end });

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  const firstDayOffset = getDay(start);
  for (let i = 0; i < firstDayOffset; i++) {
    currentWeek.push(null);
  }

  days.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-2">
      <div className="flex gap-[3px] ml-6 text-[10px] text-muted-foreground">
        {MONTHS.map((m) => (
          <span key={m} className="flex-1 text-center">{m}</span>
        ))}
      </div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="h-[12px] leading-[12px] text-center w-4">
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px] flex-1 overflow-hidden">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="h-[12px] w-[12px]" />;
                }
                const dateStr = format(day, "yyyy-MM-dd");
                const mood = moodMap.get(dateStr);
                return (
                  <div
                    key={di}
                    title={`${format(day, "MMM d")}: ${mood ? `${mood.emoji} (${mood.score}/5)` : "No entry"}`}
                    className={cn(
                      "h-[12px] w-[12px] rounded-[2px] transition-colors",
                      mood ? "" : "bg-muted"
                    )}
                    style={mood ? { backgroundColor: getMoodColor(mood.score) } : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[1, 2, 3, 4, 5].map((score) => (
          <div
            key={score}
            className="h-[12px] w-[12px] rounded-[2px]"
            style={{ backgroundColor: getMoodColor(score) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
