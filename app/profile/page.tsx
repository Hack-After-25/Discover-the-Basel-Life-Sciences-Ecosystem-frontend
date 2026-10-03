"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { NEED_CATEGORIES, NEED_META, STAGES, STAGE_LABEL, THERAPEUTIC_AREAS } from "@/lib/entity-meta";
import { useHydrated, useNavigator } from "@/lib/store";
import { LANGUAGES, LANGUAGE_LABEL } from "@/lib/i18n";
import type { Language, NeedCategory, Profile, Stage } from "@/lib/types";
import { uid } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
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
  const [newCategory, setNewCategory] = useState<NeedCategory | "">("");

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

  const addNeed = () => {
    if (!newCategory) return;
    update({
      needs: [...profile.needs, { id: uid("need"), category: newCategory, detail: NEED_META[newCategory].defaultDetail }],
    });
    setNewCategory("");
  };

  const confirm = async () => {
    await runAnalysis();
    router.push("/results");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-primary">Check what we understood</h1>
      <p className="mt-3 text-muted">Correct anything that is off. Matches and the 90-day plan are built from this profile.</p>

      <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-base font-semibold">Your team</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </Select>
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

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-base font-semibold">What you need</h2>
        {profile.needs.length === 0 ? (
          <p className="mt-3 rounded-lg bg-surface p-4 text-sm text-muted">
            No needs listed. Add at least one below to get matches.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {profile.needs.map((need) => (
              <li
                key={need.id}
                className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-2.5 sm:flex-row sm:items-center"
              >
                <span className="inline-flex shrink-0 items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-white sm:w-44 sm:justify-center">
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
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="Add a need" id="new-need" className="flex-1">
              <Select id="new-need" value={newCategory} onChange={(e) => setNewCategory(e.target.value as NeedCategory | "")}>
                <option value="">Choose a category</option>
                {unused.map((c) => (
                  <option key={c} value={c}>
                    {NEED_META[c].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Button variant="outline" onClick={addNeed} disabled={!newCategory}>
              <Plus className="h-4 w-4" aria-hidden />
              Add need
            </Button>
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={confirm} disabled={analysing || profile.needs.length === 0}>
          {analysing && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
          {analysing ? "Finding matches" : "Show my matches"}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => router.push("/")}>
          Edit description
        </Button>
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
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
