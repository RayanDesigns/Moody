"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMoods, recordMood } from "@/lib/hooks/use-moods";
import { useEntries } from "@/lib/hooks/use-entries";
import { calculateStreak, todayString, formatEntryDate, formatTime } from "@/lib/utils";
import { MoodPicker } from "@/components/mood-picker";
import { StreakCounter } from "@/components/streak-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JOURNAL_PROMPTS } from "@/lib/prompts";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { moods } = useMoods(user?.uid);
  const { entries } = useEntries(user?.uid, 5);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [prompt, setPrompt] = useState("");

  const todayMood = moods.find((m) => m.date === todayString());

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.score);
      setSelectedEmoji(todayMood.emoji);
      setCheckedIn(true);
    }
  }, [todayMood]);

  useEffect(() => {
    setPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
  }, []);

  async function handleCheckIn(score: number, emoji: string) {
    if (!user) return;
    setSelectedMood(score);
    setSelectedEmoji(emoji);

    await recordMood(user.uid, { score, emoji });

    if (profile) {
      const { newStreak } = calculateStreak(
        profile.lastCheckInDate || null,
        profile.currentStreak
      );
      const longestStreak = Math.max(newStreak, profile.longestStreak);
      await updateDoc(doc(db, "users", user.uid), {
        currentStreak: newStreak,
        longestStreak,
        lastCheckInDate: todayString(),
      });
      await refreshProfile();
    }

    setCheckedIn(true);
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.displayName?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground mt-1">
            How are you feeling today?
          </p>
        </div>
        <StreakCounter streak={profile?.currentStreak || 0} />
      </div>

      {/* Mood Check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodPicker
            selected={selectedMood}
            onSelect={handleCheckIn}
          />
          <AnimatePresence>
            {checkedIn && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-sm text-muted-foreground"
              >
                {selectedEmoji} Recorded! {todayMood ? "Updated your mood." : "Great job checking in today."}
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Quick Journal Prompt */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">
                Today&apos;s prompt
              </p>
              <p className="text-sm text-muted-foreground italic mb-3">
                &ldquo;{prompt}&rdquo;
              </p>
              <Link href={`/journal/new?prompt=${encodeURIComponent(prompt)}`}>
                <Button size="sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Writing
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
            <Link href="/journal" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {entries.slice(0, 3).map((entry) => (
              <Link key={entry.id} href={`/journal/${entry.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.moodEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.content.replace(/<[^>]*>/g, "").slice(0, 80)}
                          {entry.content.length > 80 ? "..." : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatEntryDate(entry.createdAt)} at{" "}
                          {formatTime(entry.createdAt)}
                        </p>
                      </div>
                      {entry.sentiment && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {entry.sentiment.primaryEmotion}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
