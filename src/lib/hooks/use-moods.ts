"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { todayString } from "@/lib/utils";
import type { MoodRecord } from "@/types";

export function useMoods(userId: string | undefined) {
  const [moods, setMoods] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setMoods([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", userId, "moods"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMoods(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            date: d.id,
            score: data.score,
            emoji: data.emoji,
            note: data.note,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          };
        })
      );
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  return { moods, loading };
}

export async function recordMood(
  userId: string,
  mood: { score: number; emoji: string; note?: string }
) {
  const date = todayString();
  await setDoc(doc(db, "users", userId, "moods", date), {
    ...mood,
    createdAt: Timestamp.now(),
  });
  return date;
}
