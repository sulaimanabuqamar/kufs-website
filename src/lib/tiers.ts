/**
 * Sponsor tier identifiers and their human labels.
 *
 * Deliberately zod-free and dependency-free. Client components need these —
 * the sponsorship enquiry form builds its tier <select> from them — and
 * src/lib/schemas.ts cannot be imported across the client boundary without
 * dragging all of Zod (~66 KB gzipped) into the browser.
 *
 * That regression has now happened twice, which is why the tier constants live
 * in their own module and why scripts/check-bundle.mjs checks every route
 * rather than just the home page.
 *
 * schemas.ts imports SPONSOR_TIERS from here to build its enum, so there is
 * still exactly one list.
 */

export const SPONSOR_TIERS = ["title", "gold", "silver", "bronze", "inkind"] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export const TIER_LABEL: Record<SponsorTier, string> = {
  title: "Title partner",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  inkind: "In-kind",
};
