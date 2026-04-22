import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/verification-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const session = await createSession(phone);
    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to start verification", details }, { status: 500 });
  }
}
