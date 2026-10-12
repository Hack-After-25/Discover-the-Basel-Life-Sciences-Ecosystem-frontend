"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Compass, LayoutGrid, RotateCcw } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";
import { useHydrated, useNavigator } from "@/lib/store";
import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo";

export function SiteHeader() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const shortlistCount = useNavigator((s) => s.shortlist.length);
  const hasResults = useNavigator((s) => s.matches.length > 0);
  const reset = useNavigator((s) => s.reset);
  const profile = useNavigator((s) => s.profile);
  const setProfile = useNavigator((s) => s.setProfile);
  const language = useNavigator((s) => s.language);
  const setLanguage = useNavigator((s) => s.setLanguage);

  // With a profile, the answer language lives there; before that, it is the intake choice.
  const current: Language | null = hydrated ? (profile?.language ?? language) : null;
  const chooseLanguage = (l: Language) => {
    setLanguage(l);
    if (profile && profile.language !== l) setProfile({ ...profile, language: l });
  };

  const links = [
    ...(hydrated && hasResults ? [{ href: "/results", label: "Results", icon: LayoutGrid }] : []),
    { href: "/directory", label: "Directory", icon: Compass },
    { href: "/shortlist", label: "Shortlist", icon: Bookmark },
  ];

  return (
    <header className="no-print sticky top-0 z-[900] px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-2 rounded-full border border-line/70 bg-white/90 py-2 pl-2 pr-2 shadow-[0_2px_12px_-4px_rgba(11,18,32,0.12)] backdrop-blur sm:gap-3 sm:pr-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 text-ink" aria-label="ARIADNE home">
          <LogoMark round className="h-11 w-11" />
          <span className="hidden text-xl font-bold tracking-[-0.01em] sm:inline">Ariadne</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 rounded-full bg-[#EEF0F3] p-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-3 text-[15px] font-semibold sm:px-4",
                  active ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span className={cn(href === "/results" ? "hidden md:inline" : "hidden sm:inline")}>{label}</span>
                <span className={cn("sr-only", href === "/results" ? "md:hidden" : "sm:hidden")}>{label}</span>
                {href === "/shortlist" && hydrated && shortlistCount > 0 && (
                  <span className="rounded-full bg-accent px-[7px] font-mono text-xs text-white">{shortlistCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          {hydrated && hasResults && (
            <button
              type="button"
              aria-label="Start over"
              title="Start over"
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-[#F0F2F5] hover:text-ink sm:inline-flex"
            >
              <RotateCcw className="h-[18px] w-[18px]" aria-hidden />
            </button>
          )}
          <div role="group" aria-label="Answer language" className="flex items-center rounded-full bg-[#EEF0F3] p-1">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={current === l}
                onClick={() => chooseLanguage(l)}
                className={cn(
                  "h-9 rounded-full px-2.5 text-[13px] font-semibold uppercase sm:h-10 sm:px-4",
                  current === l ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
