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
} satisfies Record<string, LogoVariant>;

export function KufsLogo({
  on,
  withTagline = false,
  width,
  priority = false,
  className,
  clearSpace = false,
}: {
  /** The background this logo will sit on. Chooses the artwork. */
  on: "dark" | "light";
  withTagline?: boolean;
  /** Rendered width in CSS pixels. next/image serves 2x from this. */
  width: number;
  priority?: boolean;
  className?: string;
  clearSpace?: boolean;
}) {
  const key =
    on === "light" ? "light-tagline" : withTagline ? "dark-tagline" : "dark-plain";
  const variant = VARIANTS[key];

  const height = Math.round((width / variant.width) * variant.height);

  return (
    <Image
      src={variant.src}
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
      className={cn("h-auto", clearSpace && "p-[8%]", className)}
      style={{ width, height }}
    />
  );
}
