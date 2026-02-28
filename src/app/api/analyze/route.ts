import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { SENTIMENT_SYSTEM_PROMPT, COMPANION_SYSTEM_PROMPT } from "@/lib/prompts";

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

    const [sentimentResult, companionResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SENTIMENT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Journal entry (user self-reported mood: ${moodScore}/5):\n\n${plainText}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: COMPANION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `I just wrote this journal entry. My self-reported mood is ${moodScore}/5:\n\n${plainText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    ]);

    let sentiment;
    try {
      sentiment = JSON.parse(
        sentimentResult.choices[0].message.content || "{}"
      );
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
      companionResult.choices[0].message.content ||
      "Thank you for sharing. I'm here whenever you need to talk.";

    return NextResponse.json({ sentiment, aiResponse });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze entry" },
      { status: 500 }
    );
  }
}
