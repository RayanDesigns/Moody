import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { SENTIMENT_SYSTEM_PROMPT, MOODY_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { content, moodScore } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const plainText = content.replace(/<[^>]*>/g, "");
    const ai = getGeminiClient();

    const [sentimentResult, companionResult] = await Promise.all([
      ai.models.generateContent({
        model: GEMINI_MODEL,
        config: {
          systemInstruction: SENTIMENT_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 500,
        },
        contents: `Journal entry (user self-reported mood: ${moodScore}/5):\n\n${plainText}`,
      }),
      ai.models.generateContent({
        model: GEMINI_MODEL,
        config: {
          systemInstruction: MOODY_SYSTEM_PROMPT,
          temperature: 0.8,
          maxOutputTokens: 300,
        },
        contents: `I just wrote this journal entry. My self-reported mood is ${moodScore}/5:\n\n${plainText}`,
      }),
    ]);

    let sentiment;
    try {
      sentiment = JSON.parse(sentimentResult.text || "{}");
    } catch {
      sentiment = {
        score: moodScore,
        primaryEmotion: "unknown",
        emotions: [],
        triggers: [],
        summary: "Unable to analyze sentiment.",
      };
    }

    const aiResponse =
      companionResult.text || "Thank you for sharing. I'm here whenever you need to talk.";

    return NextResponse.json({ sentiment, aiResponse });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; code?: string };
    console.error("Analyze API error:", err.message, err.code, err.status);

    return NextResponse.json(
      { error: "Failed to analyze entry" },
      { status: 500 }
    );
  }
}
