import type { MetadataRoute } from "next";

import site from "@/content/site";

/**
 * Preview deploys must never be indexed — a Vercel preview outranking the
 * real site for the team name is a genuinely embarrassing way to lose search
 * traffic. VERCEL_ENV is set automatically on Vercel.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === undefined;

  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Development-only surface; see src/app/styleguide.
        disallow: ["/styleguide"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
