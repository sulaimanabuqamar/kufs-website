#!/usr/bin/env node
/**
 * Converts the headline face to a subset WOFF2 for self-hosting.
 *
 *   pnpm font:subset src/assets/fonts/A4Speed-Bold.ttf
 *   pnpm font:subset <src> --out src/assets/fonts/a4-speed-subset.woff2
 *
 * A4 Speed is a display face used only for h1–h3 and stat numerals (see
 * src/lib/fonts.ts). Shipping its full character set would be pure waste, so
 * this subsets to Latin + digits + the punctuation the site actually uses, and
 * converts to WOFF2.
 *
 * Uses the wasm build of harfbuzz via `subset-font` — no Python, no fontTools,
 * no native toolchain, so it runs the same on a laptop and in CI.
 *
 * It prints the before/after size and warns if the result exceeds the 30 KB
 * budget the brief set for the headline face.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, basename } from "node:path";
import { parseArgs } from "node:util";
import subsetFont from "subset-font";

const { values, positionals } = parseArgs({
  options: {
    out: { type: "string", default: "src/assets/fonts/a4-speed-subset.woff2" },
    budget: { type: "string", default: "30" },
  },
  allowPositionals: true,
});

if (positionals.length !== 1) {
  console.error(
    "Usage: pnpm font:subset <path-to-font.ttf|otf|woff2> [--out <path>] [--budget <KB>]",
  );
  process.exit(1);
}

/**
 * The character set the headline face is allowed to render.
 *
 * Headlines on this site are uppercase Latin, so lowercase is included only
 * because CSS `text-transform` does not change the glyphs the font must carry
 * if the source text is mixed case. Digits are needed for the stat numerals
 * (lap times, mass in kg, placings). Punctuation is limited to what appears in
 * the copy: the ampersand, the em dash, the apostrophe, the middot separator.
 *
 * Deliberately excluded: Arabic. Khalifa University is in Abu Dhabi and an
 * Arabic-language version of this site is a real possibility — but A4 Speed
 * has no Arabic coverage, so that would need a separate face anyway, and
 * silently shipping a partial Arabic subset would be worse than none.
 */
const CHARSET = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  " .,:;!?'\"’“”-–—/&%+()[]#@·°",
].join("");

const source = positionals[0];
const outPath = values.out;
const budgetKb = Number(values.budget);

const original = await readFile(source);

const subset = await subsetFont(original, CHARSET, { targetFormat: "woff2" });

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, subset);

const kb = (n) => (n / 1024).toFixed(1);
const saved = ((1 - subset.length / original.length) * 100).toFixed(1);

console.log(
  `\n  source   ${basename(source).padEnd(32)} ${kb(original.length).padStart(8)} KB`,
);
console.log(
  `  subset   ${basename(outPath).padEnd(32)} ${kb(subset.length).padStart(8)} KB`,
);
console.log(`  saved    ${saved}%  (${CHARSET.length} glyphs requested)\n`);

if (subset.length / 1024 > budgetKb) {
  console.warn(
    `  ! ${kb(subset.length)} KB exceeds the ${budgetKb} KB budget for the headline face.\n` +
      `    Consider dropping lowercase (headlines are uppercase) or trimming punctuation.\n`,
  );
} else {
  console.log(`  Within the ${budgetKb} KB budget.\n`);
}

console.log(`  Next: enable the localFont block in src/lib/fonts.ts.\n`);
