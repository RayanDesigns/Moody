import { NextRequest, NextResponse } from "next/server";

const AUTHENTICA_API = "https://api.authentica.sa/api/v2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, phone, email, template_id } = body;

    const apiKey = process.env.AUTHENTICA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Authentica API key not configured" },
        { status: 500 }
      );
    }

    if (!method || !["sms", "whatsapp", "email"].includes(method)) {
      return NextResponse.json(
        { error: "method must be sms, whatsapp, or email" },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      method,
      template_id: template_id ?? 1,
    };

    if (method === "email") {
      if (!email || typeof email !== "string") {
        return NextResponse.json(
          { error: "email is required for email OTP" },
          { status: 400 }
        );
      }
      payload.email = email;
    } else {
      if (!phone || typeof phone !== "string") {
        return NextResponse.json(
          { error: "phone is required for SMS/WhatsApp OTP" },
          { status: 400 }
        );
      }
      if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
        return NextResponse.json(
          { error: "phone must be in E.164 format (e.g. +966551234567)" },
          { status: 400 }
        );
      }
      payload.phone = phone;
    }

    const res = await fetch(`${AUTHENTICA_API}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Authorization": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.errors?.[0]?.message || data.message || "Failed to send OTP";
      if (msg.toLowerCase().includes("channel") && msg.toLowerCase().includes("enabled")) {
        return NextResponse.json(
          { error: "Email/SMS channel not enabled. Enable it in Authentica dashboard: portal.authentica.sa" },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: msg },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, message: data.message || "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    const msg = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
