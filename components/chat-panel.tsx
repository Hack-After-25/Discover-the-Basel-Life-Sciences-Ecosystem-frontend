"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, X } from "lucide-react";
import { useNavigator } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const SUGGESTIONS = ["Only investors who lead rounds", "We need BSL-3", "Add grants", "Answer in German"];

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const chat = useNavigator((s) => s.chat);
  const busy = useNavigator((s) => s.chatBusy);
  const sendChat = useNavigator((s) => s.sendChat);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [chat.length, busy]);

  if (!open) return null;

  const send = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || busy) return;
    setText("");
    void sendChat(trimmed);
  };

  return (
    <aside
      aria-label="Refine results"
      className={cn(
        "no-print flex flex-col bg-white",
        // Mobile: full-screen sheet. Desktop: sticky column.
        "fixed inset-0 z-[950] lg:sticky lg:inset-auto lg:top-20 lg:z-0 lg:h-[calc(100vh-6.5rem)] lg:rounded-2xl lg:border lg:border-line",
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold">Refine results</h2>
        <Button variant="ghost" size="icon" aria-label="Close refine panel" onClick={onClose}>
          <X className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
        {chat.length === 0 && (
          <div className="text-sm text-muted">
            <p>Change your needs in plain words. Matches and the plan update after each message.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-ink hover:border-accent"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {chat.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                m.role === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-surface text-ink",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && (
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Updating matches and plan
          </p>
        )}
        <div ref={end} />
      </div>

      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Describe a change
        </label>
        <Input
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. only investors who lead rounds"
        />
        <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={busy || !text.trim()} aria-label="Send">
          <SendHorizontal className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </aside>
  );
}
