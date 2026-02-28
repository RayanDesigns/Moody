"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { createEntry, updateEntry } from "@/lib/hooks/use-entries";
import { JournalEditor } from "@/components/journal-editor";
import { MoodPicker } from "@/components/mood-picker";
import { AIResponseCard } from "@/components/ai-response-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JOURNAL_PROMPTS } from "@/lib/prompts";
import { ArrowLeft, Send, Shuffle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [moodEmoji, setMoodEmoji] = useState("");
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    if (!prompt) {
      setPrompt(
        JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]
      );
    }
  }, [prompt]);

  function shufflePrompt() {
    const filtered = JOURNAL_PROMPTS.filter((p) => p !== prompt);
    setPrompt(filtered[Math.floor(Math.random() * filtered.length)]);
  }

  async function handleSave() {
    if (!user || !content.trim() || moodScore === null) return;

    setSaving(true);
    try {
      const entryId = await createEntry(user.uid, {
        content,
        moodScore,
        moodEmoji,
        promptUsed: prompt || undefined,
      });

      setAnalyzing(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, moodScore }),
      });

      if (res.ok) {
        const data = await res.json();
        await updateEntry(user.uid, entryId, {
          sentiment: data.sentiment,
          aiResponse: data.aiResponse,
        });
        setAiResponse(data.aiResponse);
        setAnalyzing(false);

        setTimeout(() => router.push(`/journal/${entryId}`), 2000);
      } else {
        setAnalyzing(false);
        router.push(`/journal/${entryId}`);
      }
    } catch {
      setSaving(false);
      setAnalyzing(false);
    }
  }

  const plainText = content.replace(/<[^>]*>/g, "").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const canSave = plainText.length > 0 && moodScore !== null;

  return (
    <div className="space-y-6 pt-8 md:pt-0">
      <div className="flex items-center gap-4">
        <Link href="/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Entry</h1>
      </div>

      {/* Prompt Card */}
      {prompt && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{prompt}&rdquo;
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={shufflePrompt}
                className="shrink-0"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            How are you feeling right now?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MoodPicker
            selected={moodScore}
            onSelect={(score, emoji) => {
              setMoodScore(score);
              setMoodEmoji(emoji);
            }}
            size="sm"
          />
        </CardContent>
      </Card>

      {/* Editor */}
      <JournalEditor
        content={content}
        onChange={setContent}
        placeholder="Start writing about your day, thoughts, or feelings..."
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? (
            analyzing ? "Analyzing..." : "Saving..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Save & Analyze
            </>
          )}
        </Button>
      </div>

      {/* AI Response */}
      <AIResponseCard response={aiResponse} isLoading={analyzing} />
    </div>
  );
}
