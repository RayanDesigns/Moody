"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { getEntry } from "@/lib/hooks/use-entries";
import { AIResponseCard } from "@/components/ai-response-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { formatEntryDate, formatTime, getMoodColor } from "@/lib/utils";
import { MOOD_OPTIONS } from "@/types";
import type { JournalEntry } from "@/types";

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    getEntry(user.uid, id).then((e) => {
      setEntry(e);
      setLoading(false);
    });
  }, [user, id]);

  if (loading) {
    return (
      <div className="space-y-4 pt-8 md:pt-0">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="pt-8 md:pt-0 text-center py-16">
        <p className="text-muted-foreground">Entry not found.</p>
        <Link href="/journal">
          <Button variant="link" className="mt-2">
            Back to Journal
          </Button>
        </Link>
      </div>
    );
  }

  const mood = MOOD_OPTIONS.find((m) => m.score === entry.moodScore);

  return (
    <div className="space-y-6 pt-8 md:pt-0">
      <div className="flex items-center gap-4">
        <Link href="/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Journal Entry</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatEntryDate(entry.createdAt)} at {formatTime(entry.createdAt)}
          </div>
        </div>
      </div>

      {/* Mood Badge */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{ backgroundColor: getMoodColor(entry.moodScore) + "20" }}
        >
          <span className="text-2xl">{entry.moodEmoji}</span>
          <span className="text-sm font-medium" style={{ color: getMoodColor(entry.moodScore) }}>
            Feeling {mood?.label}
          </span>
        </div>
      </div>

      {/* Prompt used */}
      {entry.promptUsed && (
        <p className="text-sm italic text-muted-foreground border-l-2 border-secondary pl-3">
          Prompt: &ldquo;{entry.promptUsed}&rdquo;
        </p>
      )}

      {/* Entry Content */}
      <Card>
        <CardContent className="p-6">
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      {entry.sentiment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emotional Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div
                  className="text-3xl font-bold"
                  style={{ color: getMoodColor(entry.sentiment.score) }}
                >
                  {entry.sentiment.score}/5
                </div>
                <p className="text-xs text-muted-foreground">Sentiment</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">
                  {entry.sentiment.primaryEmotion}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.sentiment.summary}
                </p>
              </div>
            </div>

            {entry.sentiment.emotions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Detected emotions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.sentiment.emotions.map((emotion) => (
                    <span
                      key={emotion}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.sentiment.triggers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Identified triggers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.sentiment.triggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {entry.aiResponse && <AIResponseCard response={entry.aiResponse} />}
    </div>
  );
}
