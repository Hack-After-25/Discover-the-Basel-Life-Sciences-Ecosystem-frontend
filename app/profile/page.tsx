"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import {
  NEED_CATEGORIES,
  NEED_META,
  NEED_TO_ENTITY_TYPE,
  STAGES,
  STAGE_LABEL,
  THERAPEUTIC_AREAS,
  THERAPEUTIC_AREA_LABELS,
  TYPE_META,
} from "@/lib/entity-meta";
import { useHydrated, useNavigator } from "@/lib/store";
import { LANGUAGES, LANGUAGE_LABEL } from "@/lib/i18n";
import type { Language, NeedCategory, Profile, Stage } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { FlowSteps } from "@/components/flow-steps";
import { RegionSelect } from "@/components/region-select";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useNavigator((s) => s.profile);
  const setProfile = useNavigator((s) => s.setProfile);
  const runAnalysis = useNavigator((s) => s.runAnalysis);
  const analysing = useNavigator((s) => s.analysing);
  const needText = useNavigator((s) => s.needText);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="No profile yet"
          body="Describe your team and needs first. Your profile appears here for you to check."
          actionLabel="Describe your needs"
          actionHref="/"
        />
      </div>
    );
  }

  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });
  const unused = NEED_CATEGORIES.filter((c) => !profile.needs.some((n) => n.category === c));
  const kind = profile.userKind ?? "startup";

  const addNeed = (category: NeedCategory) =>
    update({
      needs: [...profile.needs, { id: uid("need"), category, detail: NEED_META[category].defaultDetail }],
    });

  const confirm = async () => {
    await runAnalysis();
    router.push("/results");
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-7 sm:px-8">
      <FlowSteps current={1} />
      <h1 className="mt-7 text-[30px] font-semibold sm:text-4xl">Check what we understood</h1>
      <p className="mt-2 text-base text-muted">Correct anything that is off. Your matches and plan are built from this profile.</p>

      <div className="mt-7 flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-5">
          <section className="rounded-[18px] border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Your team</h2>
              <div role="group" aria-label="You are" className="inline-flex gap-0.5 rounded-xl bg-[#EEF0F3] p-[3px]">
                {(
                  [
                    ["startup", "Startup or company"],
                    ["service_provider", "Service provider"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={kind === value}
                    onClick={() => update({ userKind: value })}
                    className={cn(
                      "h-9 rounded-[9px] px-3 text-[13px]",
                      kind === value
                        ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                        : "font-medium text-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Company name (optional)" id="company">
                <Input
                  id="company"
                  value={profile.companyName ?? ""}
                  placeholder="e.g. Helix Bio"
                  onChange={(e) => update({ companyName: e.target.value || undefined })}
                />
              </Field>
              <Field label="Team size" id="team">
                <Input
                  id="team"
                  type="number"
                  min={1}
                  max={5000}
                  className="font-mono"
                  value={profile.teamSize}
                  onChange={(e) => update({ teamSize: Math.max(1, Number(e.target.value) || 1) })}
                />
              </Field>
              <Field label="Stage" id="stage">
                <Select id="stage" value={profile.stage} onChange={(e) => update({ stage: e.target.value as Stage })}>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Field" id="area">
                <Select id="area" value={profile.therapeuticArea} onChange={(e) => update({ therapeuticArea: e.target.value })}>
                  {THERAPEUTIC_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {THERAPEUTIC_AREA_LABELS[a]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Where to look" id="region">
                <RegionSelect
                  id="region"
                  value={profile.cantonFilter ?? ""}
                  onChange={(value) => update({ cantonFilter: value || undefined })}
                />
              </Field>
              <Field label="Answer language" id="language">
                <Select id="language" value={profile.language} onChange={(e) => update({ language: e.target.value as Language })}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {LANGUAGE_LABEL[l]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <section className="rounded-[18px] border border-line bg-white p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">What you need</h2>
              <span className="font-mono text-[13px] text-muted">
                {profile.needs.length} {profile.needs.length === 1 ? "need" : "needs"}
              </span>
            </div>
            {profile.needs.length === 0 ? (
              <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted">
                No needs listed. Add at least one below to get matches.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {profile.needs.map((need) => (
                  <li
                    key={need.id}
                    className="flex flex-col gap-2.5 rounded-[14px] border border-[#EEF0F3] bg-[#F8F9FB] p-2.5 sm:flex-row sm:items-center"
                  >
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2 text-sm font-semibold sm:w-52">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: TYPE_META[NEED_TO_ENTITY_TYPE[need.category]].color }}
                      />
                      {NEED_META[need.category].label}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        aria-label={`Detail for ${NEED_META[need.category].label}`}
                        value={need.detail}
                        onChange={(e) =>
                          update({
                            needs: profile.needs.map((n) => (n.id === need.id ? { ...n, detail: e.target.value } : n)),
                          })
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Remove ${NEED_META[need.category].label}`}
                        onClick={() => update({ needs: profile.needs.filter((n) => n.id !== need.id) })}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {unused.length > 0 && (
              <div className="mt-5">
                <h3 className="text-[13px] font-semibold text-[#3A4352]">Add a need</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {unused.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => addNeed(c)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-dashed border-[#C9CED6] bg-white px-3 text-[13px] font-medium hover:border-accent hover:text-accent"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                        {NEED_META[c].label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="lg" onClick={confirm} disabled={analysing || profile.needs.length === 0}>
              {analysing && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
              {analysing ? "Finding matches" : "Show my matches"}
              {!analysing && <ArrowRight className="h-[18px] w-[18px]" aria-hidden />}
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/")}>
              Edit description
            </Button>
          </div>
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          {needText.trim() && (
            <div className="rounded-[18px] bg-primary-dark p-6 text-white">
              <h2 className="text-sm font-semibold text-[#99F6E4]">What you wrote</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#DCE4F3]">“{needText.trim()}”</p>
            </div>
          )}
          <div className="rounded-[18px] border border-line bg-white p-6">
            <h2 className="text-sm font-semibold">How matching works</h2>
            <ul className="mt-2.5 list-disc space-y-1 pl-[18px] text-sm leading-relaxed text-muted">
              <li>Each need is matched to organisations that offer it.</li>
              <li>Your field and stage raise the score.</li>
              <li>Every match shows its reason and source.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  children,
  className,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[#3A4352]">
        {label}
      </label>
      {children}
    </div>
  );
}
