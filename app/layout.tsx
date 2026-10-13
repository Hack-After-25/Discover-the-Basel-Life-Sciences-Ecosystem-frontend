import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Overlays } from "@/components/overlays";

export const metadata: Metadata = {
  title: "FadäRhy — The ecosystem navigator",
  description:
    "FadäRhy helps founders navigate the Basel and Upper Rhine innovation ecosystem: programmes, expertise, laboratory access, funding pathways and partners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <Overlays />
      </body>
    </html>
  );
}
