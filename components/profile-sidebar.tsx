"use client";

import Link from "next/link";
import { Bookmark, Pencil } from "lucide-react";
import { NEED_META, NEED_TO_ENTITY_TYPE, STAGE_LABEL, THERAPEUTIC_AREA_LABELS, TYPE_META } from "@/lib/entity-meta";
import { LANGUAGE_LABEL, LOCALE } from "@/lib/i18n";
import { useNavigator, useRegionName } from "@/lib/store";
import type { NeedCategory } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

export function ProfileSidebar({
  onJumpToNeed,
  onShowPlan,
}: {
  onJumpToNeed: (need: NeedCategory) => void;
  onShowPlan: () => void;
}) {
  const profile = useNavigator((s) => s.profile);
  const matches = useNavigator((s) => s.matches);
  const plan = useNavigator((s) => s.plan);
  const shortlistCount = useNavigator((s) => s.shortlist.length);
  const regionName = useRegionName();
  if (!profile) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = plan?.deadlines
    .filter((d) => new Date(d.date).getTime() >= today.getTime())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const daysLeft = next ? Math.round((new Date(next.date).getTime() - today.getTime()) / DAY) : 0;

  return (
    <aside aria-label="Your profile" className="no-print flex flex-col gap-3 lg:sticky lg:top-24">
      <div className="rounded-lg border border-line bg-card p-[18px]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{profile.companyName ?? "Your team"}</h2>
            <p className="mt-1 text-[13px] leading-normal text-muted">
              {profile.teamSize} people ·{" "}
              {profile.userKind === "service_provider" ? "Service provider" : STAGE_LABEL[profile.stage]} ·{" "}
              {THERAPEUTIC_AREA_LABELS[profile.therapeuticArea] ?? profile.therapeuticArea}
              <br />
              Answers in {LANGUAGE_LABEL[profile.language]}
            </p>
          </div>
          <Link
            href="/profile"
            aria-label="Edit profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-primary hover:bg-primary-soft"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <h3 className="mt-[18px] label-mono">Your needs</h3>
        <ul className="mt-1.5">
          {profile.needs.map((need) => {
            const count = matches.filter((m) => m.needCategory === need.category && m.role !== "programme").length;
            return (
              <li key={need.id}>
                <button
                  type="button"
                  onClick={() => onJumpToNeed(need.category)}
                  title={need.detail}
                  className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md px-2.5 text-left text-sm hover:bg-subtle"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-sm"
                      style={{ backgroundColor: TYPE_META[NEED_TO_ENTITY_TYPE[need.category]].color }}
                    />
                    {NEED_META[need.category].label}
                  </span>
                  <span className="font-mono text-xs text-muted">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {(profile.cantonFilter || (profile.constraints?.length ?? 0) > 0) && (
          <>
            <h3 className="mt-4 label-mono">Refinements</h3>
            <ul className="mt-2 space-y-1 px-2.5 text-sm text-muted">
              {profile.cantonFilter && <li>Only {regionName(profile.cantonFilter)}</li>}
              {profile.constraints?.map((c) => <li key={c}>Investors: {c}</li>)}
            </ul>
          </>
        )}

        <Link
          href="/shortlist"
          className="mt-3 flex min-h-10 items-center justify-between rounded-md bg-surface px-2.5 text-sm font-medium hover:text-primary"
        >
          <span className="inline-flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-accent" aria-hidden />
            Shortlist
          </span>
          <span className="rounded-full bg-accent px-2 font-mono text-xs text-white">{shortlistCount}</span>
        </Link>
      </div>

      {next && (
        <div className="rounded-lg bg-primary-dark p-[18px] text-white">
          <p className="text-[13px] font-semibold text-[#D6FF3F]">Next deadline</p>
          <p className="mt-1.5 text-[15px] font-semibold">{next.title}</p>
          <p className="mt-0.5 font-mono text-[13px] text-[#C9CCC0]">
            {new Date(next.date).toLocaleDateString(LOCALE[profile.language], { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {daysLeft === 0 ? "today" : `in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`}
          </p>
          <button type="button" onClick={onShowPlan} className="mt-2.5 text-[13px] font-semibold text-white underline-offset-2 hover:underline">
            See your plan
          </button>
        </div>
      )}
    </aside>
  );
}
