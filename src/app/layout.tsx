import type { Metadata, Viewport } from "next";

import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { fontVariables } from "@/lib/fonts";
import site from "@/content/site";
import { siteUrl } from "@/lib/env";

import "./globals.css";

/**
 * Root layout.
 *
 * Fonts are declared in src/lib/fonts.ts and only applied here — this file
 * never names a typeface. next/font self-hosts both faces at build time, so
 * there is no request to a third-party origin in the critical path and no
 * layout shift on swap.
 */

export const metadata: Metadata = {
  // Every relative URL in metadata resolves against this, so canonical tags,
  // OG URLs and Twitter cards all follow the deployment rather than hardcoding
  // production into a preview build.
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.longName} — ${site.competition.name} ${site.competition.year}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.longName,
  keywords: [
    "Formula Student",
    site.competition.name,
    site.competition.class,
    site.university,
    "student motorsport",
    "engineering sponsorship",
    "Silverstone",
  ],
  authors: [{ name: site.longName, url: siteUrl() }],
  creator: site.longName,
  openGraph: {
    type: "website",
    siteName: site.longName,
    locale: "en_GB",
    url: siteUrl(),
    title: `${site.longName} — ${site.competition.name} ${site.competition.year}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.longName,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#16143c",
  colorScheme: "dark",
};

/**
 * Props are written out rather than using Next's generated `LayoutProps<"/">`
 * helper, so `pnpm typecheck` passes on a clean checkout — those types only
 * exist under .next/types after a build, which CI does not guarantee has run.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* First tab stop on every page. Visually hidden until focused. */}
        <a
          href="#main"
          className="sr-only-focusable absolute left-4 top-4 z-50 rounded-md bg-accent px-4 py-2 font-semibold text-accent-contrast"
        >
          Skip to content
        </a>

        <SiteHeader />

        {/* tabIndex={-1} so the skip link can move focus here, not just scroll. */}
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>

        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
