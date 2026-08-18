# KUFS — Khalifa University Formula Student

Public website for **KUFS, the official Formula Student team of Khalifa University**,
Abu Dhabi — competing in **Formula Student UK (FS Class)** at Silverstone, organised by
the IMechE.

> **ENGINEERED TO RACE. DRIVEN TO LEAD.**

It serves three audiences, in this order of priority:

1. **Sponsors and prospective sponsors** — professionalism, reach, proof of delivery
2. **Prospective team members** — students deciding whether to apply
3. **Other teams, press and enthusiasts** — the car and the technical detail

Most traffic arrives from a link in an Instagram bio, on a mid-range phone, on mobile
data. Mobile performance is treated as a hard requirement throughout.

---

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Command                    | What it does                                                        |
| -------------------------- | ------------------------------------------------------------------- |
| `pnpm dev`                 | Dev server                                                          |
| `pnpm build`               | Production build (also validates every file in `/content`)          |
| `pnpm start`               | Serve the production build                                          |
| `pnpm lint`                | ESLint                                                              |
| `pnpm typecheck`           | `tsc --noEmit`                                                      |
| `pnpm format`              | Prettier, write                                                     |
| `pnpm format:check`        | Prettier, check only (this is what CI runs)                         |
| `pnpm render:frames`       | Re-bake the hero image sequence and poster                          |
| `pnpm assets:placeholders` | Regenerate placeholder sponsor logos, portraits and news covers     |
| `pnpm check:bundle`        | Fail if `/` exceeds its JS budget or leaks a server-only dependency |
| `pnpm check:hero`          | Assert the hero's mobile / reduced-motion / desktop behaviour       |

`check:bundle` needs a build first. `check:hero` needs a build **and** a running
`pnpm start`.

### Deploy

Targets Vercel. Import the repo, set the framework to Next.js, and deploy — every
route is statically prerendered, so no runtime configuration is required.

Environment variables (all optional):

| Variable                       | Purpose                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Enables Plausible. Unset ⇒ no analytics script is rendered at all.             |
| `NEXT_PUBLIC_PLAUSIBLE_HOST`   | Self-hosted Plausible origin. Defaults to `https://plausible.io`.              |
| `STYLEGUIDE`                   | Set to `1` to expose `/styleguide` in a production build (it 404s by default). |

`robots.ts` reads `VERCEL_ENV`, which Vercel sets automatically: preview deploys are
`Disallow: /` so a preview URL cannot outrank the real site.

---

## Licensing

**A4 Speed font.** A4 Speed is distributed on the public font sites as _free for personal
use_. This site carries sponsor logos, so its use here may fall outside that grant.
Action for the team: check the author credit on the dafont listing and email them for
written permission for web and team use — for a student motorsport team this is very
often granted for free, and it takes one email. Until that is confirmed, the risk is
accepted knowingly. The headline face is isolated behind the `--font-display` token and
`src/lib/fonts.ts`; swapping to Barlow Condensed Bold Italic is a one-file change.

**Status right now:** the A4 Speed font file was **not supplied with this milestone**, so
the site currently ships the fallback — Barlow Condensed Bold Italic — as the live
headline face. Everything else is in place: the token, the loader, the commented
`localFont` block, and `pnpm font:subset`. See "Typography" below.

**Barlow** (body) is licensed under the SIL Open Font License and is loaded through
`next/font/google`, which downloads and self-hosts it at build time. No runtime request
to Google, no third-party origin in the critical path.

**Logos.** The files in `public/brand/` were extracted from the brand PDF at ~900px wide.
Request the original SVG/AI vector logo from the team's design lead and replace them —
drop-in same filenames.

---

## Typography

|                              | Face                                     | Loaded by          | Used for                         |
| ---------------------------- | ---------------------------------------- | ------------------ | -------------------------------- |
| Headlines                    | **A4 Speed** _(pending — see Licensing)_ | `next/font/local`  | `h1`–`h3` and stat numerals only |
| Headlines _(shipping today)_ | Barlow Condensed Bold Italic             | `next/font/google` | as above                         |
| Body                         | **Barlow** 400/500/600                   | `next/font/google` | everything else                  |

Headlines are uppercase, italic, `letter-spacing: -0.01em`, tight leading — applied in
`globals.css` on `h1`–`h3` so a heading cannot accidentally opt out. `h4` and below run
on Barlow: the display face is a heavy italic and it costs more legibility than it buys
below ~20px. Nav links, buttons, table cells and form labels are all Barlow.

### Enabling A4 Speed

```bash
# 1. drop the source file in
cp ~/Downloads/A4Speed-Bold.ttf src/assets/fonts/

# 2. convert + subset to Latin, digits and punctuation, and report the size
pnpm font:subset src/assets/fonts/A4Speed-Bold.ttf

# 3. in src/lib/fonts.ts: comment out the Barlow_Condensed block,
#    uncomment the localFont block. Nothing else changes.
```

`pnpm font:subset` uses the wasm build of harfbuzz — no Python, no fontTools, no native
toolchain. The pipeline is tested: run against a comparable display face (Impact, 135.2
KB TTF) it produced a **14.2 KB** subset WOFF2, an 89.5% reduction, comfortably inside
the 30 KB budget. A4 Speed should land in the same range; the script warns if it does not.

---

## Editing content

Nothing here needs a developer, and nothing needs a CMS. Everything lives in
`/content` and is read at build time, validated against a Zod schema in
`src/lib/schemas.ts`. **A malformed file fails `pnpm build` with a message naming the
file and the field** rather than shipping a broken sponsor strip.

```
content/
├── site.ts          team name, tagline, socials, competition date, hero config
├── sponsors.json    { name, tier, logo, url, blurb?, contribution?, since? }
├── team.json        { name, role, subteam, photo, linkedin?, year }
├── milestones.json  { title, date, status: done|active|upcoming, description }
└── news/*.mdx       frontmatter: title, date, author, excerpt, cover
```

Notes:

- Sponsor tiers: `title | gold | silver | bronze | inkind`. Title and gold render at
  size on the home page; the rest render as a compact logo row.
- At most one milestone may be `active` — it is the single "you are here" marker, and
  the schema enforces it.
- Every image declares `src`, `width`, `height` and `alt`. The dimensions are
  mandatory because every image goes through `next/image`; this is what keeps
  cumulative layout shift at zero.

---

## The hero

`<ScrollCarHero />` has two modes, selected by `hero.mode` in `content/site.ts`.

**Mode A — `sequence` (production).** Pre-rendered WebP frames painted to a `<canvas>`
as scroll progress advances through a pinned section. Frames live in
`public/hero/frames/`.

**Mode B — `model` (dev/preview).** A live three.js scene with a scroll-driven camera
orbit, for judging the shot before frames exist. It sits behind `next/dynamic` with
`ssr: false` _and_ a dynamic `import("three")` inside an effect, so three.js is never
in the production payload. `pnpm check:bundle` fails the build if it ever is.

Both modes and the frame renderer share **one** scene definition
(`src/lib/heroScene.ts`) and **one** camera path (`cameraPoseAt` in
`src/lib/placeholderCar.ts`), so the baked frames and the live preview cannot drift.

### What every visitor gets

The static poster is always rendered and is the entire hero on:

- viewports under 768px — **the sequence is never requested**
- `prefers-reduced-motion: reduce` — no pinning, no sequence
- the server render and first hydration pass
- any browser where the enhancement fails

The hero's geometry is decided in CSS media queries, not JavaScript, so the correct
layout is in place on first paint and nothing shifts when the client takes over.
Pinning uses `position: sticky`, which does not intercept the wheel — **scrolling
always continues past the hero.**

`pnpm check:hero` asserts all three paths against a real server, including that a
390px viewport issues **zero** requests to `/hero/frames/`.

### Regenerating the hero

```bash
pnpm exec playwright install chromium   # once
pnpm render:frames
```

This loads the configured car into headless Chromium, steps the camera along the
shared path, and writes `public/hero/frames/frame-0001.webp …` plus
`public/hero/poster.webp`.

```bash
pnpm render:frames --frames 120 --width 1920 --height 1080
pnpm render:frames --model /models/2027-car.glb
pnpm render:frames --help
```

**When the real CAD export arrives:** drop the GLB at `public/models/2027-car.glb`,
set `hero.modelPath` in `content/site.ts`, run `pnpm render:frames`, commit the frames.
Arbitrary GLBs are auto-normalised to a 2.9 m footprint sitting on the ground, so the
camera path stays valid.

If `hero.frameCount` no longer matches the number of files on disk, the loader will
request frames that do not exist. The script prints the count it wrote.

### The placeholder car

`src/lib/placeholderCar.ts` builds a low-poly open-wheel car procedurally from
three.js primitives — body, nose cone, sidepods, roll hoops, three-element rear wing,
four wheels — proportioned like a Formula Student car rather than an F1 car.

**No third-party model is used, and none is committed.** This is our own geometry, so
there is no licence to verify, nothing to attribute, and nothing to remove later.
Replacing it is a one-line config change (`hero.modelPath`), not a rewrite.

### Logo usage

Pick the variant **by background**, always — `src/components/brand/KufsLogo.tsx` enforces
this by taking an `on="dark" | "light"` prop rather than a filename.

| Context                               | File                                    | Component call                       |
| ------------------------------------- | --------------------------------------- | ------------------------------------ |
| Header, footer, anything on navy/dark | `kufs-logo-color--dark-bg.png`          | `<KufsLogo on="dark" />`             |
| Dark background, needs the tagline    | `kufs-logo-simple-tagline--dark-bg.png` | `<KufsLogo on="dark" withTagline />` |
| White / off-white sections            | `kufs-logo-color-tagline--light-bg.png` | `<KufsLogo on="light" />`            |

The light-background artwork has a **navy "KU"**. On a navy surface the KU disappears and
you are left with a floating red "F" — which is why the light file is not reachable
without explicitly asking for `on="light"`, and why `pnpm check:brand` fails the build if
a `light-bg` image ever renders on a dark ancestor.

Clear space: keep at least the height of the "K" free on all sides (`clearSpace` prop).
The header instance renders at 180px and is `priority`.

**Not supplied:** a mono white/red-streak variant. The brand PDF contains no such lockup
and synthesising one would be inventing a brand asset. Small dark-background uses fall
back to `on="dark"` without the tagline. Ask the design lead for the mono lockup.

---

## Design system

`src/styles/tokens.css` is the single source of truth for every brand value. It is a
Tailwind v4 `@theme` block, which emits each token as a CSS custom property _and_
registers it with the Tailwind theme — so `--color-accent` generates `bg-accent`,
`text-accent`, `border-accent`, and the whole site restyles from that one file.

No hex value, font stack, radius or spacing figure is hard-coded anywhere else.

Every colour pairing that carries text meets **WCAG 2.1 AA** (4.5:1 body, 3:1 large
text and non-text UI). Measured ratios are recorded next to each token as a comment.
**Re-measure when you swap the palette** — those comments are a contract.

`/styleguide` renders every token, type step, button variant, status pill, card,
radius and spacing value live from the CSS. It is development-only: it 404s in
production, is excluded from the sitemap, and is disallowed in `robots.txt`.

---

## Swapping in real brand assets

| What                | Files to edit                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Colours**         | `src/styles/tokens.css` — only this file. Re-measure the contrast ratios in the comments, then check `/styleguide`.                                     |
| **Fonts**           | `src/lib/fonts.ts` — that is the only file that names a typeface. `src/styles/tokens.css` holds the stacks.                                             |
| **Logo**            | `src/components/layout/Wordmark.tsx` (the inline SVG) and `src/app/icon.svg` (favicon). Keep both in sync.                                              |
| **Sponsor logos**   | Drop files in `public/sponsors/`, update `logo.src/width/height/alt` in `content/sponsors.json`. Delete the generated placeholders.                     |
| **Team photos**     | `public/team/` + `photo.*` in `content/team.json`.                                                                                                      |
| **News covers**     | `public/news/` + `cover.*` in the post's frontmatter.                                                                                                   |
| **Car renders**     | `public/models/*.glb` + `hero.modelPath` in `content/site.ts`, then `pnpm render:frames`. Frames and poster are regenerated for you.                    |
| **Team/site facts** | `content/site.ts` — name, tagline, socials, contact addresses, competition date, headline stats.                                                        |
| **OG card**         | `src/app/opengraph-image.tsx`. Note: Satori cannot read CSS variables, so the palette is repeated there as literals — update it alongside `tokens.css`. |

Placeholder imagery under `public/sponsors`, `public/team` and `public/news` is
generated by `pnpm assets:placeholders`. It is all our own output — no stock
photography, no third-party logos, nothing with a licence attached.

---

## Performance and accessibility

Measured against a **production build** (`pnpm build && pnpm start`), Lighthouse 13.4.1:

|                          | Mobile (Slow 4G, 4× CPU) | Desktop  |
| ------------------------ | ------------------------ | -------- |
| Performance              | **98**                   | **100**  |
| Accessibility            | **100**                  | **100**  |
| Best practices           | **100**                  | **100**  |
| SEO                      | **100**                  | **100**  |
| Largest Contentful Paint | **2.3 s**                | 0.5 s    |
| Cumulative Layout Shift  | **0**                    | 0        |
| Total Blocking Time      | 20 ms                    | 0 ms     |
| Page weight              | **196 KiB**              | 1.49 MiB |

The mobile/desktop weight gap is the hero sequence: 1.2 MB of frames that phones
never request.

**JavaScript on `/`: 148.8 KB gzipped**, against a 150 KB budget, enforced by
`pnpm check:bundle` in CI. Essentially all of it is the React 19 + Next 16 App Router
baseline; first-party application code is a few KB. The budget is genuinely tight —
see "Known issues" below.

Accessibility commitments, all verified: keyboard operable throughout, one visible
focus treatment sitewide at ≥3:1, AA contrast on every text pairing, correct landmark
elements, one `<h1>` per page, skip-to-content link, a focus-trapped mobile drawer that
closes on Escape and on route change, status conveyed by text as well as colour, and
`prefers-reduced-motion` respected globally and in the hero specifically.

---

## Analytics

Plausible, and only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set — no script is rendered
otherwise, so local development and previews stay out of the numbers.

The `outbound-links` script variant is used so click-throughs to sponsors' own sites
are counted without extra instrumentation; that number is the one sponsors actually
ask for. `src/lib/analytics.ts` exposes a typed `track()` for custom goals
(`Sponsor CTA`, `Join CTA`, `Sponsor Click`, `Hero CTA`) — configure them as goals in
the Plausible dashboard to get conversion reporting.

---

## Dependencies

Every dependency, with its justification.

**Runtime**

| Package                      | Why                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `next`, `react`, `react-dom` | The stack.                                                                                                    |
| `zod`                        | Validates `/content` at build time so bad content fails the build, not production. Never reaches the browser. |
| `gray-matter`                | Parses MDX frontmatter. Build time only.                                                                      |
| `server-only`                | Marks `src/lib/content.ts` (which uses `node:fs`) as unimportable from client components.                     |

**Development**

| Package                                                  | Why                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `typescript`, `@types/*`                                 | Strict-mode TypeScript.                                              |
| `tailwindcss`, `@tailwindcss/postcss`                    | Styling; `@theme` is what wires `tokens.css` into the utility layer. |
| `eslint`, `eslint-config-next`, `eslint-config-prettier` | Linting, with stylistic rules delegated to Prettier.                 |
| `prettier`                                               | Formatting. Checked in CI.                                           |
| `three`, `@types/three`                                  | Hero Mode B and the frame renderer. Never in the production bundle.  |
| `playwright`                                             | Drives headless Chromium for `render:frames` and `check:hero`.       |
| `sharp`                                                  | Encodes WebP for the hero frames and the placeholder assets.         |

Deliberately **not** added: `clsx`/`tailwind-merge` (a six-line `cn()` covers our
usage), `framer-motion` (the scroll hook is ~60 lines and avoids ~40 KB), any dialog
library (one modal surface), and `next-mdx-remote` (MDX _bodies_ are not rendered until
the `/news/[slug]` route exists — see below).

---

## Known issues and deferred work

Read this before the next milestone.

1. **`/news/[slug]` does not exist.** Home page news cards therefore link to `/news`
   rather than to the article, to avoid shipping three 404s. Building that route means
   adding `next-mdx-remote` (or `@next/mdx`) to render the MDX body — the loader
   already returns it as `body`.
2. **Mobile hero art direction.** The poster is a single 16:9 asset. In portrait,
   `object-cover` would crop away most of the car, so on mobile it is laid out as a
   full-width band pinned to the bottom of the pane instead. The better answer is a
   dedicated portrait render served via `<picture>` with `<source media>` — but
   `next/image` has no art-direction support, and the brief requires all images to go
   through it. Flagged rather than silently substituted.
3. **The JS budget has almost no headroom.** 148.8 KB of a 150 KB limit, and roughly
   all of it is framework. Any new client component that pulls in a library will breach
   it. `check:bundle` will catch that, but the fix will have to be architectural.
4. **Placeholder identity.** `name`, `longName` and `university` in `content/site.ts`
   are guesses at what "KUFS" expands to. Replace before this is shown to a sponsor.
5. **The competition date is a placeholder.** `2027-07-14T08:00:00+01:00`. The 2027
   dates are not published; confirm against the IMechE key dates page.
6. **Hero frame count is coupled to config.** `hero.frameCount` must match the files in
   `public/hero/frames/`. Nothing validates this at build time yet.
