import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { INSIGHTS_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { entries, moods } = await req.json();

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Entries array is required" },
        { status: 400 }
      );
    }

    const entrySummaries = entries.map(
      (e: { content: string; moodScore: number; createdAt: string; sentiment?: { primaryEmotion: string } }, i: number) =>
        `Entry ${i + 1} (mood: ${e.moodScore}/5, ${e.sentiment?.primaryEmotion || "unanalyzed"}):\n${e.content.replace(/<[^>]*>/g, "").slice(0, 300)}`
    );

    const moodSummary = moods
      ?.map((m: { date: string; score: number; emoji: string }) => `${m.date}: ${m.emoji} (${m.score}/5)`)
      .join(", ");

    const openai = getOpenAIClient();

    const result = await openai.chat.completions.create({
      model: "gpt-5-nano",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INSIGHTS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here are this week's journal entries and mood data:\n\n${entrySummaries.join("\n\n")}\n\nMood check-ins: ${moodSummary || "none"}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    let insights;
    try {
      insights = JSON.parse(result.choices[0].message.content || "{}");
    } catch {
      insights = {
        trajectory: "stable",
        summary: "Keep journaling — patterns become clearer over time.",
        topTriggers: [],
        highlights: [],
        suggestion: "Try writing a bit more each day to help identify patterns.",
      };
    }

    return NextResponse.json(insights);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; code?: string };
    console.error("Insights API error:", err.message, err.code, err.status);

    const isQuota = err.code === "insufficient_quota" || err.status === 429;
    return NextResponse.json(
      {
        error: isQuota
          ? "AI service is temporarily unavailable. Please try again later."
          : "Failed to generate insights",
      },
      { status: isQuota ? 503 : 500 }
    );
  }
}
