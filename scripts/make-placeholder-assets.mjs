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
  bg: "#0a0b0d",
  surface: "#14161a",
  raised: "#1c1f24",
  text: "#f2f4f7",
  muted: "#a8b0bc",
  accent: "#ff4d1c",
  border: "#2b3038",
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
  { file: "apex-composites", label: "APEX", sub: "COMPOSITES", hue: "#ff4d1c" },
  { file: "meridian-motorsport", label: "MERIDIAN", sub: "MOTORSPORT", hue: "#4da3ff" },
  { file: "northgate-precision", label: "NORTHGATE", sub: "PRECISION", hue: "#3dd68c" },
  { file: "halden-analytics", label: "HALDEN", sub: "ANALYTICS", hue: "#c08cff" },
  {
    file: "cartwright-fabrication",
    label: "CARTWRIGHT",
    sub: "FABRICATION",
    hue: "#ffc53d",
  },
];

function sponsorSvg({ label, sub, hue }) {
  const W = 480;
  const H = 160;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <g transform="translate(28 ${H / 2})">
    <rect x="0" y="-26" width="10" height="52" rx="2" fill="${hue}"/>
    <rect x="16" y="-26" width="4" height="52" rx="2" fill="${hue}" opacity="0.5"/>
  </g>
  <text x="42" y="${H / 2 - 4}" font-family="${FONT}" font-size="34" font-weight="800"
        letter-spacing="1.5" fill="${C.text}">${esc(label)}</text>
  <text x="44" y="${H / 2 + 26}" font-family="${FONT}" font-size="17" font-weight="600"
        letter-spacing="5" fill="${hue}">${esc(sub)}</text>
</svg>`;
}

/* ---------------------------------------------------------------------------
   Team portraits — a monogram tile, clearly not a photograph.
   --------------------------------------------------------------------------- */

const TEAM = [
  { file: "priya-raghunathan", name: "Priya Raghunathan", role: "Team Principal" },
  { file: "tomas-ilves", name: "Tomas Ilves", role: "Chief Engineer" },
  { file: "amara-okonkwo", name: "Amara Okonkwo", role: "Powertrain Lead" },
  { file: "ewan-blackwood", name: "Ewan Blackwood", role: "Aerodynamics Lead" },
  { file: "sofia-marchetti", name: "Sofia Marchetti", role: "Vehicle Dynamics Lead" },
  { file: "daniel-osei", name: "Daniel Osei", role: "Head of Partnerships" },
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
  { file: "fsuk-2026-review", label: "Competition", title: "Silverstone 2026" },
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
  console.log("Sponsor logos (480×160)");
  for (const sponsor of SPONSORS) {
    await write(`sponsors/${sponsor.file}.webp`, sponsorSvg(sponsor), {
      width: 480,
      height: 160,
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
