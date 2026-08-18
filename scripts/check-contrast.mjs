#!/usr/bin/env node
/**
 * Verifies every contrast ratio claimed in src/styles/tokens.css.
 *
 *   pnpm check:contrast
 *
 * The token file documents each colour's measured ratio against the surfaces
 * it is meant to sit on. Those comments are the accessibility contract for the
 * whole site — but a comment cannot stop someone nudging a hex value, and a
 * stale ratio is worse than no ratio because it is trusted.
 *
 * So the comments are parsed and re-measured. Any claim that no longer holds
 * fails the build.
 *
 * It also enforces the one hard brand rule: Racing Red must stay BELOW 3:1 on
 * every dark surface, which is what makes it decorative-only. If someone ever
 * "fixes" that by lightening the red, this fails — deliberately. The rule is
 * that red is not a UI colour on navy, not that the red should be changed.
 */

import { readFile } from "node:fs/promises";

const TOKENS = "src/styles/tokens.css";
const TOLERANCE = 0.05;

function luminance(hex) {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

const css = await readFile(TOKENS, "utf8");

/* Every `--token: #hex;` declaration. */
const values = new Map();
for (const m of css.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  values.set(m[1], m[2].toLowerCase());
}

/* Ratio claims look like "8.93:1 on --color-bg". A claim belongs to the first
   token declared after the comment block it sits in. */
const claims = [];
const lines = css.split("\n");
let pending = [];

for (const line of lines) {
  for (const m of line.matchAll(/(\d+\.?\d*):1 on (--[a-z0-9-]+)/g)) {
    pending.push({ expected: Number(m[1]), against: m[2] });
  }
  // "on pure white" is a legitimate second reference point.
  for (const m of line.matchAll(/(\d+\.?\d*):1 on pure white/g)) {
    pending.push({ expected: Number(m[1]), against: "#ffffff" });
  }
  const decl = line.match(/^\s*(--[a-z0-9-]+):\s*#[0-9a-fA-F]{6}\s*;/);
  if (decl && pending.length) {
    for (const c of pending) claims.push({ ...c, token: decl[1] });
    pending = [];
  }
  if (decl) pending = [];
}

let failed = 0;
console.log(`Checking ${claims.length} contrast claims in ${TOKENS}\n`);

for (const claim of claims) {
  const fg = values.get(claim.token);
  const bg = claim.against.startsWith("#") ? claim.against : values.get(claim.against);
  if (!fg || !bg) {
    console.error(`  ?? ${claim.token} vs ${claim.against} — token not found`);
    failed += 1;
    continue;
  }
  const measured = ratio(fg, bg);
  const ok = Math.abs(measured - claim.expected) <= TOLERANCE;
  if (!ok) failed += 1;
  console.log(
    `  ${ok ? "ok" : "!!"}  ${claim.token} on ${claim.against}` +
      `  claimed ${claim.expected}  measured ${measured}`,
  );
}

/* --- the Racing Red rule ------------------------------------------------- */
console.log("\nRacing Red must remain decorative-only on dark:");
const red = values.get("--color-stripe-red");
let redOk = true;
for (const surface of ["--color-bg", "--color-surface", "--color-surface-raised"]) {
  const r = ratio(red, values.get(surface));
  const belowThreshold = r < 3;
  if (!belowThreshold) redOk = false;
  console.log(
    `  ${belowThreshold ? "ok" : "!!"}  ${r}:1 on ${surface}` +
      `  ${belowThreshold ? "(below 3:1 — decorative only, as documented)" : "(NOW PASSES 3:1 — the red has been changed)"}`,
  );
}
if (!redOk) {
  failed += 1;
  console.error(
    "\n  Racing Red now clears 3:1 on a dark surface. Either the brand red or a\n" +
      "  dark surface token has been altered. Do not resolve this by changing the\n" +
      "  red — the brand sheet fixes it at #AC2A26.",
  );
}

/* --- light sections ------------------------------------------------------- */
console.log("\nLight sections:");
for (const [fg, bg, min, label] of [
  ["--color-text-on-light", "--color-bg-light", 4.5, "body text"],
  ["--color-muted-on-light", "--color-bg-light", 4.5, "muted text"],
  ["--color-accent-on-light", "--color-bg-light", 4.5, "red accent"],
]) {
  const r = ratio(values.get(fg), values.get(bg));
  const ok = r >= min;
  if (!ok) failed += 1;
  console.log(`  ${ok ? "ok" : "!!"}  ${label.padEnd(11)} ${r}:1 (needs ${min})`);
}
const whiteOnRed = ratio("#ffffff", values.get("--color-accent-on-light"));
const wor = whiteOnRed >= 4.5;
if (!wor) failed += 1;
console.log(
  `  ${wor ? "ok" : "!!"}  button      ${whiteOnRed}:1 white on red (needs 4.5)`,
);

console.log(
  failed === 0 ? "\nAll contrast claims hold.\n" : `\n${failed} contrast problem(s).\n`,
);
if (failed) process.exit(1);
