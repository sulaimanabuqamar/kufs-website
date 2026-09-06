import type { MetadataRoute } from "next";

import { getPublishedNews, getPublishedNewsletter } from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { ALL_ROUTES } from "@/lib/nav";

/**
 * Routes come from src/lib/nav.ts — the same list the header and footer read —
 * so a page cannot be navigable but missing from the sitemap.
 *
 * News articles and newsletter issues are appended from their published
 * lists. DRAFTS ARE EXCLUDED:
 * the seeded placeholder posts are visible on the site behind a banner, but
 * they must not be submitted to search engines. The same `draft` flag drives
 * their exclusion here, from the home page, and their noindex robots tag.
 *
 * /styleguide is deliberately absent: it is a development surface and is
 * disallowed in robots.ts too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Origin comes from NEXT_PUBLIC_SITE_URL, falling back to this deployment's
  // own VERCEL_URL — a preview must not publish a sitemap of production URLs.
  const origin = siteUrl();

  const priorityFor = (route: string) => {
    if (route === "/") return 1;
    if (route === "/become-a-sponsor" || route === "/join") return 0.9;
    return 0.7;
  };

  const pages: MetadataRoute.Sitemap = ALL_ROUTES.map((route) => ({
    url: `${origin}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/news" ? "weekly" : "monthly",
    priority: priorityFor(route),
  }));

  const articles: MetadataRoute.Sitemap = getPublishedNews().map((post) => ({
    url: `${origin}/news/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Issues are dated to the first of their month; they are not edited after
  // publication, so "yearly" is honest rather than optimistic.
  const issues: MetadataRoute.Sitemap = getPublishedNewsletter().map((issue) => ({
    url: `${origin}/newsletter/${issue.slug}`,
    lastModified: new Date(`${issue.slug}-01T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...articles, ...issues];
}
