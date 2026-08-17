import type { Metadata, Viewport } from "next";

import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import site from "@/content/site";

import "./globals.css";

/**
 * Root layout.
 *
 * No next/font call here yet — the placeholder type scale uses the system
 * stack (see src/styles/tokens.css), which costs zero requests and cannot
 * shift layout. When the real team faces arrive, add the next/font import
 * here and point --font-display / --font-body at the generated variables.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
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
  authors: [{ name: site.longName, url: site.url }],
  creator: site.longName,
  openGraph: {
    type: "website",
    siteName: site.longName,
    locale: "en_GB",
    url: site.url,
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
  themeColor: "#0a0b0d",
  colorScheme: "dark",
};

/**
 * Props are written out rather than using Next's generated `LayoutProps<"/">`
 * helper, so `pnpm typecheck` passes on a clean checkout — those types only
 * exist under .next/types after a build, which CI does not guarantee has run.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="h-full">
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
