#!/usr/bin/env node
/**
 * Generates the placeholder imagery referenced by /content: sponsor logos,
 * team portraits and news covers.
 *
 *   pnpm assets:placeholders
 *
 * These are our own generated files — no stock photography, no downloaded
 * logos, nothing with a licence attached. Every one is visibly a placeholder
 * so nobody mistakes it for a real sponsor's mark or a real person's photo.
 *
 * Dimensions here MUST match the width/height declared in the content files,
 * because every image on the site goes through next/image with explicit
 * dimensions and a mismatch would reintroduce layout shift.
 *
 * Real assets simply overwrite these at the same paths; this script is not
 * part of the build and never runs in CI.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

// Mirrors src/styles/tokens.css.
const C = {
  bg: "#16143c",
  surface: "#25225e",
  raised: "#2e2b70",
  text: "#ffffff",
  muted: "#b9b6d8",
  accent: "#edad55",
  border: "#4b47a0",
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

async function write(relPath, svg, { width, height }) {
  const out = join(PUBLIC, relPath);
  await mkdir(dirname(out), { recursive: true });
  const buffer = await sharp(Buffer.from(svg))
    .resize(width, height, { fit: "cover" })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  await writeFile(out, buffer);
  console.log(`  ${relPath}  ${(buffer.length / 1024).toFixed(1)} KB`);
}

/* ---------------------------------------------------------------------------
   Sponsor logos — a wordmark on a transparent-looking dark plate.
   The site renders these greyscale in the footer, so each gets its own hue to
   prove the colour-on-hover treatment actually does something.
   --------------------------------------------------------------------------- */

const SPONSORS = [
  { file: "apex-composites", label: "APEX", sub: "COMPOSITES", hue: "#ac2a26" },
  { file: "meridian-motorsport", label: "MERIDIAN", sub: "MOTORSPORT", hue: "#1f6fb8" },
  { file: "northgate-precision", label: "NORTHGATE", sub: "PRECISION", hue: "#137a58" },
  { file: "halden-analytics", label: "HALDEN", sub: "ANALYTICS", hue: "#6b4bb5" },
  {
    file: "cartwright-fabrication",
    label: "CARTWRIGHT",
    sub: "FABRICATION",
    hue: "#b1730d",
  },
];

function sponsorSvg({ label, sub, hue }) {
  // Sized tight to the artwork. A logo file padded with transparent space
  // renders as a small mark in a large box wherever it is placed, because the
  // box is what gets scaled — the commonest way placeholder logos look broken.
  const W = 360;
  const H = 112;
  // NO background rect: real sponsor logos arrive with transparency, and this
  // site places them on both light (/sponsors, the tier table) and dark (the
  // footer bar, on white chips) grounds. Baking a background in would make one
  // of those two look broken.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <g transform="translate(6 ${H / 2})">
    <rect x="0" y="-30" width="11" height="60" rx="2" fill="${hue}"/>
    <rect x="17" y="-30" width="5" height="60" rx="2" fill="${hue}" opacity="0.5"/>
  </g>
  <text x="34" y="${H / 2 - 6}" font-family="${FONT}" font-size="34" font-weight="800"
        letter-spacing="0.5" fill="#25225E">${esc(label)}</text>
  <text x="36" y="${H / 2 + 26}" font-family="${FONT}" font-size="16" font-weight="600"
        letter-spacing="3.4" fill="${hue}">${esc(sub)}</text>
</svg>`;
}

/* ---------------------------------------------------------------------------
   Team portraits — a monogram tile, clearly not a photograph.
   --------------------------------------------------------------------------- */

const TEAM = [
  { file: "aisha-al-mansoori", name: "Aisha Al Mansoori", role: "Team Principal" },
  { file: "rohan-menon", name: "Rohan Menon", role: "Chief Engineer" },
  { file: "layla-haddad", name: "Layla Haddad", role: "Aerodynamics Lead" },
  { file: "tomas-ilves", name: "Tomas Ilves", role: "Chassis Lead" },
  { file: "amara-okonkwo", name: "Amara Okonkwo", role: "Powertrain Lead" },
  { file: "yusuf-rahman", name: "Yusuf Rahman", role: "Electronics Lead" },
  {
    file: "sofia-marchetti",
    name: "Sofia Marchetti",
    role: "Suspension & Vehicle Dynamics Lead",
  },
  { file: "daniel-osei", name: "Daniel Osei", role: "Head of Partnerships" },
  { file: "fatima-al-zaabi", name: "Fatima Al Zaabi", role: "Marketing & Media Lead" },
];

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function portraitSvg({ name, role }) {
  const W = 600;
  const H = 750;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.raised}"/>
      <stop offset="100%" stop-color="${C.bg}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="${W / 2}" cy="${H / 2 - 60}" r="130" fill="${C.surface}" stroke="${C.border}" stroke-width="2"/>
  <text x="${W / 2}" y="${H / 2 - 32}" text-anchor="middle" font-family="${FONT}"
        font-size="96" font-weight="800" fill="${C.accent}">${esc(initials(name))}</text>
  <text x="${W / 2}" y="${H / 2 + 150}" text-anchor="middle" font-family="${FONT}"
        font-size="30" font-weight="700" fill="${C.text}">${esc(name)}</text>
  <text x="${W / 2}" y="${H / 2 + 188}" text-anchor="middle" font-family="${FONT}"
        font-size="21" font-weight="500" fill="${C.muted}">${esc(role)}</text>
  <text x="${W / 2}" y="${H - 40}" text-anchor="middle" font-family="${FONT}"
        font-size="15" font-weight="600" letter-spacing="3" fill="${C.border}">PLACEHOLDER PORTRAIT</text>
</svg>`;
}

/* ---------------------------------------------------------------------------
   News covers.
   --------------------------------------------------------------------------- */

const NEWS = [
  { file: "monocoque-layup-begins", label: "Composites", title: "Monocoque layup" },
  { file: "season-2027-campaign-opens", label: "Season", title: "2027 campaign" },
];

function coverSvg({ label, title }) {
  const W = 1200;
  const H = 675;
  // Diagonal hatching, suggesting a technical drawing rather than a photo.
  const lines = Array.from(
    { length: 26 },
    (_, i) =>
      `<line x1="${i * 70 - 400}" y1="${H + 60}" x2="${i * 70 + 260}" y2="-60" stroke="${C.border}" stroke-width="1.5" opacity="0.55"/>`,
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  ${lines}
  <rect width="${W}" height="${H}" fill="${C.bg}" opacity="0.35"/>
  <rect x="0" y="0" width="8" height="${H}" fill="${C.accent}"/>
  <text x="64" y="${H / 2 - 30}" font-family="${FONT}" font-size="22" font-weight="700"
        letter-spacing="6" fill="${C.accent}">${esc(label.toUpperCase())}</text>
  <text x="64" y="${H / 2 + 42}" font-family="${FONT}" font-size="64" font-weight="800"
        fill="${C.text}">${esc(title)}</text>
  <text x="64" y="${H - 48}" font-family="${FONT}" font-size="17" font-weight="600"
        letter-spacing="3" fill="${C.muted}">PLACEHOLDER COVER IMAGE</text>
</svg>`;
}

/* ------------------------------------------------------------------------- */

async function main() {
  console.log("Sponsor logos (360×112)");
  for (const sponsor of SPONSORS) {
    await write(`sponsors/${sponsor.file}.webp`, sponsorSvg(sponsor), {
      width: 360,
      height: 112,
    });
  }

  console.log("\nTeam portraits (600×750)");
  for (const member of TEAM) {
    await write(`team/${member.file}.webp`, portraitSvg(member), {
      width: 600,
      height: 750,
    });
  }

  console.log("\nNews covers (1200×675)");
  for (const post of NEWS) {
    await write(`news/${post.file}.webp`, coverSvg(post), { width: 1200, height: 675 });
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
