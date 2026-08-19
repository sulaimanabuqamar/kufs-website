import type { NextConfig } from "next";

/**
 * The only thing this file does is route /admin at the TinaCMS panel.
 *
 * `tinacms build` writes a standalone single-page app to `public/admin/`, and
 * this rewrite serves its entry point. Two consequences worth stating:
 *
 * 1. The admin is NOT a Next route. No public page can import Tina's editor
 *    bundle, because there is no import path from the app to it — the JS
 *    budget on public routes is unaffected by construction, not by care.
 *
 * 2. `public/admin/` is gitignored and is only built when the Tina credentials
 *    are set (see scripts/build-admin.mjs). With no credentials the directory
 *    does not exist, this rewrite points at nothing, and Next returns 404.
 *    That is the whole "degrades to nothing" mechanism.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ];
  },

  async headers() {
    return [
      {
        // The admin is a static file Tina generates, so it cannot carry Next
        // metadata — an X-Robots-Tag header is the equivalent, and it applies
        // to the SPA's assets as well as its entry point. robots.ts disallows
        // the path too; this is the belt to that pair of braces, because a
        // Disallow only asks a crawler not to fetch, while noindex tells one
        // that already has the page not to list it.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
