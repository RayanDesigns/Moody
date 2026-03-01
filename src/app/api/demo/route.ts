import { NextRequest, NextResponse } from "next/server";

interface DemoResult {
  emoji: string;
  emotions: string[];
  suggestion: string;
  score: number;
}

const KEYWORD_MAP: { keywords: string[]; result: DemoResult }[] = [
  {
    keywords: ["exhausted", "tired", "can't focus", "fatigue", "drained", "burned out", "burnout"],
    result: {
      emoji: "😔",
      emotions: ["Fatigue", "Mental Exhaustion"],
      suggestion: "Try a 5-minute breathing exercise to reset your focus.",
      score: 2,
    },
  },
  {
    keywords: ["anxious", "anxiety", "worried", "nervous", "panic", "scared", "fear"],
    result: {
      emoji: "😰",
      emotions: ["Anxiety", "Worry"],
      suggestion: "Ground yourself: name 5 things you can see right now.",
      score: 2,
    },
  },
  {
    keywords: ["stressed", "overwhelmed", "pressure", "too much", "can't handle", "deadline"],
    result: {
      emoji: "😮‍💨",
      emotions: ["Stress", "Overwhelm"],
      suggestion: "Break your tasks into smaller pieces. Start with just one.",
      score: 2,
    },
  },
  {
    keywords: ["sad", "crying", "lonely", "alone", "depressed", "hopeless", "empty"],
    result: {
      emoji: "😢",
      emotions: ["Sadness", "Loneliness"],
      suggestion: "You're not alone in this. Try writing a letter to yourself with compassion.",
      score: 1,
    },
  },
  {
    keywords: ["angry", "frustrated", "irritated", "annoyed", "mad", "furious"],
    result: {
      emoji: "😤",
      emotions: ["Frustration", "Anger"],
      suggestion: "Notice where you feel this in your body. Take 3 slow breaths.",
      score: 2,
    },
  },
  {
    keywords: ["happy", "good", "great", "wonderful", "grateful", "thankful", "joy", "excited"],
    result: {
      emoji: "😊",
      emotions: ["Joy", "Gratitude"],
      suggestion: "Savor this moment. Write down what made today good.",
      score: 5,
    },
  },
  {
    keywords: ["confused", "lost", "don't know", "uncertain", "stuck", "directionless"],
    result: {
      emoji: "🌫️",
      emotions: ["Confusion", "Uncertainty"],
      suggestion: "Clarity comes from writing. Try: 'Right now, I wish I knew...'",
      score: 3,
    },
  },
  {
    keywords: ["numb", "nothing", "don't feel", "disconnected", "flat"],
    result: {
      emoji: "😶",
      emotions: ["Emotional Numbness", "Detachment"],
      suggestion: "That's valid. Try describing your day in pure sensory detail — what you saw, heard, tasted.",
      score: 2,
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const lower = text.toLowerCase();

    for (const entry of KEYWORD_MAP) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return NextResponse.json(entry.result);
      }
    }

    return NextResponse.json({
      emoji: "🤔",
      emotions: ["Processing", "Reflection"],
      suggestion: "Tell me more — the deeper you go, the more patterns emerge.",
      score: 3,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze" },
      { status: 500 }
    );
  }
}
