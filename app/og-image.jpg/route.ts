import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const imagePath = path.join(process.cwd(), "images", "img9.jpeg");
    const imageBuffer = await fs.readFile(imagePath);
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to load OG image:", error);
    return NextResponse.json({ error: "OG image not found" }, { status: 404 });
  }
}
