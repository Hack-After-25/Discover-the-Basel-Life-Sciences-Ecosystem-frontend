"use client";

import { useState } from "react";
import { CalendarRange, LayoutGrid, MapPin, MessageSquare, Share2 } from "lucide-react";
import { useHydrated, useNavigator } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyState } from "@/components/empty-state";
import { GraphTab } from "@/components/graph-tab";
import { MapTab } from "@/components/map-tab";
import { MatchesTab } from "@/components/matches-tab";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { PlanTab } from "@/components/plan-tab";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const TABS = [
  { id: "matches", label: "Matches", icon: LayoutGrid },
  { id: "plan", label: "90-day plan", icon: CalendarRange },
  { id: "map", label: "Map", icon: MapPin },
  { id: "graph", label: "Graph", icon: Share2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ResultsPage() {
  const hydrated = useHydrated();
  const profile = useNavigator((s) => s.profile);
  const hasMatches = useNavigator((s) => s.matches.length > 0);
  const analysing = useNavigator((s) => s.analysing);
  const [tab, setTab] = useState<TabId>("matches");
  const [chatOpen, setChatOpen] = useState(false);

  if (!hydrated) return <ResultsSkeleton />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="No results yet"
          body="Describe your team and what you need. Your matches, 90-day plan, map and graph appear here."
          actionLabel="Describe your needs"
          actionHref="/"
        />
      </div>
    );
  }

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    if (e.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length].id);
    if (e.key === "ArrowLeft") setTab(TABS[(i - 1 + TABS.length) % TABS.length].id);
  };

  return (
    <div
      className={cn(
        "mx-auto grid max-w-[1400px] gap-5 px-4 pb-28 pt-6 sm:px-6 lg:pb-12",
        chatOpen ? "lg:grid-cols-[250px_minmax(0,1fr)_320px]" : "lg:grid-cols-[250px_minmax(0,1fr)]",
      )}
    >
      <ProfileSidebar />

      <div className="min-w-0">
        <div className="no-print flex items-center justify-between gap-3">
          {/* Desktop tabs. On mobile the same tabs render as a bottom nav. */}
          <div
            role="tablist"
            aria-label="Results"
            onKeyDown={onTabKey}
            className="fixed inset-x-0 bottom-0 z-[800] grid grid-cols-4 border-t border-line bg-white lg:static lg:inline-flex lg:gap-1 lg:rounded-xl lg:border lg:p-1"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls="results-panel"
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium lg:flex-row lg:gap-2 lg:rounded-lg lg:px-4 lg:py-2 lg:text-sm",
                  tab === id ? "text-primary lg:bg-primary lg:text-white" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-5 w-5 lg:h-4 lg:w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button variant={chatOpen ? "accent" : "outline"} onClick={() => setChatOpen((o) => !o)} aria-expanded={chatOpen}>
              <MessageSquare className="h-4 w-4" aria-hidden />
              Refine results
            </Button>
          </div>
        </div>

        <div id="results-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5" aria-busy={analysing}>
          {analysing && !hasMatches ? (
            <CardSkeletons />
          ) : !hasMatches ? (
            <EmptyState
              title="No matches for this profile"
              body="Your current needs and refinements return nothing. Add a need, or open Refine results and write “both cantons”."
              actionLabel="Edit profile"
              actionHref="/profile"
            />
          ) : (
            <div className={cn(analysing && "opacity-60")}>
              {tab === "matches" && <MatchesTab />}
              {tab === "plan" && <PlanTab />}
              {tab === "map" && <MapTab />}
              {tab === "graph" && <GraphTab />}
            </div>
          )}
        </div>
      </div>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

function CardSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading matches">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-52 rounded-2xl" />
      ))}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <Skeleton className="h-64 rounded-2xl" />
      <CardSkeletons />
    </div>
  );
}
