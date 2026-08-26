#!/usr/bin/env node
/**
 * Fails the build when a new user-visible string is hardcoded in a component.
 *
 *   pnpm check:copy
 *
 * Every word on this site is editable from /admin, and the only way that stays
 * true is if the next feature someone builds cannot quietly reintroduce a
 * hardcoded heading. Without this check the panel degrades from "edit anything"
 * to "edit the parts nobody has touched since August", which is worse than not
 * having it — an editor who finds one string they cannot change stops trusting
 * that any of them work.
 *
 * WHAT IT LOOKS AT
 *
 * The TypeScript AST, not a regex — see scripts/lib/copy-scan.mjs for why.
 * A string is flagged when it is JSX text, a JSX expression child, or the
 * value of a prop that carries words (`title`, `label`, `lead`, `alt`, ...).
 * Strings on structural props (`className`, `href`, `id`, `aria-label`, ...)
 * and strings that are plainly code are not copy and are never flagged.
 *
 * THE ALLOWLIST
 *
 * Three escape hatches, in increasing order of how much explaining they need:
 *
 *   1. ALLOWED_FILES — whole files that are developer surfaces. /styleguide is
 *      the only page on this list, and it is on it because the brief says so:
 *      it exists to show developers the design system, and nobody reads it as
 *      the website.
 *
 *   2. ALLOWED_PROPS — prop names whose values are configuration that happens
 *      to be a string: `timeZone: "UTC"`, `locale: "en_GB"`, an SVG `d`
 *      attribute, an analytics event name. Editing any of these from a CMS
 *      would break something rather than reword it.
 *
 *   3. `// copy-ok` — a comment on the statement, for the genuinely one-off
 *      case. It requires a human to write down that they thought about it.
 *      There are currently zero of these, which is the right number.
 *
 * Expect to add to (2). Adding to (1) should feel like a bigger decision than
 * it looks, because a whole file exempted is a whole file that drifts.
 *
 * VERIFYING IT WORKS
 *
 *   node scripts/check-copy.mjs --self-test
 *
 * writes a component containing a hardcoded heading, confirms the check fails
 * on it, and removes it. A green run from a check nobody has seen fail is not
 * evidence of anything.
 */

import { mkdtempSync, rmSync, writeFileSync, globSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { scanFile } from "./lib/copy-scan.mjs";

const { values: argv } = parseArgs({
  options: {
    "self-test": { type: "boolean", default: false },
    verbose: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

/* -------------------------------------------------------------------------
   Allowlist
   ------------------------------------------------------------------------- */

/** Developer surfaces. Not read by anyone as the website. */
const ALLOWED_FILES = [
  // The design-system reference. Exists for developers; deliberately not
  // editable, because its labels name tokens and variants rather than say
  // anything to a visitor.
  "src/app/styleguide/",
];

/**
 * Props whose string values are configuration rather than words.
 *
 * Each of these would BREAK something if an editor changed it, rather than
 * reword something. That is the test for being on this list.
 */
const ALLOWED_PROPS = new Set([
  "timeZone", // Intl option. "UTC" is a timezone, not a word.
  "locale", // "en_GB" — a BCP 47 tag.
  "lang", // <html lang>. Same.
  "card", // Twitter card TYPE ("summary_large_image").
  "strategy", // next/script loading strategy.
  "event", // Plausible goal name. Renaming it breaks the funnel, silently.
  "d", // SVG path data.
  "stroke",
  "fill",
  "viewBox",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "xmlns",
  "preserveAspectRatio",
]);

/* -------------------------------------------------------------------------
   Scan
   ------------------------------------------------------------------------- */

const ROOT = process.cwd();

function scanTree() {
  const files = globSync("src/{app,components}/**/*.{tsx,ts}", { cwd: ROOT })
    .filter((file) => !ALLOWED_FILES.some((prefix) => file.startsWith(prefix)))
    .sort();

  const findings = [];
  for (const file of files) {
    for (const hit of scanFile(join(ROOT, file))) {
      if (hit.prop && ALLOWED_PROPS.has(hit.prop)) continue;
      findings.push({ file, ...hit });
    }
  }
  return { files, findings };
}

/* -------------------------------------------------------------------------
   Self-test
   ------------------------------------------------------------------------- */

if (argv["self-test"]) {
  const dir = mkdtempSync(join(tmpdir(), "copy-check-"));
  const file = join(dir, "Regression.tsx");
  writeFileSync(
    file,
    `export function Regression() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2 text-text">Back the next milestone</h2>
      <p>Every date on this page has a cost behind it.</p>
    </section>
  );
}
`,
  );

  const hits = scanFile(file).filter((hit) => !(hit.prop && ALLOWED_PROPS.has(hit.prop)));
  rmSync(dir, { recursive: true, force: true });

  console.log("check:copy self-test\n");
  if (hits.length >= 2) {
    console.log(`  PASS  a hardcoded heading and paragraph were both detected:`);
    for (const hit of hits) console.log(`          ${hit.kind}  "${hit.text}"`);
    console.log("");
    process.exit(0);
  }
  console.error(
    `  FAIL  the check did not detect hardcoded copy (${hits.length} finding(s)).\n` +
      `        The heuristic in scripts/lib/copy-scan.mjs has regressed — a green\n` +
      `        run from it currently means nothing.\n`,
  );
  process.exit(1);
}

/* -------------------------------------------------------------------------
   Run
   ------------------------------------------------------------------------- */

const { files, findings } = scanTree();

console.log("Hardcoded copy check\n");
console.log(`  scanned  ${files.length} files under src/app and src/components`);
console.log(`  skipped  ${ALLOWED_FILES.join(", ")}\n`);

if (findings.length === 0) {
  console.log("  PASS  every user-visible string comes from content/copy.\n");
  process.exit(0);
}

const byFile = new Map();
for (const finding of findings) {
  if (!byFile.has(finding.file)) byFile.set(finding.file, []);
  byFile.get(finding.file).push(finding);
}

console.error(
  `  FAIL  ${findings.length} hardcoded string(s) in ${byFile.size} file(s):\n`,
);
for (const [file, hits] of byFile) {
  console.error(`    ${file}`);
  for (const hit of hits) {
    const where = hit.prop ? `${hit.kind} on \`${hit.prop}\`` : hit.kind;
    console.error(`      ${String(hit.line).padStart(4)}  ${where}`);
    console.error(`            "${hit.text.slice(0, 90)}"`);
  }
  console.error("");
}
console.error(
  "  Every user-visible string belongs in content/copy/<page>.json, so a\n" +
    "  committee lead can change it from /admin without a pull request.\n\n" +
    "  To fix:\n" +
    "    1. add the field to the page's schema in src/lib/schemas.ts\n" +
    "       (pick a length limit the design actually holds)\n" +
    "    2. add the text to content/copy/<page>.json\n" +
    '    3. read it with getCopy("<page>") and render {copy.thing}\n' +
    "    4. add a plain-English label in tina/overlays.ts\n\n" +
    "  If it is genuinely not editorial — a locale, an analytics event, an SVG\n" +
    "  path — add its PROP to ALLOWED_PROPS in this file, with a reason.\n",
);
process.exit(1);
