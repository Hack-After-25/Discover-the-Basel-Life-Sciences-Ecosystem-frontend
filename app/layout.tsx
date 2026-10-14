import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Overlays } from "@/components/overlays";
import { SiteProvider } from "@/components/site-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { DEFAULT_NAME, DEFAULT_TAGLINE, fetchSiteSettings, fontStylesheet, safeImage, siteCss } from "@/lib/site-settings";
import { TEXTS, formatText, type TextKey } from "@/lib/texts";
import type { SiteSettings } from "@/lib/site-settings";

/** English text for server-rendered parts (page title, skip link). */
function serverText(site: SiteSettings, key: TextKey) {
  return formatText(site.texts?.en?.[key] ?? TEXTS[key].text, { name: site.name || DEFAULT_NAME });
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchSiteSettings();
  const name = site.name || DEFAULT_NAME;
  const favicon = safeImage(site.favicon);
  return {
    title: `${name} — ${site.tagline || DEFAULT_TAGLINE}`,
    description: serverText(site, "meta.description"),
    ...(favicon ? { icons: { icon: favicon } } : {}),
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Published admin settings (name, logos, colours, fonts, texts); {} keeps the defaults.
  const site = await fetchSiteSettings();
  const css = siteCss(site);
  const fonts = fontStylesheet(site);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {fonts && <link rel="stylesheet" href={fonts} />}
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      </head>
      <body className="min-h-screen">
        <SiteProvider settings={site}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
          >
            {serverText(site, "layout.skip")}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <Overlays />
        </SiteProvider>
      </body>
    </html>
  );
}
