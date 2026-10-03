import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_CHARS = 2500;

/** Voice out: text -> speech (MP3) with ElevenLabs. The multilingual model handles DE, FR and EN. */
export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not set" }, { status: 501 });
  }

  const { text } = (await request.json()) as { text?: string };
  if (!text?.trim()) return NextResponse.json({ error: "No text received" }, { status: 400 });

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: text.slice(0, MAX_CHARS),
      model_id: process.env.ELEVENLABS_TTS_MODEL ?? "eleven_multilingual_v2",
    }),
  });
  if (!res.ok || !res.body) {
    return NextResponse.json({ error: `ElevenLabs returned ${res.status}`, detail: await res.text() }, { status: 502 });
  }
  return new Response(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}
