/**
 * Hero copy and its scroll checkpoints, kept out of the component so the
 * words can be edited without touching animation code — and so the sequence,
 * model and poster variants are guaranteed to say exactly the same thing.
 *
 * `at` values are scroll progress through the pinned track, 0..1. Under
 * reduced-motion, on mobile, and before hydration, every block renders
 * revealed — the checkpoints are an enhancement, never a gate on the content.
 *
 * NOTE: this module must not import content/site.ts. It is reachable from
 * HeroCopy, which renders inside the client-side HeroStage, and site.ts pulls
 * in the Zod-validated content layer. Anything that has to come from site
 * config (the eyebrow, the positioning statement) is passed down as a prop by
 * the server component instead. Enforced by scripts/check-bundle.mjs.
 */

export const HERO_CHECKPOINTS = {
  positioning: 0.22,
  spec: 0.58,
} as const;

export type HeroCheckpoint = keyof typeof HERO_CHECKPOINTS;

export const heroCopy = {
  // The brand tagline, split so the second line can take the accent.
  headline: ["Engineered to race.", "Driven to lead."],
  /** Revealed last, as the payoff for scrolling the hero. */
  spec: [
    // TODO: confirm with team. These are the shape of the figures we want to
    // show, not measured values — do not publish until someone signs them off.
    { label: "Target mass", value: "TBC" },
    { label: "Downforce at 60 km/h", value: "TBC" },
    { label: "Students on the team", value: "TBC" },
  ],
} as const;
