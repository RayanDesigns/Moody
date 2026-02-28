"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { JournalEntry, SentimentAnalysis } from "@/types";

function docToEntry(id: string, data: Record<string, unknown>): JournalEntry {
  return {
    id,
    content: data.content as string,
    moodScore: data.moodScore as number,
    moodEmoji: data.moodEmoji as string,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    sentiment: (data.sentiment as SentimentAnalysis) || null,
    aiResponse: (data.aiResponse as string) || null,
    promptUsed: (data.promptUsed as string) || null,
  };
}

export function useEntries(userId: string | undefined, count = 20) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", userId, "entries"),
      orderBy("createdAt", "desc"),
      limit(count)
    );

    const unsub = onSnapshot(q, (snap) => {
      setEntries(
        snap.docs.map((d) =>
          docToEntry(d.id, d.data() as Record<string, unknown>)
        )
      );
      setLoading(false);
    });

    return unsub;
  }, [userId, count]);

  return { entries, loading };
}

export async function createEntry(
  userId: string,
  data: {
    content: string;
    moodScore: number;
    moodEmoji: string;
    promptUsed?: string;
  }
) {
  const ref = await addDoc(collection(db, "users", userId, "entries"), {
    ...data,
    createdAt: Timestamp.now(),
    sentiment: null,
    aiResponse: null,
  });
  return ref.id;
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: Partial<JournalEntry>
) {
  const ref = doc(db, "users", userId, "entries", entryId);
  await updateDoc(ref, data as Record<string, unknown>);
}

export async function getEntry(
  userId: string,
  entryId: string
): Promise<JournalEntry | null> {
  const ref = doc(db, "users", userId, "entries", entryId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToEntry(snap.id, snap.data() as Record<string, unknown>);
}
