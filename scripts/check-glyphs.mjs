#!/usr/bin/env node
/**
 * Fails the build if any text rendered in the display face uses a character
 * the display face does not have.
 *
 *   pnpm build && pnpm start &
 *   node scripts/check-glyphs.mjs --url http://localhost:3000
 *
 * A4 Speed maps exactly the printable ASCII range U+0020-U+007E — 95 of its 98
 * glyphs. It has no en dash, no em dash, no curly quotes or apostrophes, no
 * middle dot, no degree sign, no accented letters. Anything outside that range
 * renders as a fallback glyph from a completely different typeface sitting in
 * the middle of a headline, or as tofu.
 *
 * WHY THIS IS A RUNTIME CHECK AND NOT A GREP
 *
 * Whether a string lands in the display face depends on where it is rendered,
 * not on how it is written. `globals.css` puts h1-h3 on --font-display; the
 * `.font-display` utility and the eyebrow style do too. The same string in
 * content/site.json is fine in a paragraph and broken in a heading. Only the
 * rendered DOM knows which is which, so this walks it: every text node whose
 * resolved font-family names the display face is checked, character by
 * character, against the real cmap.
 *
 * WHERE THE COVERAGE SET COMES FROM
 *
 * src/assets/fonts/A4SPEED-Bold.ttf when it is present — the authority. It is
 * gitignored (personal-use licence, public repo — see README Licensing), so in
 * CI it is absent and the check falls back to scripts/data/a4-speed-coverage.json,
 * which is the same cmap extracted to a range list. That manifest is metadata,
 * not the font. Regenerate it with --regenerate when the font is on disk.
 *
 * The check runs whether or not the licensed binary ships, deliberately: these
 * strings must be safe on the day the licence lands, not fixed afterwards.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

import { chromium } from "playwright";

import { inspectFont } from "./lib/font-tables.mjs";

const { values: argv } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3000" },
    paths: {
      type: "string",
      default:
        "/,/the-car,/progress,/news,/newsletter,/team,/join,/sponsors,/become-a-sponsor,/contact,/styleguide",
    },
    regenerate: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const FONT_PATH = "src/assets/fonts/A4SPEED-Bold.ttf";
const MANIFEST_PATH = "scripts/data/a4-speed-coverage.json";

/* -------------------------------------------------------------------------- */
/* Coverage                                                                    */
/* -------------------------------------------------------------------------- */

function rangesFrom(codepoints) {
  const sorted = [...codepoints].sort((a, b) => a - b);
  const ranges = [];
  for (const cp of sorted) {
    const last = ranges.at(-1);
    if (last && cp === last[1] + 1) last[1] = cp;
    else ranges.push([cp, cp]);
  }
  return ranges;
}

function loadCoverage() {
  if (existsSync(FONT_PATH)) {
    const font = inspectFont(readFileSync(FONT_PATH));
    return { source: FONT_PATH, codepoints: font.codepoints, font };
  }
  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      `No coverage available: neither ${FONT_PATH} nor ${MANIFEST_PATH} exists.`,
    );
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const codepoints = new Set();
  for (const [start, end] of manifest.ranges) {
    for (let cp = start; cp <= end; cp += 1) codepoints.add(cp);
  }
  return { source: MANIFEST_PATH, codepoints };
}

if (argv.regenerate) {
  if (!existsSync(FONT_PATH)) {
    console.error(`Cannot regenerate: ${FONT_PATH} is not on disk.`);
    process.exit(1);
  }
  const font = inspectFont(readFileSync(FONT_PATH));
  writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify(
      {
        note: "Codepoint coverage of A4 Speed Bold, extracted from the cmap table by scripts/lib/font-tables.mjs. This is metadata, not the font: it exists so pnpm check:glyphs can run in CI, where the licensed binary is absent. Regenerate with: pnpm check:glyphs --regenerate",
        family: font.family,
        subfamily: font.subfamily,
        numGlyphs: font.numGlyphs,
        mapped: font.codepoints.size,
        ranges: rangesFrom(font.codepoints),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Regenerated ${MANIFEST_PATH} — ${font.codepoints.size} mapped.`);
  process.exit(0);
}

const coverage = loadCoverage();

/* -------------------------------------------------------------------------- */
/* Collection                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Runs in the page. Returns every distinct string rendered in the display face,
 * with a CSS-path-ish locator for the element carrying it.
 *
 * Elements are matched on their RESOLVED font-family naming the display family,
 * which is true whether or not the binary is present — the computed value is
 * the declared stack, not the face that actually won.
 */
const COLLECT = (displayFamily) => {
  const found = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  const where = (el) => {
    const parts = [];
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const id = node.id ? `#${node.id}` : "";
      parts.unshift(node.tagName.toLowerCase() + id);
      if (id) break;
    }
    return parts.slice(-3).join(" > ");
  };

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    if (!text || !text.trim()) continue;

    const el = node.parentElement;
    if (!el) continue;

    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    // Screen-reader-only text is still rendered text; keep it.
    if (!style.fontFamily.toLowerCase().includes(displayFamily.toLowerCase())) continue;

    found.push({ text, where: where(el) });
  }
  return found;
};

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

const BASE = argv.url.replace(/\/$/, "");
const PATHS = argv.paths.split(",").filter(Boolean);

const NAMES = {
  0x2013: "EN DASH",
  0x2014: "EM DASH",
  0x2018: "LEFT SINGLE QUOTATION MARK",
  0x2019: "RIGHT SINGLE QUOTATION MARK (curly apostrophe)",
  0x201c: "LEFT DOUBLE QUOTATION MARK",
  0x201d: "RIGHT DOUBLE QUOTATION MARK",
  0x00b7: "MIDDLE DOT",
  0x2022: "BULLET",
  0x00b0: "DEGREE SIGN",
  0x2192: "RIGHTWARDS ARROW",
  0x00a0: "NO-BREAK SPACE",
  0x2026: "HORIZONTAL ELLIPSIS",
  0x00d7: "MULTIPLICATION SIGN",
};

console.log(`Display-font glyph coverage\n`);
console.log(`  coverage source  ${coverage.source}`);
console.log(`  mapped points    ${coverage.codepoints.size}`);
console.log(`  base             ${BASE}\n`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const violations = [];
let scanned = 0;

for (const path of PATHS) {
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  if (!response || response.status() >= 400) {
    console.log(`  skip  ${path} (${response ? response.status() : "no response"})`);
    continue;
  }

  const strings = await page.evaluate(COLLECT, "A4 Speed");
  scanned += strings.length;

  for (const { text, where } of strings) {
    for (const char of text) {
      const cp = char.codePointAt(0);
      // U+00A0 renders as a space in every fallback; it is not a tofu risk, but
      // it IS unmapped, so it is reported rather than silently allowed.
      if (coverage.codepoints.has(cp)) continue;
      violations.push({
        path,
        where,
        char,
        cp,
        name: NAMES[cp] ?? `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
        text: text.trim().slice(0, 70),
      });
    }
  }
  console.log(`  ok    ${path} — ${strings.length} display strings`);
}

await browser.close();

console.log(`\n  ${scanned} display strings scanned across ${PATHS.length} pages\n`);

if (violations.length === 0) {
  console.log("  PASS  every character in the display face is mapped.\n");
  process.exit(0);
}

// Group so one bad character in a repeated component reads as one problem.
const byChar = new Map();
for (const v of violations) {
  const key = v.cp;
  if (!byChar.has(key)) byChar.set(key, { ...v, hits: [] });
  byChar.get(key).hits.push(v);
}

console.error(`  FAIL  ${byChar.size} unmapped character(s) in display-face text:\n`);
for (const entry of byChar.values()) {
  console.error(
    `    "${entry.char}"  U+${entry.cp.toString(16).toUpperCase().padStart(4, "0")}  ${entry.name}  (${entry.hits.length} occurrence(s))`,
  );
  for (const hit of entry.hits.slice(0, 4)) {
    console.error(`        ${hit.path}  ${hit.where}`);
    console.error(`        "${hit.text}"`);
  }
  if (entry.hits.length > 4)
    console.error(`        ...and ${entry.hits.length - 4} more`);
  console.error("");
}
console.error(
  "  A4 Speed maps U+0020-U+007E only. Replace these with ASCII equivalents:\n" +
    "    curly apostrophe -> '      en/em dash -> -      middle dot -> |  or  -\n" +
    '    curly quotes     -> "      ellipsis   -> ...    degree     -> deg\n' +
    "  Or move the string out of the display face.\n",
);
process.exit(1);
