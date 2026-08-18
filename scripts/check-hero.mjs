#!/usr/bin/env node
/**
 * Verifies the hero's three code paths against a running production build.
 *
 *   pnpm build && pnpm start &
 *   pnpm check:hero            # defaults to http://localhost:3000
 *   pnpm check:hero -- --url http://localhost:3210 --shots
 *
 * The hero has three behaviours the brief treats as non-negotiable, and all
 * three are invisible in a normal desktop browser session:
 *
 *   1. mobile (<768px)              — no sequence, no frame requests at all
 *   2. prefers-reduced-motion       — no sequence, no pinning
 *   3. desktop, motion allowed      — sequence runs, section pins
 *
 * Eyeballing these is unreliable, so they are asserted instead: this checks
 * the rendered DOM and the actual network traffic. A mobile visitor
 * downloading 1.2 MB of hero frames is exactly the regression this catches.
 *
 * `--shots` also writes reference screenshots to .screenshots/.
 */

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const { values: argv } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3000" },
    shots: { type: "boolean", default: false },
  },
});

const BASE = argv.url.replace(/\/$/, "");
const SHOT_DIR = join(process.cwd(), ".screenshots");

const results = [];
function check(label, passed, detail = "") {
  results.push({ label, passed, detail });
  console.log(`  ${passed ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
}

/** Loads the home page and reports what the hero actually did. */
async function probe(browser, { width, height, reducedMotion, settleMs = 2500 }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
  });

  const frameRequests = [];
  context.on("request", (request) => {
    if (request.url().includes("/hero/frames/")) frameRequests.push(request.url());
  });

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  // Scroll through the hero so a sequence, if enabled, has every reason to load.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await page.waitForTimeout(settleMs);

  const state = await page.evaluate(() => {
    const track = document.querySelector(".hero-track");
    const pane = document.querySelector(".hero-pane");
    const canvas = document.querySelector(".hero-pane canvas");
    const poster = document.querySelector(".hero-pane img");
    return {
      trackHeight: track ? track.getBoundingClientRect().height : 0,
      viewport: window.innerHeight,
      paneSticky: pane ? getComputedStyle(pane).position : null,
      hasCanvas: Boolean(canvas),
      posterVisible: Boolean(poster) && poster.getBoundingClientRect().width > 0,
      headline: document.querySelector("#hero-heading")?.textContent?.trim() ?? null,
      // Copy must be present and readable on every path, not just the fancy
      // one. Deliberately matched on shape rather than on an exact phrase —
      // the first version of this check hard-coded a sentence and started
      // failing the moment the real brand copy landed, which is a false alarm
      // rather than a finding.
      positioningVisible: (() => {
        const paragraphs = [...document.querySelectorAll(".hero-pane p")];
        return paragraphs.some(
          (p) =>
            p.textContent.trim().length > 80 && Number(getComputedStyle(p).opacity) > 0.9,
        );
      })(),
      ctas: [...document.querySelectorAll(".hero-pane a")]
        .map((a) => a.textContent.trim())
        .filter(Boolean),
    };
  });

  return { page, context, state, frameRequests };
}

async function main() {
  const browser = await chromium.launch();
  if (argv.shots) await mkdir(SHOT_DIR, { recursive: true });

  try {
    console.log(`\nMobile — 390×844, motion allowed`);
    {
      const { page, context, state, frameRequests } = await probe(browser, {
        width: 390,
        height: 844,
      });
      check("no canvas rendered", !state.hasCanvas);
      check(
        "zero hero frames requested",
        frameRequests.length === 0,
        `${frameRequests.length} requests`,
      );
      check("static poster visible", state.posterVisible);
      check(
        "no pinned scroll track",
        state.trackHeight < state.viewport * 1.35,
        `track ${Math.round(state.trackHeight)}px vs viewport ${state.viewport}px`,
      );
      check("pane not sticky", state.paneSticky !== "sticky", state.paneSticky ?? "");
      check("positioning statement fully visible", state.positioningVisible);
      check("both CTAs present", state.ctas.length >= 2, state.ctas.join(" / "));
      if (argv.shots) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        await page.screenshot({ path: join(SHOT_DIR, "home-390.png") });
        await page.screenshot({
          path: join(SHOT_DIR, "home-390-full.png"),
          fullPage: true,
        });
      }
      await context.close();
    }

    console.log(`\nDesktop — 1440×900, prefers-reduced-motion: reduce`);
    {
      const { context, state, frameRequests } = await probe(browser, {
        width: 1440,
        height: 900,
        reducedMotion: true,
      });
      check("no canvas rendered", !state.hasCanvas);
      check(
        "zero hero frames requested",
        frameRequests.length === 0,
        `${frameRequests.length} requests`,
      );
      check("static poster visible", state.posterVisible);
      check(
        "no pinning",
        state.trackHeight < state.viewport * 1.35,
        `track ${Math.round(state.trackHeight)}px vs viewport ${state.viewport}px`,
      );
      check("pane not sticky", state.paneSticky !== "sticky", state.paneSticky ?? "");
      check("positioning statement fully visible", state.positioningVisible);
      await context.close();
    }

    console.log(`\nDesktop — 1440×900, motion allowed`);
    {
      const { page, context, state, frameRequests } = await probe(browser, {
        width: 1440,
        height: 900,
        settleMs: 6000,
      });
      check("canvas rendered", state.hasCanvas);
      check(
        "frame sequence requested",
        frameRequests.length > 10,
        `${frameRequests.length} frames`,
      );
      check(
        "scroll track is pinned and tall",
        state.trackHeight > state.viewport * 2.5,
        `track ${Math.round(state.trackHeight)}px vs viewport ${state.viewport}px`,
      );
      check("pane is sticky", state.paneSticky === "sticky", state.paneSticky ?? "");
      check("headline present", Boolean(state.headline), state.headline ?? "");
      if (argv.shots) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        await page.screenshot({ path: join(SHOT_DIR, "home-1440.png") });
        await page.screenshot({
          path: join(SHOT_DIR, "home-1440-full.png"),
          fullPage: true,
        });
      }
      await context.close();
    }

    if (argv.shots) {
      // The styleguide 404s in a production build by design; screenshot it
      // from the dev server instead if you need it. Here we just record the
      // pages that do exist in prod.
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const response = await page.goto(`${BASE}/styleguide`, {
        waitUntil: "networkidle",
      });
      if (response && response.ok()) {
        await page.screenshot({
          path: join(SHOT_DIR, "styleguide-1440-full.png"),
          fullPage: true,
        });
        console.log("\n  wrote .screenshots/styleguide-1440-full.png");
      } else {
        console.log(
          `\n  /styleguide returned ${response?.status()} — expected in a production build ` +
            `(it is dev-only). Run the dev server to capture it.`,
        );
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.\n`);
  if (failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(`\n${error.message}\n`);
  process.exit(1);
});
