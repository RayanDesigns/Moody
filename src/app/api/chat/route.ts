import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { MOODY_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const history = messages.slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: MOODY_SYSTEM_PROMPT,
        temperature: 0.8,
        maxOutputTokens: 400,
      },
      contents: history,
    });

    const reply = result.text || "I'm here for you. Would you like to tell me more?";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; code?: string };
    console.error("Chat API error:", err.message, err.code, err.status);

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
