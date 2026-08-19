#!/usr/bin/env node
/**
 * Bakes the hero image sequence.
 *
 *   pnpm render:frames
 *   pnpm render:frames -- --frames 120 --width 1920 --height 1080
 *   pnpm render:frames -- --model /models/2027-car.glb
 *
 * WHAT IT DOES
 * Loads the configured car (a GLB, or the procedural placeholder) into a real
 * three.js scene inside headless Chromium, steps the camera along the hero's
 * camera path, screenshots the canvas at each step, and writes optimised WebP
 * frames to public/hero/frames/. It also writes public/hero/poster.webp — the
 * static image mobile and reduced-motion visitors see.
 *
 * WHY IT MATTERS
 * When the real CAD export arrives, regenerating the entire hero is one
 * command. Drop the GLB in public/models/, point content/site.ts at it, run
 * this, commit the frames. No manual turntable, no video editor, no drift
 * between what the live preview shows and what production plays back.
 *
 * The scene, lighting and camera path are NOT defined here. They come from
 * src/lib/heroScene.ts and src/lib/placeholderCar.ts — the exact same modules
 * the in-browser preview (Mode B) uses. This script serves those TypeScript
 * sources to the page with their types stripped by Node's built-in stripper,
 * so there is one definition of the shot and no build step in between.
 *
 * REQUIREMENTS
 * Playwright's Chromium. Install once with:
 *   pnpm exec playwright install chromium
 * If it is missing, this script falls back to your locally installed Google
 * Chrome before giving up.
 */

import { createServer } from "node:http";
import { readFile, mkdir, rename, rm, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripTypeScriptTypes, registerHooks } from "node:module";
import { parseArgs } from "node:util";

import sharp from "sharp";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "hero", "frames");
/** Frames are written here first and only swapped in once they pass the blank
 *  check, so a failed run cannot destroy a good sequence that already works. */
const STAGING_DIR = join(ROOT, "public", "hero", "frames.staging");
const POSTER_PATH = join(ROOT, "public", "hero", "poster.webp");

/** Triangle ceiling for the hero subject. See src/lib/placeholderCar.ts. */
const TRIANGLE_BUDGET = 2000;

/* -------------------------------------------------------------------------
   Arguments
   ------------------------------------------------------------------------- */

const { values: argv } = parseArgs({
  options: {
    frames: { type: "string" },
    width: { type: "string", default: "1600" },
    height: { type: "string", default: "900" },
    quality: { type: "string", default: "70" },
    "poster-quality": { type: "string", default: "82" },
    /** Which point along the camera path becomes the poster, 0..1. */
    "poster-at": { type: "string", default: "0.16" },
    model: { type: "string" },
    help: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

if (argv.help) {
  console.log(
    [
      "Usage: pnpm render:frames [-- options]",
      "",
      "  --frames <n>          frame count (default: hero.frameCount in content/site.ts)",
      "  --width <px>          render width (default 1600)",
      "  --height <px>         render height (default 900)",
      "  --quality <1-100>     WebP quality for frames (default 70)",
      "  --poster-quality <n>  WebP quality for the poster (default 82)",
      "  --poster-at <0-1>     point on the camera path used for the poster (default 0.16)",
      "  --model <path>        public-relative GLB, e.g. /models/2027-car.glb",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

/* -------------------------------------------------------------------------
   Read hero config out of content/site.ts
   ------------------------------------------------------------------------- */

/**
 * content/site.ts imports through the "@/" alias, which Node knows nothing
 * about. A resolve hook maps it the same way tsconfig.json does, so the real
 * config file is the single source of truth for the frame count rather than a
 * number duplicated into this script.
 */
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

    const base = specifier.startsWith("@/content/")
      ? join(ROOT, "content", specifier.slice("@/content/".length))
      : join(ROOT, "src", specifier.slice(2));

    // TypeScript path aliases are written without an extension; Node needs one.
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      join(base, "index.ts"),
    ];
    const resolved = candidates.find((candidate) => existsSync(candidate)) ?? base;

    return { url: pathToFileURL(resolved).href, shortCircuit: true };
  },
});

// This script intentionally runs TypeScript through Node's stripper and loads
// extension-less ESM; both are expected here and the warnings are just noise.
const MUTED_WARNINGS = new Set(["ExperimentalWarning", "MODULE_TYPELESS_PACKAGE_JSON"]);
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (!MUTED_WARNINGS.has(warning.name) && !MUTED_WARNINGS.has(warning.code)) {
    console.warn(`${warning.name}: ${warning.message}`);
  }
});

async function loadHeroConfig() {
  try {
    const loaded = await import(pathToFileURL(join(ROOT, "content", "site.ts")).href);
    return loaded.default.hero;
  } catch (cause) {
    console.warn(
      `! Could not read content/site.ts (${cause.message}).\n` +
        `  Falling back to defaults. Pass --frames to be explicit.`,
    );
    return { frameCount: 90, modelPath: null };
  }
}

/* -------------------------------------------------------------------------
   Static server: three.js, the shared scene modules, and the render page
   ------------------------------------------------------------------------- */

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".hdr": "application/octet-stream",
};

/** Serve a TypeScript source as plain JS, with "@/" imports made relative. */
async function serveStrippedTs(absPath) {
  const source = await readFile(absPath, "utf8");
  const js = stripTypeScriptTypes(source, { mode: "strip" });
  return js.replace(
    /(["'])@\/lib\/([A-Za-z0-9_-]+)\1/g,
    (_match, quote, name) => `${quote}./${name}.js${quote}`,
  );
}

function renderPageHtml({ width, height, modelPath }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>hero frame renderer</title>
<style>
  /* Must match --color-bg in src/styles/tokens.css; it is only ever seen if
     the canvas fails to paint, but a black flash on a navy site is obvious. */
  html, body { margin: 0; padding: 0; background: #16143c; overflow: hidden; }
  canvas { display: block; }
</style>
<script type="importmap">
{"imports": {
  "three": "/vendor/three.module.js",
  "three/addons/": "/vendor/addons/",
  "three/examples/jsm/": "/vendor/addons/"
}}
</script>
</head>
<body>
<canvas id="stage" width="${width}" height="${height}" style="width:${width}px;height:${height}px"></canvas>
<script type="module">
  import * as THREE from "three";
  import { createHeroScene } from "/lib/heroScene.js";

  const MODEL_PATH = ${JSON.stringify(modelPath)};

  try {
    let model = null;
    if (MODEL_PATH) {
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const gltf = await new GLTFLoader().loadAsync("/asset" + MODEL_PATH);
      model = gltf.scene;
    }

    const canvas = document.getElementById("stage");
    const scene = createHeroScene({
      THREE,
      canvas,
      width: ${width},
      height: ${height},
      dpr: 1,
      model,
    });

    window.__setProgress = (t) => scene.setProgress(t);

    // Triangle count of the subject, so the render script can enforce the
    // model's budget. Counted from index/position buffers rather than trusted.
    window.__triangles = (() => {
      let n = 0;
      scene.subject.traverse((o) => {
        const g = o.geometry;
        if (!g) return;
        n += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      });
      return Math.round(n);
    })();

    window.__heroReady = true;
  } catch (error) {
    window.__heroError = String(error && error.stack || error);
  }
</script>
</body>
</html>`;
}

async function startServer({ width, height, modelPath }) {
  const html = renderPageHtml({ width, height, modelPath });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const path = decodeURIComponent(url.pathname);

    const send = (body, type, status = 200) => {
      res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
      res.end(body);
    };

    try {
      if (path === "/" || path === "/index.html") {
        return send(html, MIME[".html"]);
      }

      if (path === "/vendor/three.module.js" || path === "/vendor/three.core.js") {
        const file = join(ROOT, "node_modules", "three", "build", path.split("/").pop());
        return send(await readFile(file), MIME[".js"]);
      }

      if (path.startsWith("/vendor/addons/")) {
        const rel = normalize(path.slice("/vendor/addons/".length)).replace(
          /^(\.\.[/\\])+/,
          "",
        );
        const file = join(ROOT, "node_modules", "three", "examples", "jsm", rel);
        return send(await readFile(file), MIME[extname(file)] ?? MIME[".js"]);
      }

      if (path.startsWith("/lib/")) {
        const name = path.slice("/lib/".length).replace(/\.js$/, ".ts");
        const file = join(ROOT, "src", "lib", name);
        return send(await serveStrippedTs(file), MIME[".js"]);
      }

      // Anything under /asset maps into /public, for GLBs and their textures.
      if (path.startsWith("/asset/")) {
        const rel = normalize(path.slice("/asset/".length)).replace(/^(\.\.[/\\])+/, "");
        const file = join(ROOT, "public", rel);
        return send(
          await readFile(file),
          MIME[extname(file)] ?? "application/octet-stream",
        );
      }

      send("not found", "text/plain", 404);
    } catch (cause) {
      send(`error: ${cause.message}`, "text/plain", 500);
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, origin: `http://127.0.0.1:${port}` };
}

/* -------------------------------------------------------------------------
   Browser
   ------------------------------------------------------------------------- */

async function launchBrowser() {
  const args = [
    // Software GL is deterministic across machines and CI. A GPU-accelerated
    // render would produce subtly different frames on every developer's
    // laptop, which shows up as flicker when frames are regenerated piecemeal.
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-lcd-text",
    "--force-device-scale-factor=1",
  ];

  try {
    return await chromium.launch({ args });
  } catch (cause) {
    console.warn(
      `! Playwright's Chromium is unavailable (${cause.message.split("\n")[0]}).\n` +
        `  Trying your installed Google Chrome instead.\n` +
        `  To install the bundled browser: pnpm exec playwright install chromium`,
    );
    return chromium.launch({ channel: "chrome", args });
  }
}

/* -------------------------------------------------------------------------
   Capture timing
   ------------------------------------------------------------------------- */

/**
 * Two animation frames after a draw. One is not enough: the first rAF callback
 * runs before the compositor has necessarily picked the new content up, so a
 * screenshot taken then can still show the previous frame.
 */
function settle(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

/**
 * Blocks until the renderer is genuinely drawing, or throws.
 *
 * The naive check — "capture the same pose twice and compare" — is not enough,
 * because two blank captures are also identical. It passed, and the run still
 * produced twelve empty frames.
 *
 * So the test is two-sided:
 *   - two DIFFERENT camera poses must produce DIFFERENT pixels
 *     (proves something is actually being drawn), and
 *   - the same pose captured twice must be identical
 *     (proves the compositor has settled and is not mid-update).
 *
 * Only both together rule out a blank canvas.
 */
async function warmUpRenderer(page, { attempts = 40 } = {}) {
  // SwiftShader needs a moment to come up before any of this is meaningful.
  await page.waitForTimeout(500);

  const captureAt = async (progress) => {
    await page.evaluate((t) => window.__setProgress(t), progress);
    await settle(page);
    return capture(page);
  };

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const poseA = await captureAt(0.5);
    const poseB = await captureAt(0.05);
    const poseAAgain = await captureAt(0.5);

    const drawing = !poseA.equals(poseB);
    const stable = poseA.equals(poseAAgain);

    if (drawing && stable) return;

    await page.waitForTimeout(150);
  }

  throw new Error(
    "The WebGL canvas never produced a stable, non-blank frame.\n" +
      "This usually means software rasterisation failed to start. Try:\n" +
      "  pnpm exec playwright install chromium\n" +
      "or run with your system Chrome by uninstalling Playwright's browser.",
  );
}

/**
 * Capture the canvas.
 *
 * A viewport screenshot rather than an element screenshot: the page is sized to
 * exactly the canvas, so the two are the same pixels, and the viewport path
 * skips the bounding-box and scroll-into-view work that element capture does.
 */
function capture(page) {
  return page.screenshot({ type: "png" });
}

/**
 * Guards against the failure this script has already shipped once: frames that
 * are technically written but visually empty. A blank 1600×900 WebP compresses
 * to a couple of KB; a real render is an order of magnitude bigger. Anything
 * far below the median is treated as a failed capture.
 */
function assertNoBlankFrames(sizes) {
  const sorted = [...sizes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const floor = median * 0.3;

  const blank = sizes
    .map((size, index) => ({ size, frame: index + 1 }))
    .filter((entry) => entry.size < floor);

  if (blank.length > 0) {
    const list = blank
      .slice(0, 8)
      .map(
        (b) =>
          `frame-${String(b.frame).padStart(4, "0")} (${(b.size / 1024).toFixed(1)} KB)`,
      )
      .join(", ");
    throw new Error(
      `${blank.length} frame(s) look blank against a ${(median / 1024).toFixed(1)} KB median:\n` +
        `  ${list}${blank.length > 8 ? ", …" : ""}\n` +
        `The renderer was not warm when they were captured. Re-run; if it persists, ` +
        `raise the attempt count in warmUpRenderer().`,
    );
  }
}

/* -------------------------------------------------------------------------
   Main
   ------------------------------------------------------------------------- */

async function main() {
  const heroConfig = await loadHeroConfig();

  const frameCount = Number(argv.frames ?? heroConfig.frameCount);
  const width = Number(argv.width);
  const height = Number(argv.height);
  const quality = Number(argv.quality);
  const posterQuality = Number(argv["poster-quality"]);
  const posterAt = Number(argv["poster-at"]);
  const modelPath = argv.model ?? heroConfig.modelPath ?? null;

  if (!Number.isInteger(frameCount) || frameCount < 2) {
    throw new Error(`--frames must be an integer >= 2 (got ${frameCount})`);
  }

  if (modelPath && !existsSync(join(ROOT, "public", modelPath.replace(/^\//, "")))) {
    throw new Error(
      `Model not found: public${modelPath}\n` +
        `Either drop the GLB there, or set hero.modelPath to null in content/site.ts ` +
        `to use the procedural placeholder car.`,
    );
  }

  console.log(
    [
      "Rendering hero frames",
      `  source     ${modelPath ? `public${modelPath}` : "procedural placeholder car (src/lib/placeholderCar.ts)"}`,
      `  frames     ${frameCount}`,
      `  size       ${width}×${height}`,
      `  quality    ${quality} (poster ${posterQuality})`,
      `  output     public/hero/frames/`,
      "",
    ].join("\n"),
  );

  await rm(STAGING_DIR, { recursive: true, force: true });
  await mkdir(STAGING_DIR, { recursive: true });

  const { server, origin } = await startServer({ width, height, modelPath });
  const browser = await launchBrowser();

  let totalBytes = 0;
  const frameSizes = [];

  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });

    page.on("console", (message) => {
      if (message.type() === "error") console.error(`  [page] ${message.text()}`);
    });

    await page.goto(origin, { waitUntil: "load" });

    await page.waitForFunction(
      () => window.__heroReady === true || window.__heroError,
      undefined,
      { timeout: 60_000 },
    );

    const pageError = await page.evaluate(() => window.__heroError ?? null);
    if (pageError) throw new Error(`Scene failed to build:\n${pageError}`);

    // The hero model is lazy-loaded, but it still has to stay cheap: it runs
    // live in Mode B on whatever laptop a team member opens it on.
    const triangles = await page.evaluate(() => window.__triangles ?? 0);
    if (triangles > TRIANGLE_BUDGET) {
      throw new Error(
        `Model is ${triangles} triangles, over the ${TRIANGLE_BUDGET} budget.\n` +
          `Reduce radial segments on the wheels or drop suspension detail in ` +
          `src/lib/placeholderCar.ts.`,
      );
    }
    console.log(`  model      ${triangles} triangles (budget ${TRIANGLE_BUDGET})\n`);

    // SwiftShader takes a second or two to come up, and until it has, the
    // canvas composites as an empty rectangle. Screenshots taken during that
    // window produce blank frames that still "succeed" — the first version of
    // this script shipped twelve of them. Wait for two consecutive captures of
    // the SAME pose to come back byte-identical: that only happens once the
    // rasteriser is warm and drawing steadily.
    await warmUpRenderer(page);

    const started = Date.now();

    for (let index = 0; index < frameCount; index += 1) {
      const progress = frameCount === 1 ? 0 : index / (frameCount - 1);

      await page.evaluate((t) => window.__setProgress(t), progress);
      await settle(page);

      const png = await capture(page);
      const webp = await sharp(png).webp({ quality, effort: 5 }).toBuffer();

      const name = `frame-${String(index + 1).padStart(4, "0")}.webp`;
      await writeFile(join(STAGING_DIR, name), webp);
      totalBytes += webp.length;
      frameSizes.push(webp.length);

      if ((index + 1) % 10 === 0 || index === frameCount - 1) {
        const pct = Math.round(((index + 1) / frameCount) * 100);
        process.stdout.write(`  ${String(pct).padStart(3)}%  ${name}\n`);
      }
    }

    // Fail loudly rather than committing a hero that fades in from nothing.
    // Nothing has touched the live frames yet, so a failure here leaves the
    // existing sequence intact.
    assertNoBlankFrames(frameSizes);

    // Swap staging into place. Clearing first matters: a shorter sequence must
    // not leave the tail of a longer one behind for the loader to find.
    await rm(OUT_DIR, { recursive: true, force: true });
    await rename(STAGING_DIR, OUT_DIR);

    // Poster, from the same scene and the same camera path.
    await page.evaluate((t) => window.__setProgress(t), posterAt);
    await settle(page);
    const posterPng = await capture(page);
    const posterWebp = await sharp(posterPng)
      .webp({ quality: posterQuality, effort: 6 })
      .toBuffer();
    await mkdir(dirname(POSTER_PATH), { recursive: true });
    await writeFile(POSTER_PATH, posterWebp);

    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    const written = (await readdir(OUT_DIR)).length;

    console.log(
      [
        "",
        `Done in ${seconds}s.`,
        `  ${written} frames, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total ` +
          `(${(totalBytes / written / 1024).toFixed(1)} KB average)`,
        `  poster ${(posterWebp.length / 1024).toFixed(1)} KB at ${width}×${height}`,
        "",
        `Set hero.frameCount to ${written} in content/site.ts if you changed --frames.`,
      ].join("\n"),
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    await rm(STAGING_DIR, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`\n${error.message}\n`);
  process.exitCode = 1;
});
