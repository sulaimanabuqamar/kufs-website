import { cn } from "@/lib/cn";

/**
 * The KUFS speed stripe.
 *
 * The signature element of the logo: stacked horizontal bars raking to the
 * right. Reused as the section-divider and heading-underline motif so the site
 * reads as KUFS rather than a generic dark template.
 *
 * TONE IS SELECTED BY THE SURFACE, NOT BY THE CALL SITE.
 *
 * The bar colours come from --stripe-1 .. --stripe-5, defined in tokens.css.
 * Custom properties inherit, so `Section tone="light"` sets `.surface-light`
 * on the band and every stripe inside it — at any depth, through any number of
 * intermediate components — switches to the navy ramp on its own. No call site
 * chooses, so no call site can choose wrong. Same intent as KufsLogo's `on`
 * API, but done in CSS because most of these stripes render on the server,
 * where React context is not readable.
 *
 * The `tone` prop is an explicit override for the one case that genuinely
 * needs it: /styleguide, which shows both ramps side by side. It works by
 * setting the same surface class, so it is the same mechanism rather than a
 * second one.
 *
 * PURELY DECORATIVE. It is always aria-hidden and never carries meaning — no
 * status, no state, no "required field" marker. That matters twice over here,
 * because Racing Red measures 2.12:1 on KUFS Navy: it is legible as a graphic
 * gesture and illegible as information. This component is the ONLY place
 * Racing Red is allowed on a dark surface.
 *
 * Built from skewed blocks rather than an SVG so the bar heights stay crisp at
 * any width — an SVG with preserveAspectRatio="none" would smear them.
 */

export type SpeedStripeVariant = "underline" | "divider" | "accent";

/** "brand" is the dark-surface ramp, "navy" the light-surface one. */
export type SpeedStripeTone = "brand" | "navy";

/**
 * Bars run top→bottom. `inset` fakes the rake by shortening each bar; that
 * geometry is identical in both tones, which is the point — only the colour
 * ramp changes.
 */
const BARS = [
  { color: "var(--stripe-1)", inset: 0 },
  { color: "var(--stripe-2)", inset: 3 },
  { color: "var(--stripe-3)", inset: 6 },
  { color: "var(--stripe-4)", inset: 9 },
  { color: "var(--stripe-5)", inset: 12 },
];

/** Only set when a stripe is overriding what its surface would have given it. */
const TONE_CLASS: Record<SpeedStripeTone, string> = {
  brand: "surface-dark",
  navy: "surface-light",
};

const VARIANTS: Record<
  SpeedStripeVariant,
  { wrapper: string; bar: string; gap: string }
> = {
  // Sits directly under a section heading.
  underline: { wrapper: "w-24", bar: "h-[3px]", gap: "gap-[3px]" },
  // Full-width rule between sections.
  divider: { wrapper: "w-full", bar: "h-[2px]", gap: "gap-[3px]" },
  // Larger decorative block, for hero and CTA bands.
  accent: { wrapper: "w-40", bar: "h-[5px]", gap: "gap-[4px]" },
};

export function SpeedStripe({
  variant = "underline",
  tone,
  className,
}: {
  variant?: SpeedStripeVariant;
  /** Leave unset. The surface decides; see the note above. */
  tone?: SpeedStripeTone;
  className?: string;
}) {
  const style = VARIANTS[variant];

  return (
    <span
      aria-hidden="true"
      // Selector for pnpm check:brand, which asserts that the ramp a stripe
      // actually renders matches the surface it renders on.
      data-speed-stripe={variant}
      className={cn(
        "pointer-events-none flex select-none flex-col",
        style.wrapper,
        style.gap,
        tone ? TONE_CLASS[tone] : undefined,
        className,
      )}
      // The rake. Kept off the individual bars so they stay pixel-aligned.
      style={{ transform: "skewX(-20deg)" }}
    >
      {BARS.map((bar, index) => (
        <span
          key={index}
          className={cn("block rounded-[1px]", style.bar)}
          style={{
            // Colour carries its own alpha, rather than an `opacity` on the
            // element, so the rendered value is inspectable — check:brand reads
            // it back off the DOM.
            backgroundColor: bar.color,
            // Each bar is shorter than the one above, which is what reads as
            // speed rather than as a plain set of rules.
            marginRight: `${bar.inset}%`,
            marginLeft: `${bar.inset * 0.35}%`,
          }}
        />
      ))}
    </span>
  );
}
