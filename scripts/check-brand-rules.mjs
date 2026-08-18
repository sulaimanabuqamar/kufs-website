#!/usr/bin/env node
/**
 * Enforces the KUFS brand's one hard accessibility rule, at runtime.
 *
 *   pnpm build && pnpm start &
 *   pnpm check:brand -- --url http://localhost:3000
 *
 * Racing Red (#AC2A26) measures 2.12:1 on KUFS Navy. It fails WCAG at every
 * level including the 3:1 non-text minimum, so it is permitted only as
 * decoration on dark (the speed stripe and the logo) and as a real accent on
 * light grounds, where it measures 6.27:1.
 *
 * A grep cannot prove this: a component can be red-on-light in one place and
 * red-on-dark in another depending on which section renders it. So this walks
 * the rendered DOM of every page, resolves each element's EFFECTIVE background
 * by climbing ancestors until it finds an opaque one, and fails if Racing Red
 * is carrying text, a border or an icon over anything dark.
 *
 * `aria-hidden="true"` elements are exempt — that is the speed stripe, which is
 * decoration by definition and carries no information.
 */

import { parseArgs } from "node:util";
import { chromium } from "playwright";

const { values: argv } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3000" },
    paths: { type: "string", default: "/,/become-a-sponsor,/sponsors,/team,/join" },
  },
});

const BASE = argv.url.replace(/\/$/, "");
const PATHS = argv.paths.split(",");

const results = [];
function record(page, label, passed, detail = "") {
  results.push({ page, label, passed, detail });
  console.log(`  ${passed ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

const AUDIT = () => {
  const RED = { r: 172, g: 42, b: 38 };
  const NEAR = 24; // tolerance, so hover/alpha variants still register

  const parse = (value) => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(",").map((s) => parseFloat(s));
    return { r, g, b, a };
  };

  const isRed = (c) =>
    c &&
    c.a > 0.1 &&
    Math.abs(c.r - RED.r) < NEAR &&
    Math.abs(c.g - RED.g) < NEAR &&
    Math.abs(c.b - RED.b) < NEAR;

  const relLum = ({ r, g, b }) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  /** Climb from `start` until an opaque background is found. */
  const effectiveBg = (start) => {
    let node = start;
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a >= 0.9) return c;
      node = node.parentElement;
    }
    return (
      parse(getComputedStyle(document.body).backgroundColor) ?? {
        r: 22,
        g: 20,
        b: 60,
        a: 1,
      }
    );
  };

  const isDark = (c) => relLum(c) < 0.18;
  const violations = [];

  for (const el of document.querySelectorAll("*")) {
    if (el.closest('[aria-hidden="true"]')) continue; // decorative: the speed stripe
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;

    // Two different grounds matter, and conflating them produces false
    // positives: text sits on the element's OWN background, while the
    // element's own background and its border sit on the PARENT's.
    const ownBg = effectiveBg(el);
    const parentBg = effectiveBg(el.parentElement);

    const offenders = [];

    // Red text is only a problem when the thing behind the text is dark.
    if (isRed(parse(style.color)) && el.textContent.trim() && isDark(ownBg)) {
      offenders.push("text colour");
    }
    // A red fill is only a problem when it is sitting on a dark ground.
    if (isRed(parse(style.backgroundColor)) && isDark(parentBg)) {
      offenders.push("background");
    }
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      const w = parseFloat(style[`border${side}Width`]);
      if (w > 0 && isRed(parse(style[`border${side}Color`])) && isDark(parentBg)) {
        offenders.push(`border-${side.toLowerCase()}`);
        break;
      }
    }
    if (
      isRed(parse(style.outlineColor)) &&
      parseFloat(style.outlineWidth) > 0 &&
      isDark(ownBg)
    ) {
      offenders.push("outline");
    }
    if (isRed(parse(style.fill)) && isDark(ownBg)) offenders.push("svg fill");

    if (offenders.length) {
      violations.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") ?? "").slice(0, 90),
        text: el.textContent.trim().slice(0, 50),
        offenders,
      });
    }
  }
  return violations;
};

/** Structural invariants that are cheap to get wrong and expensive to notice. */
const STRUCTURE = () => {
  const h1s = [...document.querySelectorAll("h1")];
  const imgsNoAlt = [...document.querySelectorAll("img")].filter(
    (i) => !i.hasAttribute("alt"),
  );
  const outboundNoRel = [...document.querySelectorAll('a[target="_blank"]')].filter(
    (a) => !(a.getAttribute("rel") ?? "").includes("noopener"),
  );
  // The light-background logo must never appear on a dark surface.
  const relLum = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    const [r, g, b] = m[1].split(",").map(parseFloat);
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const badLogo = [...document.querySelectorAll("img")].filter((img) => {
    if (!/light-bg/.test(img.currentSrc || img.src)) return false;
    let node = img.parentElement;
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      const m = c.match(/rgba?\(([^)]+)\)/);
      const a = m ? parseFloat(m[1].split(",")[3] ?? "1") : 0;
      if (a >= 0.9) return relLum(c) < 0.18;
      node = node.parentElement;
    }
    return false;
  });

  return {
    h1Count: h1s.length,
    h1Text: h1s[0]?.textContent?.trim() ?? null,
    imgsNoAlt: imgsNoAlt.length,
    outboundNoRel: outboundNoRel.map((a) => a.getAttribute("href")).slice(0, 5),
    lightLogoOnDark: badLogo.length,
  };
};

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    for (const path of PATHS) {
      console.log(`\n${path}`);
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

      const violations = await page.evaluate(AUDIT);
      record(
        path,
        "no Racing Red text/border/background on a dark surface",
        violations.length === 0,
        violations.length
          ? violations
              .slice(0, 4)
              .map((v) => `<${v.tag}> ${v.offenders.join("+")} "${v.text}"`)
              .join(" | ")
          : "0 violations",
      );

      const s = await page.evaluate(STRUCTURE);
      record(path, "exactly one <h1>", s.h1Count === 1, `${s.h1Count} — "${s.h1Text}"`);
      record(path, "every image has alt", s.imgsNoAlt === 0, `${s.imgsNoAlt} missing`);
      record(
        path,
        "external links carry rel=noopener",
        s.outboundNoRel.length === 0,
        s.outboundNoRel.join(", ") || "all ok",
      );
      record(
        path,
        "light-background logo never on a dark surface",
        s.lightLogoOnDark === 0,
        `${s.lightLogoOnDark} misplaced`,
      );
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.\n`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
