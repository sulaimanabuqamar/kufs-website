/**
 * The hero's scroll checkpoints.
 *
 * Values are scroll progress through the pinned track, 0..1. Under
 * reduced-motion, on mobile, and before hydration, every block renders
 * revealed — the checkpoints are an enhancement, never a gate on the content.
 *
 * THE WORDS ARE NOT HERE. They moved to content/copy/home.json when the site's
 * copy became editable from /admin, and ScrollCarHero passes them down. This
 * module must not import content/site.ts or the content layer: it is reachable
 * from HeroCopy, which renders inside the client-side HeroStage, and pulling
 * Zod across that boundary is the single largest regression available to this
 * codebase. Enforced by scripts/check-bundle.mjs.
 */

export const HERO_CHECKPOINTS = {
  positioning: 0.22,
  spec: 0.58,
} as const;

export type HeroCheckpoint = keyof typeof HERO_CHECKPOINTS;
