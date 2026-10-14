"use client";

import { createContext, useCallback, useContext } from "react";
import { DEFAULT_NAME, safeImage, type SiteSettings } from "@/lib/site-settings";
import { TEXTS, formatText, type TextKey } from "@/lib/texts";
import { useHydrated, useNavigator } from "@/lib/store";
import type { Language } from "@/lib/types";

const SiteContext = createContext<SiteSettings>({});

/** Makes the published admin settings available to every component. */
export function SiteProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const site = useContext(SiteContext);
  return {
    name: site.name || DEFAULT_NAME,
    isDefaultName: !site.name || site.name === DEFAULT_NAME,
    logo: safeImage(site.logo),
    logoDark: safeImage(site.logoDark) ?? safeImage(site.logo),
    settings: site,
  };
}

export type Translate = (key: TextKey, vars?: Record<string, string | number>) => string;

/** t("home.hero.title") -> the admin's text in the visitor's language, else
 * the admin's English text, else the built-in default. {name} is the site name. */
export function useT(): Translate {
  const site = useContext(SiteContext);
  const hydrated = useHydrated();
  const stored = useNavigator((s) => s.profile?.language ?? s.language);
  // The language lives in browser storage, so the first render uses English
  // everywhere to match the server.
  const language: Language = hydrated && stored ? stored : "en";
  return useCallback(
    (key, vars) => {
      const template = site.texts?.[language]?.[key] ?? site.texts?.en?.[key] ?? TEXTS[key].text;
      return formatText(template, { name: site.name || DEFAULT_NAME, ...vars });
    },
    [site, language],
  );
}
