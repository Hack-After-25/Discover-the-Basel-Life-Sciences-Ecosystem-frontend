"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, RotateCcw } from "lucide-react";
import { useHydrated, useNavigator } from "@/lib/store";
import { cn } from "@/lib/utils";
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
      "rounded-lg px-3 py-2 text-sm font-medium",
      pathname === href ? "bg-primary-soft text-primary" : "text-muted hover:text-ink",
    );

  return (
    <header className="no-print sticky top-0 z-[900] border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-primary">
          <span aria-hidden className="relative block h-6 w-6">
            <span className="absolute left-0 top-0 h-4 w-4 rounded-full bg-primary" />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-accent mix-blend-multiply" />
          </span>
          <span>ARIADNE</span>
          <span className="hidden text-xs font-normal text-muted sm:inline">De Fadä durch Basel</span>
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
              <span className="rounded-full bg-accent px-1.5 text-xs text-white">{shortlistCount}</span>
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
