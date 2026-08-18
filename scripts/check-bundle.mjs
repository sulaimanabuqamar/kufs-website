#!/usr/bin/env node
/**
 * Enforces the home page's JavaScript budget.
 *
 *   pnpm build && pnpm check:bundle
 *
 * Run in CI after the build. It exists because the two ways this site gets
 * slow are both silent:
 *
 *   1. A server-only module gets imported by a client component and drags its
 *      whole dependency tree into the browser. This has already happened once:
 *      MobileNav imported Wordmark, Wordmark imported content/site.ts, and
 *      Zod's 70 KB gzipped landed in the bundle of a page that does not
 *      validate anything at runtime. Nothing failed. Nothing warned.
 *
 *   2. A dependency that is supposed to be lazy stops being lazy — three.js
 *      is one `import` away from the critical path at all times.
 *
 * So: parse the prerendered HTML for /, sum what the browser will actually
 * download, and fail the build if it crosses the line or contains something
 * from the forbidden list.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, ".next", "server", "app");

/** Total gzipped JS any single route may load, in KB. */
const BUDGET_KB = 150;

/**
 * Modules that must never reach the browser, with the reason. Matched against
 * chunk contents by a distinctive marker string.
 */
const FORBIDDEN = [
  {
    marker: "$ZodRealError",
    name: "zod",
    why: "content validation is build-time only. A client component is importing content/site.ts or src/lib/schemas.ts as a VALUE — import types only, or move the constant into a zod-free module such as src/lib/tiers.ts",
  },
  {
    marker: "WebGLRenderer",
    name: "three.js",
    why: "hero Mode B must stay behind its dynamic import; check next/dynamic ssr:false in HeroStage.tsx",
  },
  {
    marker: "gray-matter",
    name: "gray-matter",
    why: "MDX frontmatter is parsed at build time only",
  },
];

function kb(bytes) {
  return (bytes / 1024).toFixed(1);
}

/** Every prerendered route, as `route -> html path`. */
async function findRoutes() {
  const routes = [];
  const walk = async (dir, prefix) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, `${prefix}/${entry.name}`);
      } else if (entry.name.endsWith(".html")) {
        const base = entry.name.replace(/\.html$/, "");
        const route =
          base === "index" ? prefix || "/" : `${prefix}/${base}`.replace(/^$/, "/");
        routes.push({ route, file: full });
      }
    }
  };
  await walk(APP_DIR, "");
  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

/** Scripts a document actually loads, split into modern and legacy. */
async function scriptsFor(html) {
  const sources = new Set();
  let legacyBytes = 0;

  for (const tag of [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0])) {
    const src = tag.match(/\bsrc="(\/_next\/static\/[^"]+\.js)"/);
    if (!src) continue;

    // React serialises the attribute as `noModule`, not `nomodule` — match
    // case-insensitively or the legacy polyfill bundle silently counts against
    // a budget no modern browser ever spends.
    if (/\bnomodule\b/i.test(tag)) {
      legacyBytes += gzipSync(
        await readFile(join(ROOT, ".next", src[1].replace("/_next/", ""))),
      ).length;
      continue;
    }
    sources.add(src[1]);
  }

  for (const match of html.matchAll(
    /<link\b[^>]*\brel="preload"[^>]*\bhref="(\/_next\/static\/[^"]+\.js)"/g,
  )) {
    sources.add(match[1]);
  }

  return { sources: [...sources].sort(), legacyBytes };
}

async function main() {
  const routes = await findRoutes();
  if (routes.length === 0) {
    console.error("No prerendered HTML found. Run `pnpm build` first.");
    process.exit(1);
  }

  console.log(
    `JavaScript per route (budget ${BUDGET_KB} KB gzipped, nomodule polyfills excluded)\n`,
  );

  let failed = 0;

  for (const { route, file } of routes) {
    const html = await readFile(file, "utf8");
    const { sources, legacyBytes } = await scriptsFor(html);
    if (sources.length === 0) continue;

    let totalGz = 0;
    const violations = [];

    for (const src of sources) {
      const buffer = await readFile(join(ROOT, ".next", src.replace("/_next/", "")));
      totalGz += gzipSync(buffer).length;
      const text = buffer.toString("utf8");
      for (const rule of FORBIDDEN) {
        if (text.includes(rule.marker)) {
          violations.push({ ...rule, chunk: src.split("/").pop() });
        }
      }
    }

    const over = totalGz / 1024 > BUDGET_KB;
    const bad = over || violations.length > 0;
    if (bad) failed += 1;

    console.log(
      `  ${bad ? "!!" : "ok"}  ${route.padEnd(20)} ${kb(totalGz).padStart(7)} KB gz` +
        `  (${sources.length} files${legacyBytes ? `, +${kb(legacyBytes)} KB legacy skipped` : ""})`,
    );

    for (const v of violations) {
      console.error(`        ✖ ${v.name} in ${v.chunk}\n          ${v.why}`);
    }
    if (over) {
      console.error(`        ✖ over budget by ${kb(totalGz - BUDGET_KB * 1024)} KB`);
    }
  }

  console.log(
    failed === 0
      ? `\nAll ${routes.length} routes within budget.\n`
      : `\n${failed} route(s) with problems.\n`,
  );
  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
