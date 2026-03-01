import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { COMPANION_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const result = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: COMPANION_SYSTEM_PROMPT },
        ...messages.slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply =
      result.choices[0].message.content ||
      "I'm here for you. Would you like to tell me more?";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; code?: string };
    console.error("Chat API error:", err.message, err.code, err.status);

    const isQuota = err.code === "insufficient_quota" || err.status === 429;
    return NextResponse.json(
      {
        error: isQuota
          ? "AI service is temporarily unavailable. Please try again later."
          : "Failed to generate response",
      },
      { status: isQuota ? 503 : 500 }
    );
  }
}
