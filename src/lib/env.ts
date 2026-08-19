/**
 * Environment-derived configuration.
 *
 * Everything here is optional: the site builds and runs with none of it set.
 * That matters because a team member cloning the repo to fix a typo should not
 * have to obtain three secrets first.
 */

import site from "@/content/site";

/**
 * The canonical origin, no trailing slash.
 *
 * Resolution order, and the reason for it:
 *
 *   1. NEXT_PUBLIC_SITE_URL — set explicitly in Vercel's production
 *      environment. Always wins.
 *   2. VERCEL_URL — the per-deployment hostname Vercel injects. Used on
 *      previews so a preview build does not emit canonical tags, OG URLs and
 *      a sitemap all pointing at production. A preview claiming to be
 *      production is how duplicate-content problems start.
 *   3. content/site.ts — the documented default, for local development.
 *
 * VERCEL_URL is bare (no scheme), hence the prefix.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return site.url;
}

/**
 * Formspree endpoint for the enquiry forms.
 *
 * null when unset, which makes the forms fall back to `mailto:` rather than
 * POSTing into the void. See src/components/forms/EnquiryForm.tsx.
 */
export function formspreeEndpoint(): string | null {
  return process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || null;
}

/** True only on a Vercel production deployment. */
export function isProductionDeploy(): boolean {
  // Undefined off Vercel (local `next build`), which we treat as production so
  // a self-hosted build is not accidentally noindexed.
  return process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";
}
