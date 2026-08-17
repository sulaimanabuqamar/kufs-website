import type { MetadataRoute } from "next";

import site from "@/content/site";
import { ALL_ROUTES } from "@/lib/nav";

/**
 * Routes come from src/lib/nav.ts — the same list the header and footer read —
 * so a page cannot be navigable but missing from the sitemap.
 *
 * /styleguide is deliberately absent: it is a development surface and is
 * disallowed in robots.ts too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const priorityFor = (route: string) => {
    if (route === "/") return 1;
    if (route === "/become-a-sponsor" || route === "/join") return 0.9;
    return 0.7;
  };

  return ALL_ROUTES.map((route) => ({
    url: `${site.url}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/news" ? "weekly" : "monthly",
    priority: priorityFor(route),
  }));
}
