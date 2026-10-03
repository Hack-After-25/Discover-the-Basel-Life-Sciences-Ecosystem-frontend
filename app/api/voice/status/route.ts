import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Tells the client whether ElevenLabs is configured, so it can fall back to browser speech. */
export function GET() {
  return NextResponse.json({ elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY) });
}
