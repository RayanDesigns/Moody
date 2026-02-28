"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useEntries } from "@/lib/hooks/use-entries";
import { formatEntryDate, formatTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function JournalListPage() {
  const { user } = useAuth();
  const { entries, loading } = useEntries(user?.uid, 50);

  const groupedEntries = entries.reduce<Record<string, typeof entries>>(
    (acc, entry) => {
      const key = formatEntryDate(entry.createdAt);
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6 pt-8 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-muted-foreground">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"} so far
          </p>
        </div>
        <Link href="/journal/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No entries yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start writing to track your emotional journey.
            </p>
            <Link href="/journal/new">
              <Button>Write Your First Entry</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedEntries).map(([dateLabel, dateEntries]) => (
          <div key={dateLabel}>
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {dateLabel}
            </h2>
            <div className="space-y-2">
              {dateEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/journal/${entry.id}`}>
                    <Card className="hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">
                            {entry.moodEmoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed line-clamp-2">
                              {entry.content
                                .replace(/<[^>]*>/g, "")
                                .slice(0, 150)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(entry.createdAt)}
                              </span>
                              {entry.sentiment && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {entry.sentiment.primaryEmotion}
                                </span>
                              )}
                              {entry.promptUsed && (
                                <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                                  Guided
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
