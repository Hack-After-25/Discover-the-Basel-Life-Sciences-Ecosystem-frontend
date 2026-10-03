"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { browserRecognition, hasElevenLabs, transcribe } from "@/lib/voice";
import type { Language } from "@/lib/types";
import { Button } from "./ui/button";

interface Props {
  /** Used only by the browser fallback. ElevenLabs detects the language itself. */
  language: Language | null;
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
}

type State = "idle" | "recording" | "transcribing";

export function MicButton({ language, onTranscript, onError }: Props) {
  const [state, setState] = useState<State>("idle");
  const [mode, setMode] = useState<"elevenlabs" | "browser" | "none" | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<ReturnType<typeof browserRecognition>>(null);

  useEffect(() => {
    let cancelled = false;
    hasElevenLabs().then((available) => {
      if (cancelled) return;
      if (available && typeof MediaRecorder !== "undefined") setMode("elevenlabs");
      else setMode(browserRecognition(null) ? "browser" : "none");
    });
    return () => {
      cancelled = true;
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
      recognition.current?.stop();
    };
  }, []);

  if (mode === null || mode === "none") return null;

  const startElevenLabs = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("transcribing");
        try {
          const text = await transcribe(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
          if (text) onTranscript(text);
          else onError("Nothing was heard. Record again and speak closer to the microphone.");
        } catch {
          onError("The recording could not be transcribed. Record again or type your description.");
        } finally {
          setState("idle");
        }
      };
      recorder.current = rec;
      rec.start();
      setState("recording");
    } catch {
      onError("Microphone access was blocked. Allow it in your browser settings, or type your description.");
    }
  };

  const startBrowser = () => {
    const rec = browserRecognition(language);
    if (!rec) return;
    let heard = "";
    rec.onresult = (event) => {
      heard = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
    };
    rec.onerror = () => onError("Speech recognition stopped. Record again or type your description.");
    rec.onend = () => {
      setState("idle");
      if (heard.trim()) onTranscript(heard.trim());
    };
    recognition.current = rec;
    rec.start();
    setState("recording");
  };

  const toggle = () => {
    if (state === "recording") {
      if (mode === "elevenlabs") recorder.current?.stop();
      else recognition.current?.stop();
      return;
    }
    if (mode === "elevenlabs") void startElevenLabs();
    else startBrowser();
  };

  return (
    <Button
      variant={state === "recording" ? "accent" : "outline"}
      size="lg"
      onClick={toggle}
      disabled={state === "transcribing"}
      aria-pressed={state === "recording"}
    >
      {state === "transcribing" ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : state === "recording" ? (
        <Square className="h-4 w-4 fill-current" aria-hidden />
      ) : (
        <Mic className="h-5 w-5" aria-hidden />
      )}
      {state === "transcribing" ? "Transcribing" : state === "recording" ? "Stop recording" : "Speak"}
    </Button>
  );
}
