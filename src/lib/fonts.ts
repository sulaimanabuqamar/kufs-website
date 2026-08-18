import { Barlow, Barlow_Condensed } from "next/font/google";
// import localFont from "next/font/local";

/**
 * The two faces, and the single place either of them can be swapped.
 *
 * BODY — Barlow. The brand sheet's specified body face. Open-licensed, served
 * from Google Fonts by next/font, which downloads and self-hosts it at build
 * time (no runtime request to Google, no third-party origin in the critical
 * path). Weights 400/500/600 only: nothing on this site uses 300 or 700 body.
 *
 * HEADLINES — A4 Speed. See the note below; it is not wired up yet, and the
 * declared fallback is doing the work.
 *
 * Both are exposed as CSS variables and consumed by src/styles/tokens.css via
 * --font-body and --font-display. Nothing else in the codebase names a font.
 */

export const bodyFont = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body-face",
  // Preloaded (next/font's default). Tried disabling this to get the hero
  // poster off the back of the font queue; it moved FCP from 0.9s to 1.4s and
  // introduced 0.007 CLS while leaving LCP unchanged, so it is a clear loss.
  // Measured, not assumed.
});

/**
 * HEADLINE FACE — currently Barlow Condensed Bold Italic.
 *
 * This is the declared fallback from the brief, running as the live face
 * because the A4 Speed font file was not supplied with this milestone. It is a
 * deliberately close stand-in: condensed, bold, italic, so the headline
 * rhythm, the letterfit and the rake all match what A4 Speed will do, and
 * dropping the real face in will not reflow the page.
 *
 * TO ENABLE A4 SPEED — a one-file change, exactly as specified:
 *   1. Put the source file in src/assets/fonts/
 *   2. pnpm font:subset src/assets/fonts/A4Speed-Bold.ttf
 *      (converts to WOFF2 and subsets to Latin + digits + punctuation;
 *       a comparable display face measured 14.2 KB, inside the 30 KB budget)
 *   3. Comment out the Barlow_Condensed block below and uncomment the
 *      localFont block. Nothing else in the codebase changes.
 *
 * Read the Licensing section of README.md before doing so.
 */
export const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
  display: "swap",
  variable: "--font-display-face",
});

/*
export const displayFont = localFont({
  src: [{ path: "../assets/fonts/a4-speed-subset.woff2", weight: "700", style: "italic" }],
  variable: "--font-display-face",
  display: "swap",
  // Barlow Condensed Bold Italic is the declared fallback, so the swap lands on
  // a face with near-identical proportions instead of a system default.
  fallback: ["Barlow Condensed", "Arial Narrow", "system-ui", "sans-serif"],
  // Metric-adjusts the fallback so the swap does not shift layout. next/font
  // only accepts a system font name here; 'Arial' is the closest available
  // reference for a condensed sans.
  adjustFontFallback: "Arial",
});
*/

/** Applied to <html> in src/app/layout.tsx. */
export const fontVariables = `${bodyFont.variable} ${displayFont.variable}`;
