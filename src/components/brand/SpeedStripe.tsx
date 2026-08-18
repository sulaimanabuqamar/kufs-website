import { cn } from "@/lib/cn";

/**
 * The KUFS speed stripe.
 *
 * The signature element of the logo: stacked horizontal bars raking to the
 * right, running red → copper → orange. Reused as the section-divider and
 * heading-underline motif so the site reads as KUFS rather than a generic dark
 * template.
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

/** Bars run top→bottom. `inset` fakes the rake by shortening each bar. */
const BARS = [
  { color: "var(--color-stripe-red)", inset: 0 },
  { color: "var(--color-stripe-red)", inset: 3, fade: 0.7 },
  { color: "var(--color-stripe-copper)", inset: 6 },
  { color: "#ffffff", inset: 9, fade: 0.85 },
  { color: "var(--color-stripe-orange)", inset: 12 },
];

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
  className,
}: {
  variant?: SpeedStripeVariant;
  className?: string;
}) {
  const style = VARIANTS[variant];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex select-none flex-col",
        style.wrapper,
        style.gap,
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
            backgroundColor: bar.color,
            opacity: bar.fade ?? 1,
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
