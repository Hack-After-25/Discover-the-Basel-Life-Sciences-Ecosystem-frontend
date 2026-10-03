import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Voice in: audio -> text with ElevenLabs Scribe.
 * The API key stays on the server. The language is detected automatically,
 * so a user can speak German, French or English without choosing first.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 501 });

  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "No audio received" }, { status: 400 });
  }

  const form = new FormData();
  form.append("file", file, "recording.webm");
  form.append("model_id", process.env.ELEVENLABS_STT_MODEL ?? "scribe_v2");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });
  if (!res.ok) {
    return NextResponse.json({ error: `ElevenLabs returned ${res.status}`, detail: await res.text() }, { status: 502 });
  }
  const data = (await res.json()) as { text?: string; language_code?: string };
  return NextResponse.json({ text: data.text ?? "", languageCode: data.language_code ?? null });
}
