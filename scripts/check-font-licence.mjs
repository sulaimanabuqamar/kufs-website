#!/usr/bin/env node
/**
 * Stops an unlicensed font binary being committed.
 *
 *   pnpm check:font-licence
 *
 * A4 Speed is free for personal use only; this site carries sponsor logos, so
 * KUFS needs the author's USD 12 commercial licence. This repository is
 * PUBLIC, which means committing the binary is redistribution in its own
 * right — separately from whether the site serves it.
 *
 * So: a font binary may only be tracked in git if a licence certificate sits
 * beside it. .gitignore already excludes the binaries; this is the backstop
 * for someone using `git add -f`, and it is the thing that makes the licence
 * obligation enforced rather than remembered.
 *
 * To satisfy it after buying the licence, commit the receipt or certificate as
 * src/assets/fonts/LICENCE-A4SPEED.txt alongside the font.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const CERTIFICATE = "src/assets/fonts/LICENCE-A4SPEED.txt";
const BINARY = /\.(ttf|otf|woff2?|eot)$/i;

/** Font binaries git is currently tracking. */
function trackedFontBinaries() {
  const output = execFileSync("git", ["ls-files"], { encoding: "utf8" });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((file) => file && BINARY.test(file));
}

const tracked = trackedFontBinaries();
const licensed = existsSync(CERTIFICATE);

console.log("Font licence check\n");

if (tracked.length === 0) {
  console.log("  ok  no font binaries are tracked in git");
  console.log(
    "      The headline face falls back to Barlow Condensed Bold Italic,\n" +
      "      which is what production serves today.\n",
  );
  process.exit(0);
}

console.log(`  ${tracked.length} font binary/binaries tracked:`);
for (const file of tracked) console.log(`    ${file}`);
console.log();

if (licensed) {
  console.log(`  ok  licence certificate present at ${CERTIFICATE}\n`);
  process.exit(0);
}

console.error(
  `  FAIL  a font binary is committed but ${CERTIFICATE} does not exist.\n\n` +
    `  A4 Speed is licensed for personal use only in its free form, and this\n` +
    `  repository is public — committing the binary redistributes it.\n\n` +
    `  Either:\n` +
    `    • remove it   git rm --cached <file>   (the site falls back cleanly), or\n` +
    `    • licence it  buy the USD 12 commercial licence at paypal.me/a4grafica,\n` +
    `                  request the certificate from coki@outlook.com or Instagram\n` +
    `                  @a4speedfont, and commit it as ${CERTIFICATE}\n`,
);
process.exit(1);
