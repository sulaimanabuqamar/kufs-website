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
  headline: ["Built by students.", "Raced against the world."],
  /** Revealed last, as the payoff for scrolling the hero. */
  spec: [
    { label: "Target mass", value: "182 kg" },
    { label: "Downforce at 60 km/h", value: "410 N" },
    { label: "Students on the team", value: "64" },
  ],
} as const;
