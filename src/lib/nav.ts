/**
 * Sitewide navigation STRUCTURE.
 *
 * One source of truth for which pages exist and in what order, consumed by
 * the desktop header, the mobile drawer, the footer and the sitemap — so a new
 * page cannot appear in one and be missing from another.
 *
 * THE LABELS ARE NOT HERE ANY MORE. They are editable from /admin and live in
 * `content/copy/common.json`; `getNav()` in src/lib/content.ts merges them
 * onto these routes and fails the build if a route has lost its label.
 *
 * The split is deliberate and is the line the brief drew: an editor may
 * reword "Partner With Us", and may not delete /become-a-sponsor, invent a
 * page that does not exist, or change a URL that sponsors have in an email.
 * Route identity is a structural decision with consequences a CMS cannot see.
 *
 * This module stays free of Zod and `node:fs` so client components can import
 * it. Enforced by scripts/check-bundle.mjs.
 */

/** Ordered, and the order is what the header renders. */
export const PRIMARY_ROUTES = [
  "/the-car",
  "/team",
  "/progress",
  "/sponsors",
  "/become-a-sponsor",
  "/news",
  "/newsletter",
  "/join",
] as const;

/** Footer only. */
export const SECONDARY_ROUTES = ["/press-kit", "/contact"] as const;

export type PrimaryRoute = (typeof PRIMARY_ROUTES)[number];
export type SecondaryRoute = (typeof SECONDARY_ROUTES)[number];

/** A route plus the words an editor chose for it. */
export type NavItem = {
  href: string;
  label: string;
  /** Short description, used in the mobile drawer and the footer columns. */
  description?: string;
};

/**
 * Where the two sitewide calls to action point.
 *
 * Their LABELS come from copy (`common.cta`); only the destinations are fixed
 * here. "Join the Team" is a plain nav link rather than a button because
 * recruitment converts from the body of the site — the home page recruitment
 * band, /team, /join — where a student has already been persuaded. Sponsorship
 * has no such warm path, so it takes the header CTA.
 */
export const CTA_HREF = {
  sponsor: "/become-a-sponsor",
  join: "/join",
} as const;

/** Every route that should appear in sitemap.xml. */
export const ALL_ROUTES: readonly string[] = [
  "/",
  ...PRIMARY_ROUTES,
  ...SECONDARY_ROUTES,
] as const;
