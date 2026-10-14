"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Compass, Languages, LayoutGrid, RotateCcw } from "lucide-react";
import { LANGUAGE_LABEL, LANGUAGES } from "@/lib/i18n";
import { useHydrated, useNavigator } from "@/lib/store";
import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SiteLogo, Wordmark } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Dropdown } from "./ui/dropdown";
import { useT } from "./site-provider";

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
  const t = useT();

  // With a profile, the answer language lives there; before that, it is the intake choice.
  const current: Language | null = hydrated ? (profile?.language ?? language) : null;
  const chooseLanguage = (l: Language) => {
    setLanguage(l);
    if (profile && profile.language !== l) setProfile({ ...profile, language: l });
  };

  const links = [
    ...(hydrated && hasResults ? [{ href: "/results", label: t("nav.results"), icon: LayoutGrid }] : []),
    { href: "/directory", label: t("nav.directory"), icon: Compass },
    { href: "/shortlist", label: t("nav.shortlist"), icon: Bookmark },
  ];

  return (
    <header className="no-print sticky top-0 z-[900] px-2 pt-2 sm:px-6 sm:pt-3">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-1.5 rounded-full border border-line/70 bg-card/90 px-1.5 shadow-[0_2px_12px_-4px_rgba(11,18,32,0.12)] backdrop-blur sm:h-16 sm:gap-3 sm:pl-2 sm:pr-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-full text-ink sm:pr-2" aria-label={t("nav.home")}>
          <SiteLogo className="h-10 w-10 sm:h-11 sm:w-11" />
          <Wordmark className="hidden text-[22px] sm:inline" />
        </Link>

        <nav aria-label={t("nav.main")} className="flex min-w-0 items-center gap-0.5 rounded-full bg-subtle p-1 sm:gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full text-[15px] font-semibold lg:px-4",
                  active ? "bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span className="hidden lg:inline">{label}</span>
                <span className="sr-only lg:hidden">{label}</span>
                {href === "/shortlist" && hydrated && shortlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-accent px-[5px] text-center font-mono text-[11px] leading-[18px] text-white lg:static lg:px-[7px] lg:text-xs lg:leading-normal">
                    {shortlistCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {hydrated && hasResults && (
            <button
              type="button"
              aria-label={t("nav.startOver")}
              title={t("nav.startOver")}
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink sm:inline-flex"
            >
              <RotateCcw className="h-[18px] w-[18px]" aria-hidden />
            </button>
          )}
          <ThemeToggle />
          {/* Phones and tablets: one compact menu; wide screens: the EN DE FR switch. */}
          <Dropdown
            aria-label={t("nav.language")}
            value={current ?? ""}
            onChange={(v) => chooseLanguage(v as Language)}
            options={LANGUAGES.map((l) => ({ value: l, label: l.toUpperCase() }))}
            className="h-10 w-auto gap-1 rounded-full border-0 bg-subtle px-3 text-[13px] font-semibold text-ink lg:hidden"
            itemLabel={(o) => LANGUAGE_LABEL[o.value as Language]}
            placeholder={<Languages className="h-4 w-4" aria-hidden />}
          />
          <div role="group" aria-label={t("nav.language")} className="hidden items-center rounded-full bg-subtle p-1 lg:flex">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={current === l}
                onClick={() => chooseLanguage(l)}
                className={cn(
                  "h-10 rounded-full px-4 text-[13px] font-semibold uppercase",
                  current === l ? "bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink",
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
