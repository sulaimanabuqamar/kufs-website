import type { MetadataRoute } from "next";

import { isProductionDeploy, siteUrl } from "@/lib/env";

/**
 * Preview deploys must never be indexed — a Vercel preview outranking the
 * real site for the team name is a genuinely embarrassing way to lose search
 * traffic. VERCEL_ENV is set automatically on Vercel.
 */
export default function robots(): MetadataRoute.Robots {
  // Preview and development deployments are disallowed outright. A preview URL
  // outranking the real site for the team name is a genuinely embarrassing way
  // to lose search traffic, and it is entirely preventable.
  if (!isProductionDeploy()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const origin = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Development-only surface; see src/app/styleguide.
        // /admin is the TinaCMS panel. It 404s unless the Tina credentials are
        // set on the deployment, but it is disallowed unconditionally: a
        // committee that switches the CMS on later should not have to remember
        // to come back and edit this file. It is also absent from sitemap.ts,
        // which is generated from ALL_ROUTES and never contained it.
        disallow: ["/styleguide", "/admin"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
