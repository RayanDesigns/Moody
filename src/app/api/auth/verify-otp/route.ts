import { NextRequest, NextResponse } from "next/server";
import { createCustomToken } from "@/lib/firebase-admin";

const AUTHENTICA_API = "https://api.authentica.sa/api/v2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, email, otp } = body;

    const apiKey = process.env.AUTHENTICA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Authentica API key not configured" },
        { status: 500 }
      );
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "otp is required" },
        { status: 400 }
      );
    }

    const hasPhone = phone && typeof phone === "string";
    const hasEmail = email && typeof email === "string";

    if (!hasPhone && !hasEmail) {
      return NextResponse.json(
        { error: "phone or email is required" },
        { status: 400 }
      );
    }

    const payload: Record<string, string> = { otp };
    if (hasPhone) payload.phone = phone;
    if (hasEmail) payload.email = email;

    const res = await fetch(`${AUTHENTICA_API}/verify-otp`, {
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
      return NextResponse.json(
        { error: data.errors?.[0]?.message || data.message || "Invalid OTP" },
        { status: res.status }
      );
    }

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || "OTP verification failed" },
        { status: 400 }
      );
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return NextResponse.json(
        { error: "Server auth not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to .env.local (Firebase Console > Project Settings > Service Accounts > Generate new private key)." },
        { status: 503 }
      );
    }

    const uid = hasPhone
      ? `phone_${phone.replace(/\D/g, "")}`
      : `email_${email}`;

    const token = await createCustomToken(uid, hasEmail ? { email } : { phone });

    return NextResponse.json({ token, uid });
  } catch (err) {
    console.error("Verify OTP error:", err);
    const msg = err instanceof Error ? err.message : "Failed to verify OTP";
    return NextResponse.json(
      { error: msg.includes("FIREBASE") ? "Server auth not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON (see Firebase Console > Service Accounts)." : msg },
      { status: 500 }
    );
  }
}
