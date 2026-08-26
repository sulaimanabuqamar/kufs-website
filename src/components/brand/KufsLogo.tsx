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
 *
 * The artwork is sliced from the team's own high-resolution exports
 * (~8,300px wide, several lockups stacked per file) by
 * `pnpm brand:slice`. It supersedes the earlier extractions taken from the
 * brand PDF. A true vector original is still outstanding.
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
    height: 385,
  },
  /** Wordmark plus "Khalifa University Formula Student", white KU. */
  "dark-tagline": {
    src: "/brand/kufs-logo-simple-tagline--dark-bg.png",
    width: 1400,
    height: 430,
  },
  /** Wordmark plus tagline, NAVY KU. Light sections only. */
  "light-tagline": {
    src: "/brand/kufs-logo-color-tagline--light-bg.png",
    width: 1400,
    height: 421,
  },
  /** Single-colour white wordmark. Small sizes, one-colour printing. */
  "mono-plain": {
    src: "/brand/kufs-logo-mono-white--dark-bg.png",
    width: 1400,
    height: 385,
  },
  /** Single-colour white wordmark with the tagline. */
  "mono-tagline": {
    src: "/brand/kufs-logo-mono-white-tagline--dark-bg.png",
    width: 1400,
    height: 422,
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
  alt,
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
  /**
   * Editable alt text, read from copy by whichever SERVER component renders
   * this. It is a prop rather than a `getCopy()` call because KufsLogo is
   * rendered inside MobileNav, which is a client component — importing the
   * content layer here pulls `server-only` and Zod across the boundary and
   * fails the build. That is the guard working, not an obstacle.
   */
  alt: string;
}) {
  const key =
    on === "light"
      ? "light-tagline"
      : variant === "mono"
        ? withTagline
          ? "mono-tagline"
          : "mono-plain"
        : withTagline
          ? "dark-tagline"
          : "dark-plain";
  const artwork = VARIANTS[key];

  const height = Math.round((width / artwork.width) * artwork.height);

  return (
    <Image
      src={artwork.src}
      alt={alt}
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
