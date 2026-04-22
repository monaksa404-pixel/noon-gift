import { NextRequest, NextResponse } from "next/server";
import {
  listApprovedSessions,
  listPendingReviewSessions,
  listRejectedSessions,
  updateSession,
} from "@/lib/verification-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return Boolean(token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [pendingSessions, approvedSessions, rejectedSessions] = await Promise.all([
    listPendingReviewSessions(100),
    listApprovedSessions(100),
    listRejectedSessions(100),
  ]);

  return NextResponse.json({
    success: true,
    pendingSessions,
    approvedSessions,
    rejectedSessions,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, action } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "rejected";
    const updated = await updateSession(sessionId, { status });
    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to update decision", details }, { status: 500 });
  }
}
