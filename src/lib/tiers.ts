/**
 * Sponsor tier identifiers and their human labels.
 *
 * These are the team's real tiers, from the official sponsorship pack:
 * Tier 1 (AED 100,000), Tier 2 (AED 60,000), Tier 3 (AED 25,000) and In-Kind
 * (value-based). They replaced an invented Title/Gold/Silver/Bronze ladder.
 *
 * Deliberately zod-free and dependency-free. Client components need these —
 * the sponsorship enquiry form builds its tier <select> from them — and
 * src/lib/schemas.ts cannot be imported across the client boundary without
 * dragging all of Zod (~66 KB gzipped) into the browser. That regression has
 * happened twice, which is why these constants live in their own module and
 * why scripts/check-bundle.mjs checks every route rather than just the home
 * page.
 *
 * schemas.ts imports SPONSOR_TIERS from here to build its enum, so there is
 * still exactly one list.
 */

export const SPONSOR_TIERS = ["tier1", "tier2", "tier3", "inkind"] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export const TIER_LABEL: Record<SponsorTier, string> = {
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "Tier 3",
  inkind: "In-Kind",
};
