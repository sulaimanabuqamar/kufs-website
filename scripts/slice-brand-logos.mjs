#!/usr/bin/env node
/**
 * Slices the team's logo exports into the individual lockups the site uses.
 *
 *   pnpm brand:slice ~/Downloads
 *
 * PROVENANCE
 * The design lead supplies three PNG exports, each around 8,300 px wide, and
 * each containing MORE THAN ONE lockup stacked vertically:
 *
 *   Logo for dark bg.png    colour-on-dark, without and with the tagline
 *   White logo.png          mono white, with and without the tagline
 *   Logo transparent bg.png the navy-KU lockup for light grounds
 *
 * Copying those files straight into public/brand/ would ship two logos in one
 * image, so each is split on its transparent gutters, trimmed to content
 * bounds and downsampled. Which band is which is detected from aspect ratio —
 * the tagline makes a lockup measurably taller — rather than assumed from
 * order, because the two source files stack them in opposite orders.
 *
 * These supersede an earlier set extracted from the brand PDF at ~900px.
 * A true vector original (SVG/AI) is still outstanding; see README.
 */

import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SOURCE_DIR = process.argv[2] ?? join(process.env.HOME ?? "", "Downloads");
const OUT_DIR = join(process.cwd(), "public", "brand");

/** Delivery width. The header renders at 180px, so this is ample at 2x. */
const WIDTH = 1400;
/** Rows of fully transparent pixels that count as a gutter between lockups. */
const MIN_GAP = 120;
/** Alpha at or below this is treated as empty. */
const ALPHA_FLOOR = 12;

/**
 * Horizontal bands of content, as [startRow, endRow] pairs.
 * Scans the alpha channel only — the artwork's own colours are irrelevant.
 */
function findBands(alpha, width, height) {
  const occupied = new Array(height).fill(false);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[y * width + x] > ALPHA_FLOOR) {
        occupied[y] = true;
        break;
      }
    }
  }

  const bands = [];
  let start = null;
  let gap = 0;
  for (let y = 0; y < height; y += 1) {
    if (occupied[y]) {
      if (start === null) start = y;
      gap = 0;
    } else if (start !== null) {
      gap += 1;
      if (gap >= MIN_GAP) {
        bands.push([start, y - gap]);
        start = null;
        gap = 0;
      }
    }
  }
  if (start !== null) bands.push([start, height - 1]);
  return bands;
}

async function slice(file) {
  // Dimensions come from the raw buffer, not from metadata(): metadata
  // reports the pre-rotation size, and any EXIF orientation would put the
  // extract rectangle outside the actual pixel grid.
  const { data, info } = await sharp(join(SOURCE_DIR, file))
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const bands = findBands(data, width, height);
  const out = [];

  for (const [top, bottom] of bands) {
    // Two passes on purpose: sharp will not apply `extract` and `trim` in the
    // same pipeline (the trim is computed against the pre-extract image and
    // the resulting rectangle is rejected as out of bounds).
    const band = await sharp(join(SOURCE_DIR, file))
      .ensureAlpha()
      .extract({ left: 0, top, width, height: bottom - top + 1 })
      .png()
      .toBuffer();

    // Trim the transparent margin so the lockup fills its box; without this
    // every placement renders a small mark floating in a large frame.
    const trimmed = await sharp(band)
      .trim({ threshold: 1 })
      .png()
      .toBuffer({ resolveWithObject: true });

    out.push({
      buffer: trimmed.data,
      width: trimmed.info.width,
      height: trimmed.info.height,
      aspect: trimmed.info.width / trimmed.info.height,
    });
  }
  return out;
}

/** The taller lockup of a pair is the one carrying the tagline. */
function splitByTagline(bands) {
  const sorted = [...bands].sort((a, b) => a.aspect - b.aspect);
  return { withTagline: sorted[0], plain: sorted[sorted.length - 1] };
}

async function write(band, name) {
  const buffer = await sharp(band.buffer)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(OUT_DIR, name), buffer);
  const meta = await sharp(buffer).metadata();
  console.log(
    `  ${name.padEnd(46)} ${meta.width}x${meta.height}  ${(buffer.length / 1024).toFixed(0)} KB`,
  );
  return { width: meta.width, height: meta.height };
}

async function main() {
  const available = await readdir(SOURCE_DIR);
  const need = ["Logo for dark bg.png", "White logo.png", "Logo transparent bg.png"];
  const missing = need.filter((f) => !available.includes(f));
  if (missing.length) {
    console.error(
      `Missing source export(s) in ${SOURCE_DIR}:\n` +
        missing.map((m) => `  ${m}`).join("\n") +
        `\n\nAsk the design lead for the current logo exports.`,
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Slicing logo exports from ${SOURCE_DIR}\n`);

  const dark = splitByTagline(await slice("Logo for dark bg.png"));
  const mono = splitByTagline(await slice("White logo.png"));
  const [light] = await slice("Logo transparent bg.png");

  const sizes = {};
  sizes["dark-plain"] = await write(dark.plain, "kufs-logo-color--dark-bg.png");
  sizes["dark-tagline"] = await write(
    dark.withTagline,
    "kufs-logo-simple-tagline--dark-bg.png",
  );
  sizes["light-tagline"] = await write(light, "kufs-logo-color-tagline--light-bg.png");
  sizes["mono-plain"] = await write(mono.plain, "kufs-logo-mono-white--dark-bg.png");
  sizes["mono-tagline"] = await write(
    mono.withTagline,
    "kufs-logo-mono-white-tagline--dark-bg.png",
  );

  console.log(
    "\nIf any dimension changed, update VARIANTS in " +
      "src/components/brand/KufsLogo.tsx — next/image needs the real intrinsic\n" +
      "size to reserve the box, and a stale one reintroduces layout shift:\n",
  );
  for (const [key, size] of Object.entries(sizes)) {
    console.log(`  ${key.padEnd(16)} width: ${size.width}, height: ${size.height}`);
  }
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
