"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useNavigator } from "@/lib/store";
import { Button } from "./ui/button";

const SUGGESTIONS = ["Only investors who lead rounds", "We need BSL-3", "Add grants", "Answer in German"];

/** One-line refine box above the results. The full conversation stays in the chat panel. */
export function RefineBar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const chat = useNavigator((s) => s.chat);
  const busy = useNavigator((s) => s.chatBusy);
  const sendChat = useNavigator((s) => s.sendChat);
  const [text, setText] = useState("");
  const lastReply = [...chat].reverse().find((m) => m.role === "assistant");

  const send = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || busy) return;
    setText("");
    void sendChat(trimmed);
  };

  return (
    <div className="no-print">
      <form
        className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line bg-card py-2 pl-4 pr-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <Sparkles className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden />
        <label htmlFor="refine" className="sr-only">
          Refine your results
        </label>
        <input
          id="refine"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Refine in plain words, e.g. only investors who lead rounds"
          className="min-h-11 min-w-0 flex-[1_1_240px] bg-transparent text-[15px] outline-none placeholder:text-muted/80"
        />
        <Button type="submit" size="sm" disabled={busy || !text.trim()}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? "Updating" : "Update"}
        </Button>
      </form>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[13px]" aria-live="polite">
        {lastReply ? (
          <>
            <p className="text-muted">{lastReply.text}</p>
            <button type="button" onClick={onOpenHistory} className="font-semibold text-primary hover:text-accent">
              Show conversation
            </button>
          </>
        ) : (
          <>
            <span className="text-muted">Try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-line bg-card px-3 py-1 text-[13px] font-medium text-ink hover:border-accent"
              >
                {s}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
