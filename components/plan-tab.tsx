"use client";

import { useEffect, useState } from "react";
import { CalendarClock, FlaskConical, Loader2, Printer, Square, Users, Volume2 } from "lucide-react";
import { topContacts } from "@/lib/api";
import { STAGE_LABEL } from "@/lib/entity-meta";
import { LOCALE } from "@/lib/i18n";
import { useNavigator } from "@/lib/store";
import type { RoadmapStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking } from "@/lib/voice";
import { Button } from "./ui/button";
import { EmptyState } from "./empty-state";

const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);
const GRID = "grid grid-cols-[220px_repeat(13,minmax(0,1fr))]";

export function PlanTab() {
  const plan = useNavigator((s) => s.plan);
  const profile = useNavigator((s) => s.profile);
  const matches = useNavigator((s) => s.matches);
  const openDetail = useNavigator((s) => s.openDetail);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<"idle" | "loading" | "playing">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => stopSpeaking, []);

  if (!plan || plan.steps.length === 0 || !profile) {
    return (
      <EmptyState
        title="No plan yet"
        body="Add at least one need to your profile to generate a 90-day plan."
        actionLabel="Edit profile"
        actionHref="/profile"
      />
    );
  }

  const steps = plan.steps;
  const selected = steps.find((s) => s.id === selectedId) ?? steps[0];
  const contacts = topContacts(matches, 5);
  const lab = matches.find((m) => m.needCategory === "lab_space" && m.entity.availability)?.entity;
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(LOCALE[profile.language], { day: "numeric", month: "short", year: "numeric" });

  const readAloud = async () => {
    if (speaking !== "idle") {
      stopSpeaking();
      setSpeaking("idle");
      return;
    }
    setVoiceError(null);
    setSpeaking("loading");
    try {
      const playing = speak(plan.summary, profile.language);
      setSpeaking("playing");
      await playing;
    } catch {
      setVoiceError("Voice output is not available in this browser. The summary is shown below.");
    } finally {
      setSpeaking("idle");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Your next 90 days in Basel</h2>
          <p className="print-only mt-1 text-sm text-muted">
            {profile.companyName ?? "Your team"}: {profile.teamSize} people, {STAGE_LABEL[profile.stage]},{" "}
            {profile.therapeuticArea}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant={speaking === "idle" ? "primary" : "accent"} onClick={readAloud} aria-pressed={speaking !== "idle"}>
            {speaking === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : speaking === "playing" ? (
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden />
            )}
            {speaking === "idle" ? "Read plan aloud" : "Stop reading"}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden />
            Export as PDF
          </Button>
        </div>
      </div>

      <p lang={profile.language} className="mt-4 max-w-prose rounded-xl bg-primary-soft p-4 leading-relaxed text-primary-dark">
        {plan.summary}
      </p>
      {voiceError && (
        <p role="alert" className="no-print mt-2 text-sm font-medium text-[#B42318]">
          {voiceError}
        </p>
      )}

      {/* What to act on first */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="print-plain print-avoid-break rounded-2xl border border-line bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-accent" aria-hidden />
            Contacts to reach first
          </h3>
          <ol className="mt-3 space-y-2.5 text-sm">
            {contacts.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => openDetail(e.id)}
                  className="text-left font-medium text-primary underline-offset-2 hover:underline"
                >
                  {e.name}
                </button>
                <a href={`mailto:${e.contactEmail}`} className="block break-all text-muted hover:text-ink">
                  {e.contactEmail}
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="print-plain print-avoid-break rounded-2xl border border-line bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="h-4 w-4 text-accent" aria-hidden />
            Funding deadlines
          </h3>
          {plan.deadlines.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No deadlines in the next 90 days.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {plan.deadlines.map((d) => (
                <li key={d.id}>
                  <time dateTime={d.date} className="font-semibold tabular-nums text-primary">
                    {formatDate(d.date)}
                  </time>
                  <button
                    type="button"
                    onClick={() => openDetail(d.entityId)}
                    className="block text-left font-medium underline-offset-2 hover:underline"
                  >
                    {d.title}
                  </button>
                  <span className="text-muted">{d.note}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="print-plain print-avoid-break rounded-2xl border border-line bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
            Lab space
          </h3>
          {lab ? (
            <div className="mt-3 text-sm">
              <button
                type="button"
                onClick={() => openDetail(lab.id)}
                className="text-left font-medium text-primary underline-offset-2 hover:underline"
              >
                {lab.name}
              </button>
              <p className="mt-1 font-semibold">{lab.availability}</p>
              <p className="mt-1 text-muted">{lab.facilities.slice(0, 3).join(", ")}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Lab space is not among your needs. Open Refine results and write “add lab space” to include it.
            </p>
          )}
        </section>
      </div>

      {/* Timeline */}
      <div className="print-plain mt-5 overflow-x-auto rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="min-w-[760px]">
          <div className={cn(GRID, "text-xs text-muted")}>
            <div>Week</div>
            {WEEKS.map((w) => (
              <div key={w} className="border-l border-line pb-2 pl-1.5 tabular-nums">
                {w}
              </div>
            ))}
          </div>
          <ol>
            {steps.map((step, index) => {
              const active = selected.id === step.id;
              return (
                <li key={step.id} className={cn(GRID, "items-center border-t border-line")}>
                  <button
                    type="button"
                    lang={profile.language}
                    onClick={() => setSelectedId(step.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-baseline gap-2 py-2.5 pr-3 text-left text-sm leading-snug",
                      active ? "font-semibold text-primary" : "text-ink hover:text-primary",
                    )}
                  >
                    <span className="tabular-nums text-muted">{index + 1}</span>
                    {step.title}
                  </button>
                  <div
                    className="relative grid h-full"
                    style={{ gridColumn: "span 13 / span 13", gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
                    aria-label={`Week ${step.weekStart} to week ${step.weekEnd}`}
                  >
                    {WEEKS.map((w) => (
                      <div key={w} className="border-l border-line" />
                    ))}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onClick={() => setSelectedId(step.id)}
                      className={cn(
                        "absolute top-1/2 h-5 -translate-y-1/2 rounded-full",
                        active ? "bg-accent" : "bg-primary/80 hover:bg-primary",
                      )}
                      style={{
                        left: `calc(${((step.weekStart - 1) / 13) * 100}% + 3px)`,
                        width: `calc(${((step.weekEnd - step.weekStart + 1) / 13) * 100}% - 6px)`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Selected step (screen) */}
      <div className="no-print mt-5" aria-live="polite">
        <StepDetail step={selected} number={steps.indexOf(selected) + 1} interactive />
      </div>

      {/* Full list (print) */}
      <div className="print-only mt-6 space-y-4">
        {steps.map((step, i) => (
          <StepDetail key={step.id} step={step} number={i + 1} />
        ))}
      </div>
    </div>
  );
}

function StepDetail({ step, number, interactive }: { step: RoadmapStep; number: number; interactive?: boolean }) {
  const steps = useNavigator((s) => s.plan?.steps ?? []);
  const language = useNavigator((s) => s.profile?.language ?? "en");
  const entities = useNavigator((s) => s.entities);
  const matches = useNavigator((s) => s.matches);
  const openDetail = useNavigator((s) => s.openDetail);

  const related = step.relatedEntityIds
    .map((id) => entities.find((e) => e.id === id) ?? matches.find((m) => m.entity.id === id)?.entity)
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const prerequisites = step.dependsOn
    .map((id) => steps.findIndex((s) => s.id === id))
    .filter((i) => i >= 0)
    .map((i) => i + 1)
    .sort((a, b) => a - b);

  return (
    <section className="print-plain print-avoid-break rounded-2xl border border-line bg-white p-5 shadow-card">
      <p className="text-sm text-muted">
        Step {number},{" "}
        {step.weekStart === step.weekEnd ? `week ${step.weekStart}` : `weeks ${step.weekStart} to ${step.weekEnd}`}
      </p>
      <h3 lang={language} className="mt-1 text-lg font-semibold">
        {step.title}
      </h3>
      <p lang={language} className="mt-2 max-w-prose text-sm leading-relaxed">
        {step.description}
      </p>
      {prerequisites.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          Do first: {prerequisites.length === 1 ? "step" : "steps"} {prerequisites.join(", ")}
        </p>
      )}
      {related.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold">Who to contact</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((e) => (
              <li key={e.id}>
                {interactive ? (
                  <button
                    type="button"
                    onClick={() => openDetail(e.id)}
                    className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-primary hover:border-accent"
                  >
                    {e.name}
                  </button>
                ) : (
                  <span className="text-sm">{e.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
