#!/usr/bin/env node
/**
 * Builds the TinaCMS admin panel — but only when Tina is actually configured.
 *
 * Runs ahead of `next build`. If NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN are
 * both set, it builds the admin single-page app into `public/admin/`. If
 * either is missing it does nothing, successfully, and the build continues.
 *
 * THAT IS THE WHOLE GATE. `public/admin/` is gitignored, so with no
 * credentials the directory never exists, the `/admin` rewrite in
 * next.config.ts points at a file that is not there, and Next returns 404.
 *
 * This is deliberately the same shape as the A4 Speed licence gate: the
 * presence of a file, not a flag someone has to remember to flip. A future
 * committee that lets the Tina account lapse gets a site that builds, deploys
 * and serves exactly as before, with all of its content still editable in git.
 * Nothing degrades except the convenience layer.
 *
 * The admin is a separate SPA rather than a Next route, which is also why no
 * public page can import Tina's editor bundle — there is no import path from
 * the app to it at all. `pnpm check:bundle` would catch it if there were.
 */

import { spawnSync } from "node:child_process";

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const token = process.env.TINA_TOKEN;

if (!clientId || !token) {
  const missing = [
    !clientId && "NEXT_PUBLIC_TINA_CLIENT_ID",
    !token && "TINA_TOKEN",
  ].filter(Boolean);

  console.log(
    `\nAdmin panel: not built (${missing.join(" and ")} unset).\n` +
      `  The site builds and serves normally; /admin returns 404.\n` +
      `  See the TinaCMS section of CONTRIBUTING.md to set it up.\n`,
  );
  process.exit(0);
}

console.log("\nAdmin panel: building (Tina credentials present).\n");

const result = spawnSync("pnpm", ["exec", "tinacms", "build", "--skip-cloud-checks"], {
  stdio: "inherit",
});

if (result.status !== 0) {
  console.error(
    "\nAdmin panel build FAILED.\n" +
      "  This is fatal on purpose: the credentials are set, so somebody expects\n" +
      "  /admin to work. Silently shipping without it would look like the panel\n" +
      "  had simply broken.\n",
  );
  process.exit(result.status ?? 1);
}
