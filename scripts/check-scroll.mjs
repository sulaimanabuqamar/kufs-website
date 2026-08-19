#!/usr/bin/env node
/**
 * Regression cover for the "page opens partway down" bug.
 *
 *   pnpm build && pnpm start &
 *   pnpm check:scroll -- --url http://localhost:3000
 *
 * THE BUG THIS EXISTS TO CATCH
 * `html { scroll-behavior: smooth }` was set globally. Next.js ≤ 15 forced
 * `scroll-behavior: auto` around its own scroll reset during route
 * transitions; Next 16 stopped doing that by default. The App Router calls
 * `scrollIntoView()` several times as the new tree commits, and with a global
 * smooth setting those became competing animations that settled wherever the
 * chain ended — 837px into /team, 592px into /sponsors — instead of at the top.
 *
 * It is invisible in a build, in a type check and in Lighthouse. It only shows
 * if someone clicks a link and looks. So: every ordered pair of pages is
 * navigated from a scrolled state and asserted to arrive at the top.
 *
 * Hash anchors are asserted NOT to be at the top, because scoping smooth
 * scrolling to anchors was the fix — a regression that broke anchors would
 * otherwise pass this file silently.
 */

import { parseArgs } from "node:util";
import { chromium } from "playwright";

const { values: argv } = parseArgs({
  options: { url: { type: "string", default: "http://localhost:3000" } },
});

const BASE = argv.url.replace(/\/$/, "");

/** Every page reachable from the header, keyed by its nav label. */
const NAV = [
  { label: "The Car", path: "/the-car" },
  { label: "Team", path: "/team" },
  { label: "Progress", path: "/progress" },
  { label: "Sponsors", path: "/sponsors" },
  { label: "Partner With Us", path: "/become-a-sponsor" },
  { label: "News", path: "/news" },
  { label: "Join the Team", path: "/join" },
];

const SOURCES = ["/", ...NAV.map((n) => n.path)];

let checked = 0;
const failures = [];

function assert(label, passed, detail) {
  checked += 1;
  if (!passed) failures.push(`${label} — ${detail}`);
}

const scrollY = (page) => page.evaluate(() => Math.round(window.scrollY));

async function main() {
  const browser = await chromium.launch();
  // 1280 keeps the desktop nav visible (it appears at lg).
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    /* ---- every ordered pair, navigated from a scrolled source ------------ */
    console.log("Client-side navigation from a scrolled page\n");

    for (const from of SOURCES) {
      await page.goto(BASE + from, { waitUntil: "domcontentloaded" });
      // Scroll well down the page — the bug only appeared for some offsets.
      await page.evaluate(() =>
        window.scrollTo(0, Math.round(document.body.scrollHeight / 2)),
      );
      await page.waitForTimeout(120);

      const arrivals = [];
      for (const target of NAV) {
        if (target.path === from) continue;

        await page.goto(BASE + from, { waitUntil: "domcontentloaded" });
        await page.evaluate(() =>
          window.scrollTo(0, Math.round(document.body.scrollHeight / 2)),
        );
        await page.waitForTimeout(100);

        await page.locator(`header nav a:has-text("${target.label}")`).first().click();
        await page.waitForLoadState("domcontentloaded");
        // Long enough for any stray scroll animation to have finished.
        await page.waitForTimeout(700);

        const y = await scrollY(page);
        assert(`${from} -> ${target.path}`, y === 0, `arrived at scrollY=${y}`);
        arrivals.push(y);
      }

      const worst = Math.max(...arrivals, 0);
      console.log(
        `  ${worst === 0 ? "PASS" : "FAIL"}  from ${from.padEnd(20)} ${arrivals.length} targets, worst scrollY=${worst}`,
      );
    }

    /* ---- also from the very top, which is where the bug actually bit ----- */
    console.log("\nClient-side navigation from an UNSCROLLED page");
    for (const target of NAV) {
      await page.goto(BASE, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(150);
      await page.locator(`header nav a:has-text("${target.label}")`).first().click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(700);
      const y = await scrollY(page);
      assert(`/ (top) -> ${target.path}`, y === 0, `arrived at scrollY=${y}`);
      console.log(
        `  ${y === 0 ? "PASS" : "FAIL"}  / -> ${target.path.padEnd(20)} scrollY=${y}`,
      );
    }

    /* ---- hard loads ------------------------------------------------------ */
    console.log("\nHard load");
    for (const path of [...SOURCES, "/contact", "/press-kit"]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const y = await scrollY(page);
      assert(`hard load ${path}`, y === 0, `scrollY=${y}`);
      console.log(`  ${y === 0 ? "PASS" : "FAIL"}  ${path.padEnd(22)} scrollY=${y}`);
    }

    /* ---- back / forward -------------------------------------------------- */
    console.log("\nBack / forward");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(200);
    await page.locator('header nav a:has-text("Team")').first().click();
    await page.waitForTimeout(700);
    const afterNav = await scrollY(page);
    assert("forward nav lands at top", afterNav === 0, `scrollY=${afterNav}`);

    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const restored = await scrollY(page);
    // Browsers restore the previous offset; the point is that it is not zero
    // and not somewhere arbitrary further down the page.
    assert("back restores position", restored > 500, `scrollY=${restored}`);

    await page.goForward({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const forward = await scrollY(page);
    assert("forward returns to top", forward === 0, `scrollY=${forward}`);
    console.log(`  nav=${afterNav}  back=${restored} (restored)  forward=${forward}`);

    /* ---- anchors must still scroll --------------------------------------- */
    console.log("\nIn-page anchors (must NOT be at the top)");
    for (const [path, link, id] of [
      ["/become-a-sponsor", "See the tiers", "tiers"],
      ["/become-a-sponsor", "Talk to us", "enquire"],
      ["/join", "See open roles", "roles"],
    ]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.locator(`a:has-text("${link}")`).first().click();
      await page.waitForTimeout(1200);
      const y = await scrollY(page);
      const top = await page.evaluate(
        (i) => Math.round(document.getElementById(i).getBoundingClientRect().top),
        id,
      );
      // 80px is scroll-padding-top, clearing the 4rem sticky header.
      const ok = y > 0 && Math.abs(top - 80) <= 2;
      assert(`anchor ${path}#${id}`, ok, `scrollY=${y}, target top=${top}`);
      console.log(
        `  ${ok ? "PASS" : "FAIL"}  ${link.padEnd(16)} scrollY=${y}  #${id} top=${top}px`,
      );
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${checked - failures.length}/${checked} checks passed.`);
  if (failures.length) {
    console.error("\nFailures:");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
