import type { Language } from "./types";

/** Name, logos, colours, fonts and texts set in the admin panel (GET /site).
 * Every field is optional: anything missing keeps the built-in default. */
export interface SiteSettings {
  version?: string;
  name?: string;
  tagline?: string;
  logo?: string;
  logoDark?: string;
  favicon?: string;
  colors?: Partial<Record<"light" | "dark", Partial<Record<ColorKey, string>>>>;
  fonts?: { text?: string; mono?: string };
  texts?: Partial<Record<Language, Record<string, string>>>;
}

export type ColorKey = "brand" | "cta" | "onCta" | "hero" | "surface" | "ink";

export const DEFAULT_NAME = "FadäRhy";
export const DEFAULT_TAGLINE = "The ecosystem navigator";

/** The CSS variables each admin colour sets (as "r g b" channels, like globals.css). */
const COLOR_VARS: Record<ColorKey, string[]> = {
  brand: ["--accent"],
  cta: ["--cta"],
  onCta: ["--on-cta"],
  hero: ["--hero"],
  surface: ["--surface"],
  ink: ["--ink", "--primary"],
};

const TEXT_FONTS: Record<string, { stack: string; google?: string }> = {
  Manrope: { stack: '"Manrope Variable", system-ui, sans-serif' },
  Inter: { stack: '"Inter", system-ui, sans-serif', google: "Inter:wght@400;500;600;700;800" },
  "DM Sans": { stack: '"DM Sans", system-ui, sans-serif', google: "DM+Sans:wght@400;500;600;700;800" },
  "IBM Plex Sans": { stack: '"IBM Plex Sans", system-ui, sans-serif', google: "IBM+Plex+Sans:wght@400;500;600;700" },
  "Source Sans 3": { stack: '"Source Sans 3", system-ui, sans-serif', google: "Source+Sans+3:wght@400;500;600;700;800" },
  "Work Sans": { stack: '"Work Sans", system-ui, sans-serif', google: "Work+Sans:wght@400;500;600;700;800" },
  Lora: { stack: '"Lora", Georgia, serif', google: "Lora:wght@400;500;600;700" },
  System: { stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
};
const MONO_FONTS: Record<string, { stack: string; google?: string }> = {
  "Space Mono": { stack: '"Space Mono", ui-monospace, monospace' },
  "IBM Plex Mono": { stack: '"IBM Plex Mono", ui-monospace, monospace', google: "IBM+Plex+Mono:wght@400;700" },
  "JetBrains Mono": { stack: '"JetBrains Mono", ui-monospace, monospace', google: "JetBrains+Mono:wght@400;700" },
  "Roboto Mono": { stack: '"Roboto Mono", ui-monospace, monospace', google: "Roboto+Mono:wght@400;700" },
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const DATA_IMAGE = /^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

function channels(hex: string, shift = 0): string {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return n.map((v) => Math.max(0, Math.min(255, Math.round(v + shift)))).join(" ");
}

/** Safe image data URL, or undefined. */
export function safeImage(value: string | undefined): string | undefined {
  return value && DATA_IMAGE.test(value) ? value : undefined;
}

function block(values: Partial<Record<ColorKey, string>> | undefined): string {
  if (!values) return "";
  const lines: string[] = [];
  for (const [key, hex] of Object.entries(values) as [ColorKey, string][]) {
    if (!COLOR_VARS[key] || !HEX.test(hex)) continue;
    for (const name of COLOR_VARS[key]) lines.push(`${name}: ${channels(hex)};`);
    if (key === "brand") lines.push(`--accent-dark: ${channels(hex, -24)};`);
    if (key === "cta") lines.push(`--cta-hover: ${channels(hex, -14)};`);
  }
  return lines.join(" ");
}

/** CSS that applies the admin colours and fonts over globals.css. `html:root`
 * outranks the plain `:root` rules there, so these win in both themes. */
export function siteCss(site: SiteSettings): string {
  const parts: string[] = [];
  const light = block(site.colors?.light);
  const dark = block(site.colors?.dark);
  const text = site.fonts?.text ? TEXT_FONTS[site.fonts.text] : undefined;
  const mono = site.fonts?.mono ? MONO_FONTS[site.fonts.mono] : undefined;
  const fonts = [text && `--font-sans: ${text.stack};`, mono && `--font-mono: ${mono.stack};`].filter(Boolean).join(" ");
  if (light || fonts) parts.push(`html:root { ${light} ${fonts} }`);
  if (dark) {
    parts.push(`@media (prefers-color-scheme: dark) { html:root:not([data-theme="light"]) { ${dark} } }`);
    parts.push(`html:root[data-theme="dark"] { ${dark} }`);
  }
  return parts.join("\n");
}

/** Google Fonts stylesheet for a chosen font that isn't bundled, or null. */
export function fontStylesheet(site: SiteSettings): string | null {
  const families = [
    site.fonts?.text ? TEXT_FONTS[site.fonts.text]?.google : undefined,
    site.fonts?.mono ? MONO_FONTS[site.fonts.mono]?.google : undefined,
  ].filter(Boolean);
  return families.length ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap` : null;
}

/** Published settings from the backend; {} (the defaults) if it can't be reached. */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return {};
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/site`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return {};
    const data = (await res.json()) as SiteSettings;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}
