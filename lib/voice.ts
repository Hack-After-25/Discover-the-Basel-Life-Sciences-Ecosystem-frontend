"use client";

import { LOCALE } from "./i18n";
import type { Language } from "./types";

/**
 * Voice helpers. ElevenLabs is used through the /api/voice routes when a key
 * is configured. Otherwise the browser's own speech APIs are used, which also
 * serves as the fallback if the network fails during a demo.
 */

let elevenLabsAvailable: Promise<boolean> | null = null;

export function hasElevenLabs(): Promise<boolean> {
  elevenLabsAvailable ??= fetch("/api/voice/status")
    .then((r) => r.json())
    .then((d: { elevenlabs?: boolean }) => Boolean(d.elevenlabs))
    .catch(() => false);
  return elevenLabsAvailable;
}

/* ----------------------------- Voice in ----------------------------- */

export async function transcribe(audio: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", audio, "recording.webm");
  const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Transcription failed with ${res.status}`);
  const data = (await res.json()) as { text: string };
  return data.text.trim();
}

interface BrowserRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function browserRecognition(language: Language | null): BrowserRecognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserRecognition;
    webkitSpeechRecognition?: new () => BrowserRecognition;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = language ? LOCALE[language] : navigator.language;
  recognition.interimResults = false;
  recognition.continuous = true;
  return recognition;
}

/* ----------------------------- Voice out ---------------------------- */

let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  currentAudio?.pause();
  currentAudio = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Speaks the text and resolves when playback ends. */
export async function speak(text: string, language: Language): Promise<void> {
  stopSpeaking();

  if (await hasElevenLabs()) {
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`Speech failed with ${res.status}`);
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      currentAudio = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onpause = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().catch(reject);
      }).finally(() => URL.revokeObjectURL(url));
      return;
    } catch {
      // Fall through to browser speech.
    }
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("No speech output available in this browser");
  }
  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE[language];
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
