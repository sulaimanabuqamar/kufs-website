import { existsSync } from "node:fs";
import { join } from "node:path";

import { Barlow, Barlow_Condensed } from "next/font/google";

/**
 * The two faces, and the single place either of them can be swapped.
 *
 * BODY — Barlow. The brand sheet's specified body face. Open-licensed, served
 * from Google Fonts by next/font, which downloads and self-hosts it at build
 * time (no runtime request to Google, no third-party origin in the critical
 * path). Weights 400/500/600 only: nothing on this site uses 300 or 700 body.
 *
 * HEADLINES — Barlow Condensed Bold Italic today, A4 Speed once licensed.
 * See the licence gate below.
 *
 * Both are exposed as CSS variables and consumed by src/styles/tokens.css via
 * --font-body and --font-display. Nothing else in the codebase names a font.
 */

export const bodyFont = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body-face",
  // Preloaded (next/font's default). Disabling it was measured and made FCP
  // worse (0.9s -> 1.4s) while leaving LCP unchanged.
});

/**
 * The headline face that always ships.
 *
 * It is both the live face today AND the permanent fallback once A4 Speed is
 * licensed: condensed, bold, italic, close enough that the headline rhythm and
 * letterfit match, so enabling A4 Speed will not reflow the page. Loaded
 * through next/font, so it stays preloaded and metric-adjusted either way.
 */
export const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
  display: "swap",
  variable: "--font-display-face",
});

/* ==========================================================================
   THE A4 SPEED LICENCE GATE
   ==========================================================================

   A4 Speed's bundled Readme states it is "completely free for personal use
   only. For commercial purposes you must purchase a license." This site
   carries sponsor logos, so it is not personal use: KUFS needs the USD 12
   commercial licence from the author before shipping it.

   THE GATE IS THE FILE ITSELF, not a flag.

   public/fonts/a4-speed.woff2 is gitignored. Until the licence is bought, the
   binary is not in the repository at all — which matters more than it first
   looks, because this repository is PUBLIC. Committing a personal-use-only
   font to a public repo is redistribution in its own right, regardless of
   whether the site ever serves it. An environment variable would not have
   prevented that; not having the file does.

   The @font-face rule in src/styles/tokens.css names "A4 Speed" first in the
   --font-display stack, with the Barlow Condensed variable immediately after.
   So the behaviour is:

     file absent  -> the @font-face src 404s, the browser falls straight
                     through to Barlow Condensed. No build failure, no visual
                     break, nothing missing but the face itself.
     file present -> A4 Speed wins, and the layout preloads it.

   That means a future committee that loses the licence can simply delete the
   file, and a committee that buys it can simply add it. Neither has to
   understand this file.

   `pnpm check:font-licence` fails the build if a font binary is committed
   without the licence certificate beside it.
   ========================================================================== */

/** Where the licensed binary goes once it exists. */
export const A4_SPEED_PATH = "public/fonts/a4-speed.woff2";

/** Public URL of the same file. */
export const A4_SPEED_URL = "/fonts/a4-speed.woff2";

/**
 * True when the licensed binary is present in this build.
 *
 * Evaluated on the server at build time. Used only to decide whether to emit a
 * preload hint — the font stack itself degrades on its own, so nothing depends
 * on this being right.
 */
export function hasLicensedDisplayFont(): boolean {
  return existsSync(join(process.cwd(), A4_SPEED_PATH));
}

/** Applied to <html> in src/app/layout.tsx. */
export const fontVariables = `${bodyFont.variable} ${displayFont.variable}`;
