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

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const HTML = join(ROOT, ".next", "server", "app", "index.html");

/** Total gzipped JS the home page may load, in KB. */
const BUDGET_KB = 150;

/**
 * Modules that must never reach the browser, with the reason. Matched against
 * chunk contents by a distinctive marker string.
 */
const FORBIDDEN = [
  {
    marker: "$ZodRealError",
    name: "zod",
    why: "content validation is build-time only; a client component is importing content/site.ts or src/lib/schemas.ts as a value",
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

async function main() {
  let html;
  try {
    html = await readFile(HTML, "utf8");
  } catch {
    console.error(
      `Could not read ${HTML}\nRun \`pnpm build\` before \`pnpm check:bundle\`.`,
    );
    process.exit(1);
  }

  // Scripts the document loads. `nomodule` bundles are excluded: they are only
  // fetched by browsers that predate ES modules, which is not the audience we
  // are budgeting for.
  const scriptTags = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
  const sources = new Set();

  let legacyBytes = 0;

  for (const tag of scriptTags) {
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

  // Preloaded chunks count too — they are fetched on load either way.
  for (const match of html.matchAll(
    /<link\b[^>]*\brel="preload"[^>]*\bhref="(\/_next\/static\/[^"]+\.js)"/g,
  )) {
    sources.add(match[1]);
  }

  if (sources.size === 0) {
    console.error(
      "No client scripts found in the prerendered HTML — is the build stale?",
    );
    process.exit(1);
  }

  let totalRaw = 0;
  let totalGz = 0;
  const rows = [];
  const violations = [];

  for (const src of [...sources].sort()) {
    const file = join(ROOT, ".next", src.replace("/_next/", ""));
    const buffer = await readFile(file);
    const gz = gzipSync(buffer).length;

    totalRaw += buffer.length;
    totalGz += gz;
    rows.push({ name: src.split("/").pop(), raw: buffer.length, gz });

    const text = buffer.toString("utf8");
    for (const rule of FORBIDDEN) {
      if (text.includes(rule.marker)) {
        violations.push({ ...rule, chunk: src.split("/").pop(), gz });
      }
    }
  }

  rows.sort((a, b) => b.gz - a.gz);

  console.log("Home page JavaScript\n");
  for (const row of rows) {
    console.log(
      `  ${kb(row.gz).padStart(7)} KB gz  ${kb(row.raw).padStart(8)} KB raw  ${row.name}`,
    );
  }
  console.log(
    `\n  ${kb(totalGz).padStart(7)} KB gz  ${kb(totalRaw).padStart(8)} KB raw  TOTAL (${rows.length} files)`,
  );
  console.log(`  budget: ${BUDGET_KB} KB gz`);
  if (legacyBytes > 0) {
    console.log(
      `  (excluded: ${kb(legacyBytes)} KB gz of nomodule polyfills, not fetched by modern browsers)`,
    );
  }
  console.log();

  let failed = false;

  if (violations.length > 0) {
    failed = true;
    console.error("Forbidden modules in the client bundle:\n");
    for (const v of violations) {
      console.error(`  ✖ ${v.name} found in ${v.chunk} (${kb(v.gz)} KB gz)`);
      console.error(`    ${v.why}\n`);
    }
  }

  if (totalGz / 1024 > BUDGET_KB) {
    failed = true;
    console.error(
      `Over budget: ${kb(totalGz)} KB gz exceeds the ${BUDGET_KB} KB limit ` +
        `by ${kb(totalGz - BUDGET_KB * 1024)} KB.\n`,
    );
  }

  if (failed) process.exit(1);
  console.log("Within budget.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
