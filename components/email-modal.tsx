"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import { draftIntroEmail } from "@/lib/api";
import { useNavigator } from "@/lib/store";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input, Textarea } from "./ui/input";
import { Skeleton } from "./ui/skeleton";

export function EmailModal() {
  const emailId = useNavigator((s) => s.emailId);
  const entity = useNavigator((s) => s.entities.find((e) => e.id === s.emailId));
  const profile = useNavigator((s) => s.profile);
  const openEmail = useNavigator((s) => s.openEmail);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [copied, setCopied] = useState(false);
  // Approval guard: nothing leaves the app until the user confirms the draft.
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!emailId || !profile) return;
    let cancelled = false;
    setStatus("loading");
    setCopied(false);
    setApproved(false);
    draftIntroEmail(profile, emailId)
      .then((draft) => {
        if (cancelled) return;
        setSubject(draft.subject);
        setBody(draft.body);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [emailId, profile]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const mailto = entity
    ? `mailto:${entity.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : "#";

  return (
    <Dialog open={emailId !== null} onOpenChange={(open) => !open && openEmail(null)}>
      <DialogContent>
        <DialogTitle className="pr-8 text-lg font-semibold">Intro email{entity ? ` to ${entity.name}` : ""}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted">
          Edit the draft and approve it, then open it in your mail client. Nothing is sent from this app.
        </DialogDescription>

        {status === "loading" && (
          <div className="mt-5 space-y-3" role="status" aria-label="Drafting email">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        )}

        {status === "error" && (
          <p className="mt-5 rounded-lg bg-surface p-4 text-sm">
            The draft could not be generated. Close this window and choose "Draft intro email" again.
          </p>
        )}

        {status === "ready" && (
          <div className="mt-5 space-y-3">
            <div>
              <label htmlFor="email-subject" className="mb-1 block text-sm font-medium">
                Subject
              </label>
              <Input id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label htmlFor="email-body" className="mb-1 block text-sm font-medium">
                Message
              </label>
              <Textarea id="email-body" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-surface p-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#0E8F8A]"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />
              I have read this draft and approve contacting this organisation.
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={copy} variant="outline">
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
              {approved ? (
                <Button asChild>
                  <a href={mailto}>
                    <Send className="h-4 w-4" aria-hidden />
                    Open in mail client
                  </a>
                </Button>
              ) : (
                <Button disabled>
                  <Send className="h-4 w-4" aria-hidden />
                  Open in mail client
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
