"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMoods } from "@/lib/hooks/use-moods";
import { useEntries } from "@/lib/hooks/use-entries";
import { MoodChart } from "@/components/mood-chart";
import { YearInPixels } from "@/components/year-in-pixels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Minus, Activity, Tag, Star, Lightbulb } from "lucide-react";
import { subDays } from "date-fns";

interface WeeklyInsights {
  trajectory: string;
  summary: string;
  topTriggers: string[];
  highlights: string[];
  suggestion: string;
}

const TRAJECTORY_ICONS: Record<string, typeof TrendingUp> = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  fluctuating: Activity,
};

export default function InsightsPage() {
  const { user } = useAuth();
  const { moods } = useMoods(user?.uid);
  const { entries } = useEntries(user?.uid, 100);
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const last7Days = moods.filter(
    (m) => new Date(m.date) >= subDays(new Date(), 7)
  );
  const last30Days = moods.filter(
    (m) => new Date(m.date) >= subDays(new Date(), 30)
  );

  const avgMood7 =
    last7Days.length > 0
      ? (last7Days.reduce((s, m) => s + m.score, 0) / last7Days.length).toFixed(1)
      : "—";
  const avgMood30 =
    last30Days.length > 0
      ? (last30Days.reduce((s, m) => s + m.score, 0) / last30Days.length).toFixed(1)
      : "—";

  const allTriggers = entries
    .filter((e) => e.sentiment?.triggers)
    .flatMap((e) => e.sentiment!.triggers);
  const triggerCounts = allTriggers.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  async function generateInsights() {
    setLoadingInsights(true);
    try {
      const weekEntries = entries.filter(
        (e) => e.createdAt >= subDays(new Date(), 7)
      );
      const weekMoods = last7Days;

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: weekEntries.map((e) => ({
            content: e.content,
            moodScore: e.moodScore,
            createdAt: e.createdAt.toISOString(),
            sentiment: e.sentiment,
          })),
          moods: weekMoods,
        }),
      });

      if (res.ok) {
        setInsights(await res.json());
      }
    } catch {
      // silent fail
    } finally {
      setLoadingInsights(false);
    }
  }

  useEffect(() => {
    if (entries.length > 0 && !insights) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const TrajectoryIcon = insights
    ? TRAJECTORY_ICONS[insights.trajectory] || Activity
    : Activity;

  return (
    <div className="space-y-6 pt-8 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">
          Patterns and trends from your journaling journey
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{avgMood7}</p>
            <p className="text-xs text-muted-foreground">Avg Mood (7d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-secondary">{avgMood30}</p>
            <p className="text-xs text-muted-foreground">Avg Mood (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{entries.length}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{moods.length}</p>
            <p className="text-xs text-muted-foreground">Days Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="7d">
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
            </TabsList>
            <TabsContent value="7d">
              <MoodChart moods={last7Days} />
            </TabsContent>
            <TabsContent value="30d">
              <MoodChart moods={last30Days} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Year in Pixels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Year in Pixels</CardTitle>
        </CardHeader>
        <CardContent>
          <YearInPixels moods={moods} />
        </CardContent>
      </Card>

      {/* Trigger Patterns */}
      {topTriggers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Top Stress Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTriggers.map(([trigger, count]) => (
                <div key={trigger} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize">{trigger}</span>
                      <span className="text-xs text-muted-foreground">
                        {count}x
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-destructive/60"
                        style={{
                          width: `${(count / topTriggers[0][1]) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly AI Insights */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Weekly Insights
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={loadingInsights || entries.length === 0}
            >
              {loadingInsights ? "Generating..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!insights && !loadingInsights && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {entries.length === 0
                ? "Start journaling to unlock AI-powered weekly insights."
                : "Generating your insights..."}
            </p>
          )}

          {loadingInsights && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          )}

          {insights && !loadingInsights && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrajectoryIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium capitalize">
                  {insights.trajectory}
                </span>
              </div>

              <p className="text-sm leading-relaxed">{insights.summary}</p>

              {insights.highlights.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Star className="h-3 w-3" /> Highlights
                  </p>
                  <ul className="space-y-1">
                    {insights.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-1">•</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.suggestion && (
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary flex items-center gap-1 mb-1">
                    <Lightbulb className="h-3 w-3" /> Suggestion
                  </p>
                  <p className="text-sm">{insights.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
