"use client";

import { useEffect, useState } from "react";
import { CircleDollarSign, Download, FlaskConical, Loader2, Square, Users, Volume2 } from "lucide-react";
import { PERIODS, fundingMatches, topContacts } from "@/lib/api";
import { STAGE_LABEL, THERAPEUTIC_AREA_LABELS } from "@/lib/entity-meta";
import { HORIZON_LABEL, LOCALE } from "@/lib/i18n";
import { useNavigator } from "@/lib/store";
import type { Horizon, NeedCategory, RoadmapStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking } from "@/lib/voice";
import { Button } from "./ui/button";
import { EmptyState } from "./empty-state";

const HORIZONS: Horizon[] = ["12m", "90d"];

const CHF = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 0 });
const FUNDING_NEEDS: NeedCategory[] = ["grants", "acceleration", "investors"];

export function PlanTab({ onJumpToNeed }: { onJumpToNeed?: (need: NeedCategory) => void }) {
  const plan = useNavigator((s) => s.plan);
  const profile = useNavigator((s) => s.profile);
  const matches = useNavigator((s) => s.matches);
  const openDetail = useNavigator((s) => s.openDetail);
  const setHorizon = useNavigator((s) => s.setHorizon);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<"idle" | "loading" | "playing">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => stopSpeaking, []);

  if (!plan || plan.steps.length === 0 || !profile) {
    return (
      <EmptyState
        title="No plan yet"
        body="Add at least one need to your profile to generate a plan."
        actionLabel="Edit profile"
        actionHref="/profile"
      />
    );
  }

  const steps = plan.steps;
  const yearly = plan.horizon === "12m";
  const count = PERIODS[plan.horizon];
  const periods = Array.from({ length: count }, (_, i) => i + 1);
  const gridStyle = { gridTemplateColumns: `260px repeat(${count}, minmax(0, 1fr))` };
  const selected = steps.find((s) => s.id === selectedId) ?? steps[0];
  const contacts = topContacts(matches, 5);
  const funders = fundingMatches(matches, profile.stage, 3);
  const fundingNeed = profile.needs.find((n) => FUNDING_NEEDS.includes(n.category))?.category;
  const lab = matches.find((m) => m.needCategory === "lab_space")?.entity;
  const monthNames = periods.map((m) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + m - 1);
    return d.toLocaleDateString(LOCALE[profile.language], { month: "short" });
  });

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
          <h2 className="text-[26px] font-semibold sm:text-[30px]">Your next {yearly ? "12 months" : "90 days"} in Basel</h2>
          <p className="print-only mt-1 text-sm text-muted">
            {profile.companyName ?? "Your team"}: {profile.teamSize} people, {STAGE_LABEL[profile.stage]},{" "}
            {THERAPEUTIC_AREA_LABELS[profile.therapeuticArea]}
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Plan length" className="inline-flex gap-0.5 rounded-xl bg-subtle p-[3px]">
            {HORIZONS.map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={plan.horizon === h}
                onClick={() => {
                  if (plan.horizon === h) return;
                  setSelectedId(null);
                  void setHorizon(h);
                }}
                className={cn(
                  "h-[38px] rounded-[9px] px-3.5 text-sm",
                  plan.horizon === h
                    ? "bg-card font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    : "font-medium text-muted hover:text-ink",
                )}
              >
                {HORIZON_LABEL[h]}
              </button>
            ))}
          </div>
          <Button variant={speaking === "idle" ? "outline" : "accent"} onClick={readAloud} aria-pressed={speaking !== "idle"}>
            {speaking === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : speaking === "playing" ? (
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden />
            )}
            {speaking === "idle" ? "Read plan aloud" : "Stop reading"}
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4" aria-hidden />
            Export as PDF
          </Button>
        </div>
      </div>

      <p lang={profile.language} className="mt-4 max-w-[820px] text-base leading-[1.65] text-ink-2">
        {plan.summary}
      </p>
      {voiceError && (
        <p role="alert" className="no-print mt-2 text-sm font-medium text-[#B42318]">
          {voiceError}
        </p>
      )}

      {/* What to act on first */}
      <div className="mt-6 grid gap-3.5 lg:grid-cols-3">
        <section className="print-plain print-avoid-break rounded-[18px] border border-line bg-card p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
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
                {e.contactEmail ? (
                  <a href={`mailto:${e.contactEmail}`} className="block break-all text-muted hover:text-ink">
                    {e.contactEmail}
                  </a>
                ) : (
                  <a href={e.contactUrl || e.website} target="_blank" rel="noreferrer" className="block break-all text-muted hover:text-ink">
                    Contact via their website
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="print-plain print-avoid-break rounded-[18px] border border-line bg-card p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
            <CircleDollarSign className="h-4 w-4 text-accent" aria-hidden />
            Funding and grants
          </h3>
          {funders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              {fundingNeed
                ? "No funding match fits your stage yet."
                : "Funding is not among your needs. Open Refine results and write \u201cadd grants\u201d to include it."}
            </p>
          ) : (
            <>
              <ol className="mt-3 space-y-3.5 text-sm">
                {funders.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(e.id)}
                      className="text-left font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {e.name}
                    </button>
                    {e.fundingMaxChf ? (
                      <p className="font-mono text-[13px] tabular-nums">up to CHF {CHF.format(e.fundingMaxChf)}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {e.fundingType && (
                        <span className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">{e.fundingType}</span>
                      )}
                      {e.stageFit.length > 0 && e.stageFit.length < 6 && (
                        <span className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">
                          {e.stageFit.map((st) => STAGE_LABEL[st]).join(", ")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-muted">{e.description}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-line pt-2.5 text-xs text-muted">
                Dates change often, so check each programme&rsquo;s website for the next call.
                {fundingNeed && onJumpToNeed && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => onJumpToNeed(fundingNeed)}
                      className="no-print font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      See all funding matches
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </section>

        <section className="print-plain print-avoid-break rounded-[18px] border border-line bg-card p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
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
              <p className="mt-1 font-semibold">{lab.availability ?? "Availability: ask them directly"}</p>
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
      <div className="print-plain print-timeline mt-5 overflow-x-auto rounded-[18px] border border-line bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <span className="no-print flex gap-3.5 text-[13px] text-muted">
            <span className="flex items-center gap-1.5"><span aria-hidden className="h-2 w-[18px] rounded bg-primary" />Step</span>
            <span className="flex items-center gap-1.5"><span aria-hidden className="h-2 w-[18px] rounded bg-accent" />Selected</span>
          </span>
        </div>
        <div className="print-timeline-inner min-w-[900px]">
          <div className="grid font-mono text-xs text-muted" style={gridStyle}>
            <div className="font-sans">{yearly ? "Month" : "Week"}</div>
            {periods.map((w, i) => (
              <div key={w} className="border-l border-line pb-2 pl-1.5 tabular-nums">
                {yearly ? monthNames[i] : `W${w}`}
              </div>
            ))}
          </div>
          <ol>
            {steps.map((step, index) => {
              const active = selected.id === step.id;
              return (
                <li key={step.id} className="grid min-h-12 items-center border-t border-line" style={gridStyle}>
                  <button
                    type="button"
                    lang={profile.language}
                    onClick={() => setSelectedId(step.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-baseline gap-2 py-2.5 pr-3 text-left text-sm leading-snug",
                      active ? "font-semibold text-accent" : "text-ink hover:text-primary",
                    )}
                  >
                    <span className="font-mono text-xs tabular-nums text-muted">{index + 1}</span>
                    {step.title}
                  </button>
                  <div
                    className="relative grid h-full"
                    style={{ gridColumn: `span ${count} / span ${count}`, gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
                    aria-label={`${yearly ? "Month" : "Week"} ${step.start} to ${step.end}`}
                  >
                    {periods.map((w) => (
                      <div key={w} className="border-l border-line" />
                    ))}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onClick={() => setSelectedId(step.id)}
                      className={cn(
                        "absolute top-1/2 h-[22px] -translate-y-1/2 rounded-full",
                        active ? "bg-accent" : "bg-primary hover:opacity-90",
                      )}
                      style={{
                        left: `calc(${((step.start - 1) / count) * 100}% + 3px)`,
                        width: `calc(${((step.end - step.start + 1) / count) * 100}% - 6px)`,
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
  const unit = useNavigator((s) => (s.plan?.horizon === "90d" ? "week" : "month"));
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
    <section className="print-plain print-avoid-break rounded-[18px] border border-line bg-card p-6">
      <p className="font-mono text-xs uppercase text-accent">
        Step {number} ·{" "}
        {step.start === step.end ? `${unit} ${step.start}` : `${unit}s ${step.start} to ${step.end}`}
      </p>
      <h3 lang={language} className="mt-2 text-[22px] font-semibold">
        {step.title}
      </h3>
      <p lang={language} className="mt-2.5 max-w-prose text-[15px] leading-[1.65] text-ink-2">
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
                    className="inline-flex h-10 items-center rounded-xl border border-line bg-card px-3.5 text-sm font-medium text-ink hover:border-accent hover:text-accent"
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
