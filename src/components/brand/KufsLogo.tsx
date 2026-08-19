import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * The KUFS logo lockup.
 *
 * PICK THE VARIANT BY BACKGROUND, ALWAYS.
 *
 * The wordmark's "KU" is white in the dark-background artwork and KUFS Navy in
 * the light-background artwork. Putting the light-background file on a navy
 * surface makes the "KU" disappear entirely and leaves a floating red "F" —
 * which is why the light file is not even reachable from this component
 * without asking for `on="light"`.
 *
 *   on="dark"  → navy / --color-bg / --color-surface        (white KU)
 *   on="light" → --color-bg-light / white sponsor cards     (navy KU)
 *
 * CLEAR SPACE: keep at least the height of the "K" free on all sides. The
 * `clearSpace` prop applies that as padding for callers that place the logo
 * against other content.
 *
 * Intrinsic dimensions below are the real pixel sizes of the files in
 * public/brand/, so next/image can reserve the box and CLS stays at zero.
 */

type LogoVariant = {
  src: string;
  width: number;
  height: number;
};

const VARIANTS = {
  /** Wordmark only, white KU. Header, footer, anything on navy. */
  "dark-plain": {
    src: "/brand/kufs-logo-color--dark-bg.png",
    width: 1400,
    height: 380,
  },
  /** Wordmark plus "Khalifa University Formula Student", white KU. */
  "dark-tagline": {
    src: "/brand/kufs-logo-simple-tagline--dark-bg.png",
    width: 1400,
    height: 434,
  },
  /** Wordmark plus tagline, NAVY KU. Light sections only. */
  "light-tagline": {
    src: "/brand/kufs-logo-color-tagline--light-bg.png",
    width: 1400,
    height: 467,
  },
  /** Single-colour: all-white wordmark with the Racing Red speed streak.
   *  For small sizes and anywhere the full-colour lockup would muddy. */
  "mono-red": {
    src: "/brand/kufs-logo-mono-white-red-streak--dark-bg.png",
    width: 821,
    height: 251,
  },
  /** As above with a navy streak — for use over lighter navy surfaces where
   *  the red streak sits too close to the ground colour. */
  "mono-navy": {
    src: "/brand/kufs-logo-mono-white-navy-streak--dark-bg.png",
    width: 920,
    height: 280,
  },
} satisfies Record<string, LogoVariant>;

export function KufsLogo({
  on,
  withTagline = false,
  variant = "color",
  width,
  priority = false,
  className,
  clearSpace = false,
}: {
  /** The background this logo will sit on. Chooses the artwork. */
  on: "dark" | "light";
  withTagline?: boolean;
  /**
   * "color" is the full lockup. "mono" is the single-colour white wordmark,
   * for small sizes and single-colour contexts — the press kit, favicons,
   * anywhere the full-colour mark would muddy. Dark backgrounds only: there is
   * no light-ground mono artwork, and inverting one ourselves would be
   * inventing a lockup.
   */
  variant?: "color" | "mono";
  /** Rendered width in CSS pixels. next/image serves 2x from this. */
  width: number;
  priority?: boolean;
  className?: string;
  clearSpace?: boolean;
}) {
  const key =
    on === "light"
      ? "light-tagline"
      : variant === "mono"
        ? withTagline
          ? "mono-navy"
          : "mono-red"
        : withTagline
          ? "dark-tagline"
          : "dark-plain";
  const artwork = VARIANTS[key];

  const height = Math.round((width / artwork.width) * artwork.height);

  return (
    <Image
      src={artwork.src}
      alt="KUFS — Khalifa University Formula Student"
      width={width}
      height={height}
      priority={priority}
      // Deliberately NO `sizes`. This logo always renders at a known fixed
      // width, so next/image's fixed-size path builds a 1x/2x srcset snapped to
      // the configured image sizes. Passing a `sizes` string instead made the
      // browser pick the 640px candidate for a 180px logo — 23.7 KB of header
      // artwork competing with the hero poster for bandwidth on Slow 4G, which
      // measurably pushed LCP out.
      // shrink-0 matters: the base layer sets `img { max-width: 100% }`, so in a
      // tight flex row the logo gets compressed horizontally while the inline
      // height stays fixed — which silently distorts the mark. Lighthouse
      // caught it as an aspect-ratio failure at 412px.
      className={cn("h-auto shrink-0", clearSpace && "p-[8%]", className)}
      style={{ width, height }}
    />
  );
}
