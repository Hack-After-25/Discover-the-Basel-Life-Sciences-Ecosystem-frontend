"use client";

import Link from "next/link";
import { Bookmark, Pencil } from "lucide-react";
import { CANTON_LABEL, NEED_META, STAGE_LABEL } from "@/lib/entity-meta";
import { LANGUAGE_LABEL } from "@/lib/i18n";
import { useNavigator } from "@/lib/store";

export function ProfileSidebar() {
  const profile = useNavigator((s) => s.profile);
  const shortlistCount = useNavigator((s) => s.shortlist.length);
  if (!profile) return null;

  return (
    <aside aria-label="Your profile" className="no-print rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{profile.companyName ?? "Your team"}</h2>
          <p className="mt-0.5 text-sm text-muted">
            {profile.teamSize} people, {STAGE_LABEL[profile.stage]}, {profile.therapeuticArea}
          </p>
          <p className="mt-0.5 text-sm text-muted">Answers in {LANGUAGE_LABEL[profile.language]}</p>
        </div>
        <Link href="/profile" aria-label="Edit profile" className="rounded-md p-1.5 text-primary hover:bg-primary-soft">
          <Pencil className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <h3 className="mt-4 text-sm font-semibold">Needs</h3>
      <ul className="mt-2 flex flex-wrap gap-1.5 lg:flex-col lg:gap-2">
        {profile.needs.map((need) => (
          <li key={need.id} className="rounded-lg bg-white px-2.5 py-1.5 text-sm">
            <span className="font-medium">{NEED_META[need.category].label}</span>
            <span className="hidden text-muted lg:block">{need.detail}</span>
          </li>
        ))}
      </ul>

      {(profile.cantonFilter || (profile.constraints?.length ?? 0) > 0) && (
        <>
          <h3 className="mt-4 text-sm font-semibold">Refinements</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {profile.cantonFilter && <li>Only {CANTON_LABEL[profile.cantonFilter]}</li>}
            {profile.constraints?.map((c) => <li key={c}>Investors: {c}</li>)}
          </ul>
        </>
      )}

      <Link
        href="/shortlist"
        className="mt-4 flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm font-medium hover:text-primary"
      >
        <span className="inline-flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-accent" aria-hidden />
          Shortlist
        </span>
        <span className="rounded-full bg-accent px-2 text-xs text-white">{shortlistCount}</span>
      </Link>
    </aside>
  );
}
