"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Compass, LayoutGrid, RotateCcw } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";
import { useHydrated, useNavigator } from "@/lib/store";
import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

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
    <header className="no-print sticky top-0 z-[900] border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-ink" aria-label="FadäRhy home">
          <img src="/brand/logo.png" alt="" className="h-9 w-9 rounded-md" />
          <span className="hidden text-[20px] font-extrabold tracking-[-0.01em] sm:inline">FadäRhy</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 items-center gap-2 px-2.5 text-[14px] font-semibold sm:px-3",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-[17px] w-[17px] sm:hidden" aria-hidden />
                <span className={cn(href === "/results" ? "hidden md:inline" : "hidden sm:inline")}>{label}</span>
                <span className={cn("sr-only", href === "/results" ? "md:hidden" : "sm:hidden")}>{label}</span>
                {href === "/shortlist" && hydrated && shortlistCount > 0 && (
                  <span className="rounded-full bg-cta px-[7px] font-mono text-[11px] font-bold text-on-cta">{shortlistCount}</span>
                )}
                {active && <span aria-hidden className="absolute inset-x-2.5 -bottom-[15px] h-[2px] bg-accent sm:inset-x-3" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {hydrated && hasResults && (
            <button
              type="button"
              aria-label="Start over"
              title="Start over"
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="hidden h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-ink sm:inline-flex"
            >
              <RotateCcw className="h-[18px] w-[18px]" aria-hidden />
            </button>
          )}
          <div role="group" aria-label="Answer language" className="flex items-center rounded-md border border-line p-[3px]">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={current === l}
                onClick={() => chooseLanguage(l)}
                className={cn(
                  "h-8 rounded px-2 font-mono text-[11px] uppercase sm:px-2.5",
                  current === l ? "bg-ink text-surface" : "text-muted hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
