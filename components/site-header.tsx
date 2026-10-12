"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, RotateCcw } from "lucide-react";
import { useHydrated, useNavigator } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo";
import { Button } from "./ui/button";

export function SiteHeader() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const shortlistCount = useNavigator((s) => s.shortlist.length);
  const hasResults = useNavigator((s) => s.matches.length > 0);
  const reset = useNavigator((s) => s.reset);

  const link = (href: string) =>
    cn(
      "inline-flex h-10 items-center rounded-[10px] px-3 text-sm font-medium",
      pathname === href ? "bg-primary-soft text-primary" : "text-muted hover:bg-[#F0F2F5] hover:text-ink",
    );

  return (
    <header className="no-print sticky top-0 z-[900] border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <LogoMark className="h-[30px] w-[30px]" />
          <span className="text-[15px] font-bold tracking-[0.08em]">ARIADNE</span>
          <span className="hidden text-[13px] text-muted sm:inline">De Fadä durch Basel</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {hydrated && hasResults && (
            <Link href="/results" className={link("/results")}>
              Results
            </Link>
          )}
          <Link href="/directory" className={link("/directory")}>
            Directory
          </Link>
          <Link href="/shortlist" className={cn(link("/shortlist"), "inline-flex items-center gap-1.5")}>
            <Bookmark className="h-4 w-4" aria-hidden />
            Shortlist
            {hydrated && shortlistCount > 0 && (
              <span className="rounded-full bg-accent px-[7px] font-mono text-xs text-white">{shortlistCount}</span>
            )}
          </Link>
          {hydrated && hasResults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                router.push("/");
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Start over</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
