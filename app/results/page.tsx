"use client";

import { useState } from "react";
import { CalendarRange, LayoutGrid, MapPin, Share2 } from "lucide-react";
import { useHydrated, useNavigator } from "@/lib/store";
import type { NeedCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyState } from "@/components/empty-state";
import { GraphTab } from "@/components/graph-tab";
import { MapTab } from "@/components/map-tab";
import { MatchesTab } from "@/components/matches-tab";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { PlanTab } from "@/components/plan-tab";
import { RefineBar } from "@/components/refine-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/components/site-provider";

const TABS = [
  { id: "matches", label: "results.tab.matches", icon: LayoutGrid },
  { id: "plan", label: "results.tab.plan", icon: CalendarRange },
  { id: "map", label: "results.tab.map", icon: MapPin },
  { id: "graph", label: "results.tab.graph", icon: Share2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ResultsPage() {
  const hydrated = useHydrated();
  const profile = useNavigator((s) => s.profile);
  const matches = useNavigator((s) => s.matches);
  const hasMatches = matches.length > 0;
  const analysing = useNavigator((s) => s.analysing);
  const [tab, setTab] = useState<TabId>("matches");
  const [chatOpen, setChatOpen] = useState(false);
  const t = useT();

  if (!hydrated) return <ResultsSkeleton />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title={t("results.empty.title")}
          body={t("results.empty.body")}
          actionLabel={t("common.describeNeeds")}
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

  const providerCount = matches.filter((m) => m.role !== "programme").length;
  const needCount = profile.needs.length;

  const jumpToNeed = (need: NeedCategory) => {
    setTab("matches");
    requestAnimationFrame(() => document.getElementById(`need-${need}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div
      className={cn(
        "mx-auto grid max-w-[1400px] gap-6 px-4 pb-28 pt-6 sm:px-8 lg:pb-14",
        chatOpen ? "lg:grid-cols-[260px_minmax(0,1fr)_320px]" : "lg:grid-cols-[260px_minmax(0,1fr)]",
      )}
    >
      <ProfileSidebar onJumpToNeed={jumpToNeed} onShowPlan={() => setTab("plan")} />

      <div className="min-w-0">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold sm:text-[30px]">
              {t("results.title", {
                matches: t(providerCount === 1 ? "results.match.one" : "results.match.many", { count: providerCount }),
                needs: t(needCount === 1 ? "results.need.one" : "results.need.many", { count: needCount }),
              })}
            </h1>
            <p className="mt-1 text-sm text-muted">{t("results.intro")}</p>
          </div>
          {/* Desktop tabs. On mobile the same tabs render as a bottom nav. */}
          <div
            role="tablist"
            aria-label={t("results.tabs")}
            onKeyDown={onTabKey}
            className="fixed inset-x-0 bottom-0 z-[800] grid grid-cols-4 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:static lg:inline-flex lg:gap-0.5 lg:rounded-xl lg:border-0 lg:bg-subtle lg:p-1"
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
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium lg:min-h-10 lg:flex-row lg:gap-2 lg:rounded-[10px] lg:px-3.5 lg:text-sm",
                  tab === id
                    ? "font-semibold text-primary lg:bg-card lg:text-ink lg:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-5 w-5 lg:h-4 lg:w-4" aria-hidden />
                {t(label)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <RefineBar onOpenHistory={() => setChatOpen(true)} />
        </div>

        <div id="results-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6" aria-busy={analysing}>
          {analysing && !hasMatches ? (
            <CardSkeletons />
          ) : !hasMatches ? (
            <EmptyState
              title={t("results.none.title")}
              body={t("results.none.body")}
              actionLabel={t("results.none.action")}
              actionHref="/profile"
            />
          ) : (
            <div className={cn("transition-opacity", analysing && "opacity-60")}>
              {tab === "matches" && <MatchesTab />}
              {tab === "plan" && <PlanTab onJumpToNeed={jumpToNeed} />}
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
  const t = useT();
  return (
    <div className="grid gap-3.5 md:grid-cols-2 2xl:grid-cols-3" role="status" aria-label={t("results.loading")}>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-60 rounded-[18px]" />
      ))}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Skeleton className="h-64 rounded-2xl" />
      <CardSkeletons />
    </div>
  );
}
