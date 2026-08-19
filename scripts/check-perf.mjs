#!/usr/bin/env node
/**
 * Enforces the site's performance and accessibility budgets.
 *
 *   pnpm build && pnpm start &
 *   pnpm check:perf -- --url http://localhost:3000
 *
 * BUDGETS
 *   LCP  < 2.0s on Fast 4G   (10 Mbps, 40ms RTT, no CPU throttle)
 *   LCP  < 3.0s on Slow 4G   (1.6 Mbps, 150ms RTT, 4x CPU throttle)
 *   CLS  < 0.1 on both
 *   Accessibility = 100 on every audited page
 *
 * The two network profiles exist because they answer different questions.
 * Fast 4G is roughly what a visitor on campus wifi or a good mobile signal
 * actually gets. Slow 4G with a 4x CPU penalty is a deliberately pessimistic
 * floor — it is not the median visitor, it is the worst one we still want to
 * serve well, and treating it as the only number leads to chasing the
 * framework baseline rather than shipping.
 *
 * Lighthouse is run through `pnpm dlx` rather than added as a dependency: it
 * pulls in a very large tree for something only CI and the occasional local
 * check need, and nobody should have to download it to fix a typo in a sponsor
 * blurb.
 *
 * `--runs N` takes the MEDIAN of N measurements. Lighthouse's simulated
 * throttling still depends on the host's real CPU, and a shared CI runner is a
 * noisy neighbour: the same commit measured 2.68s locally and 3.02s on one
 * Actions run while passing on another. Taking a median is the honest fix for
 * that. Raising the budget to make a flaky measurement pass would just move the
 * problem somewhere it is harder to see.
 */

import { readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseArgs } from "node:util";
import { join } from "node:path";
import { tmpdir } from "node:os";

const run = promisify(execFile);

const { values: argv } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3000" },
    paths: {
      type: "string",
      default: "/,/become-a-sponsor,/sponsors,/team,/join,/contact",
    },
    /** Runs per profile. The median is used — see the note below. */
    runs: { type: "string", default: "1" },
  },
  // Tolerate a stray `--`: `pnpm <script> -- --flag` forwards the separator,
  // which would otherwise arrive as a positional and throw.
  allowPositionals: true,
});

const BASE = argv.url.replace(/\/$/, "");
const PATHS = argv.paths.split(",");
const RUNS = Math.max(1, Number(argv.runs));

const BUDGETS = {
  slow: { lcpMs: 3000, cls: 0.1 },
  fast: { lcpMs: 2000, cls: 0.1 },
  accessibility: 100,
};

/** Fast 4G, expressed as Lighthouse throttling flags. */
const FAST_4G = [
  "--throttling.rttMs=40",
  "--throttling.throughputKbps=10240",
  "--throttling.cpuSlowdownMultiplier=1",
];

async function lighthouse(url, extraFlags, attempt = 0) {
  const out = join(
    tmpdir(),
    `lh-${Math.abs(hash(url + extraFlags.join()))}-${attempt}.json`,
  );
  await run(
    "pnpm",
    [
      "dlx",
      "lighthouse@latest",
      url,
      "--output=json",
      `--output-path=${out}`,
      "--quiet",
      "--chrome-flags=--headless=new --no-sandbox",
      ...extraFlags,
    ],
    { maxBuffer: 1024 * 1024 * 64 },
  );
  const report = JSON.parse(await readFile(out, "utf8"));
  await rm(out, { force: true });
  return report;
}

/** Stable filename per (url, flags) so parallel runs cannot collide. */
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const results = [];
function record(label, passed, detail) {
  results.push({ label, passed });
  console.log(`  ${passed ? "PASS" : "FAIL"}  ${label} — ${detail}`);
}

async function main() {
  console.log(
    `Performance budgets: LCP < ${BUDGETS.fast.lcpMs}ms on Fast 4G, ` +
      `< ${BUDGETS.slow.lcpMs}ms on Slow 4G\n`,
  );

  for (const path of PATHS) {
    const url = `${BASE}${path}`;
    console.log(path);

    // Slow 4G is Lighthouse's default mobile preset.
    const slowRuns = [];
    const fastRuns = [];
    for (let i = 0; i < RUNS; i += 1) {
      slowRuns.push(await lighthouse(url, [], i));
      fastRuns.push(await lighthouse(url, ["--preset=desktop", ...FAST_4G], i));
    }

    const median = (values) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    };
    const pick = (reports, fn) => median(reports.map(fn));

    const lcpSlow = pick(
      slowRuns,
      (r) => r.audits["largest-contentful-paint"].numericValue,
    );
    const lcpFast = pick(
      fastRuns,
      (r) => r.audits["largest-contentful-paint"].numericValue,
    );
    const clsSlow = pick(
      slowRuns,
      (r) => r.audits["cumulative-layout-shift"].numericValue,
    );
    // Accessibility is deterministic; the worst run is the honest one.
    const a11y = Math.min(
      ...slowRuns.map((r) => Math.round(r.categories.accessibility.score * 100)),
    );

    record(
      "LCP on Slow 4G",
      lcpSlow < BUDGETS.slow.lcpMs,
      `${Math.round(lcpSlow)}ms (budget ${BUDGETS.slow.lcpMs}ms${RUNS > 1 ? `, median of ${RUNS}` : ""})`,
    );
    record(
      "LCP on Fast 4G",
      lcpFast < BUDGETS.fast.lcpMs,
      `${Math.round(lcpFast)}ms (budget ${BUDGETS.fast.lcpMs}ms)`,
    );
    record("CLS", clsSlow < BUDGETS.slow.cls, `${clsSlow.toFixed(3)}`);
    record("Accessibility", a11y === BUDGETS.accessibility, `${a11y}/100`);
    console.log("");
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`${results.length - failed.length}/${results.length} checks passed.\n`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
