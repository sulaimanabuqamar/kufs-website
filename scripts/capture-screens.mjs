#!/usr/bin/env node
/**
 * Reference screenshots at the three viewports the site is designed against.
 *
 *   pnpm build && pnpm start &
 *   pnpm screens -- --url http://localhost:3000
 *
 * Writes to .screenshots/ (gitignored). Not a visual regression test — just a
 * repeatable way to look at every page at 390 / 768 / 1440 without resizing a
 * browser by hand, which is how responsive bugs get missed.
 */

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const { values: argv } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3000" },
    widths: { type: "string", default: "390,768,1440" },
    paths: {
      type: "string",
      default:
        "/,/the-car,/team,/progress,/sponsors,/become-a-sponsor,/news,/newsletter,/join,/press-kit,/contact,/styleguide",
    },
    full: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const BASE = argv.url.replace(/\/$/, "");
const OUT = join(process.cwd(), ".screenshots");
const WIDTHS = argv.widths.split(",").map(Number);
const PATHS = argv.paths.split(",");

const slug = (p) => (p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "-"));

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 844 : 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const path of PATHS) {
      const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      if (!response?.ok()) {
        console.log(`  skip ${path} @ ${width} — ${response?.status()}`);
        continue;
      }
      // Scroll the whole page first. Below-the-fold images are lazy-loaded by
      // design, so a full-page screenshot taken without scrolling captures
      // them as empty boxes — which reads as a broken site rather than as a
      // broken screenshot.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      // Let the hero sequence settle and any reveal transitions finish.
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(OUT, `${slug(path)}-${width}.png`) });
      if (argv.full) {
        await page.screenshot({
          path: join(OUT, `${slug(path)}-${width}-full.png`),
          fullPage: true,
        });
      }
      console.log(`  ${slug(path)}-${width}.png`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
