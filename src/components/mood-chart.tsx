"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { MoodRecord } from "@/types";
import { MOOD_OPTIONS } from "@/types";

interface MoodChartProps {
  moods: MoodRecord[];
}

export function MoodChart({ moods }: MoodChartProps) {
  const data = [...moods]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date,
      label: format(parseISO(m.date), "MMM d"),
      score: m.score,
      emoji: m.emoji,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
        No mood data yet. Start checking in daily!
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; score: number; emoji: string } }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const mood = MOOD_OPTIONS.find((m) => m.score === d.score);
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm">
        <p className="text-sm font-medium">{d.label}</p>
        <p className="text-sm text-muted-foreground">
          {d.emoji} {mood?.label} ({d.score}/5)
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--primary)"
          strokeWidth={2.5}
          dot={{ fill: "var(--primary)", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
