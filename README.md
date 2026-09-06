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

| Command                    | What it does                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                 | Dev server                                                               |
| `pnpm build`               | Production build (also validates every file in `/content`)               |
| `pnpm start`               | Serve the production build                                               |
| `pnpm lint`                | ESLint                                                                   |
| `pnpm typecheck`           | `tsc --noEmit`                                                           |
| `pnpm format`              | Prettier, write                                                          |
| `pnpm format:check`        | Prettier, check only (this is what CI runs)                              |
| `pnpm render:frames`       | Re-bake the hero image sequence and poster                               |
| `pnpm assets:placeholders` | Regenerate placeholder sponsor logos, portraits and news covers          |
| `pnpm check:bundle`        | Fail if `/` exceeds its JS budget or leaks a server-only dependency      |
| `pnpm check:copy`          | Fail if a user-visible string is hardcoded instead of in `/content/copy` |
| `pnpm check:hero`          | Assert the hero's mobile / reduced-motion / desktop behaviour            |
| `pnpm check:contrast`      | Re-measure every contrast ratio claimed in `tokens.css`                  |
| `pnpm check:brand`         | Runtime audit: Racing Red placement, logo backgrounds, alt text          |
| `pnpm check:perf`          | Enforce the LCP / CLS / accessibility budgets                            |
| `pnpm font:subset`         | Convert and subset the headline face to WOFF2                            |
| `pnpm screens`             | Screenshot every page at 390 / 768 / 1440                                |

`check:bundle` needs a build first. `check:hero` needs a build **and** a running
`pnpm start`.

### Deploy — first-time runbook

Follow these in order. Someone who has never deployed anything can do this.

1. **Create the GitHub repository.**

   ```bash
   gh repo create <org>/kufs-website --source=. --private --push
   ```

   Push all history; do not squash.

2. **Protect `main`.** GitHub → Settings → Branches → Add rule for `main`. Enable
   **linear history**, and block **force pushes** and **deletions**. Apply the rules to
   administrators too.

   **Do not require a pull request, and do not add required status checks.** Both of
   them reject the commit the admin panel makes when someone presses Save — a required
   status check gates the push itself, so it deadlocks anything that commits directly to
   the deployment branch. CI still runs on every push and reports afterwards; what
   actually stops a broken content edit reaching the live site is Vercel's own build,
   which validates every content file against the Zod schemas and simply does not
   promote a deploy that fails. The reasoning is written up in
   [CONTRIBUTING.md → What still guards `main`](CONTRIBUTING.md#what-still-guards-main).

3. **Connect Vercel.** <https://vercel.com/new> → import the repository. The Next.js
   preset is detected automatically; accept every default. Do not override the build
   command.

4. **Add environment variables** in Vercel → Settings → Environment Variables, per the
   table above. `NEXT_PUBLIC_SITE_URL` goes in the **Production** scope only.

   Leave `NEXT_PUBLIC_FORMSPREE_ENDPOINT` unset until you have a Formspree form. Both
   enquiry forms fall back to opening the visitor's mail client, which works — it just
   converts worse than a real form.

5. **Deploy.** Vercel builds `main` and gives you a `*.vercel.app` URL. Every pull
   request from then on gets its own preview URL automatically.

6. **Verify the deploy:**
   - `https://<your-domain>/robots.txt` allows crawling and lists the sitemap
   - `https://<preview-url>/robots.txt` says `Disallow: /`
   - `https://<your-domain>/sitemap.xml` lists your real domain, not `localhost`
   - the sponsorship form on `/become-a-sponsor` sends a test enquiry that arrives

7. **Custom domain — not yet.** A `ku.ac.ae` subdomain needs a DNS request to
   university IT. When you are ready, ask them to add:

   | Type    | Name   | Value                  |
   | ------- | ------ | ---------------------- |
   | `CNAME` | `kufs` | `cname.vercel-dns.com` |

   Then add `kufs.ku.ac.ae` in Vercel → Settings → Domains, and update
   `NEXT_PUBLIC_SITE_URL` to match. Until then <https://kufs-website.vercel.app> is the
   live site and everything works. That origin is also the fallback in
   `content/site.json` → `url`, so a build with no environment variable set still emits
   canonical tags that resolve.

#### Hosting plan — Hobby for now, review before launch

**Decision: stay on Vercel's free Hobby plan.** Nothing to do today. It costs nothing,
it comfortably serves the traffic a first-year team's site gets, and paid plans get
evaluated nearer the public launch.

**This is a launch-blocker to review, not a today problem.** Vercel's Hobby plan is
intended for **non-commercial** projects, and a site carrying **paid sponsor logos** —
which is the entire purpose of `/sponsors` and `/become-a-sponsor` — sits outside that.
The moment a sponsor pays for placement on this site, the deployment needs to be on a
plan that permits commercial use. Settle it **before** the first sponsor logo goes live,
not after: it is a billing decision with a signed sponsor waiting on it, and it is much
easier to make while nobody is depending on the answer.

Environment variables. **All are optional** — the site builds and runs with none of
them set. See `.env.example`.

| Variable                         | Where to set it               | Purpose                                                                                                                                                                                                                     |
| -------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Vercel → Production only      | Canonical origin, no trailing slash. Drives canonical tags, the sitemap, `robots.txt` and every Open Graph URL. Leave it unset on Preview so previews fall back to their own `VERCEL_URL` and never claim to be production. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | Vercel → Production           | Enables Plausible. Unset ⇒ no analytics script is rendered at all, so local development and previews stay out of the numbers.                                                                                               |
| `NEXT_PUBLIC_PLAUSIBLE_HOST`     | Vercel → all                  | Self-hosted Plausible origin. Defaults to `https://plausible.io`.                                                                                                                                                           |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Vercel → Production + Preview | Endpoint for the sponsorship and contact forms. Unset ⇒ both forms fall back to opening the visitor's mail client, which works but converts worse. **Set this before launch.**                                              |
| `STYLEGUIDE`                     | Vercel → Preview, if wanted   | Set to `1` to expose `/styleguide` on a preview deploy for design review. It 404s in production.                                                                                                                            |

`VERCEL_ENV` is set by Vercel automatically. `robots.ts` reads it and returns
`Disallow: /` for anything that is not a production deployment, so a preview URL can
never outrank the real site.

---

## Licensing

**A4 Speed font.** A4 Speed is licensed for personal use only in its free form. This
site carries sponsor logos, so KUFS requires the USD 12 commercial licence from the
author (Coki Fernández, A4 grafica). Purchase at
[paypal.me/a4grafica](https://www.paypal.me/a4grafica), then request the certificate from
coki@outlook.com or Instagram [@a4speedfont](https://instagram.com/a4speedfont), and store
the certificate in the team drive under **Media & Marketing**. Do not deploy this font to
production until that certificate exists. Until then, revert `--font-display` to Barlow
Condensed Bold Italic — a one-line change in `src/lib/fonts.ts`.

**Status right now: A4 Speed is NOT deployed, and cannot be by accident.** The reversion
above is automatic rather than manual, because a manual step is a step someone forgets.
The licence gate is the font file itself:

- `public/fonts/a4-speed.woff2` and the source TTF are **gitignored**. This repository is
  public, so committing a personal-use-only binary would be redistribution in its own
  right — separate from whether the site serves it. Not having the file prevents both.
- The `@font-face` rule in `src/styles/tokens.css` names `"A4 Speed"` first in the
  `--font-display` stack and Barlow Condensed Bold Italic immediately after. With no file
  deployed, the `src` 404s and the browser falls straight through to Barlow. No build
  failure, no visual break.
- `pnpm check:font-licence` fails if any font binary is tracked in git without
  `src/assets/fonts/LICENCE-A4SPEED.txt` beside it.

**To enable it once the certificate is in hand:** commit the certificate to
`src/assets/fonts/LICENCE-A4SPEED.txt`, remove the font lines from `.gitignore`, run
`pnpm font:subset src/assets/fonts/A4SPEED-Bold.ttf`, and commit
`public/fonts/a4-speed.woff2` (3.4 KB). Nothing else changes.

**Barlow** (body) is licensed under the SIL Open Font License and is loaded through
`next/font/google`, which downloads and self-hosts it at build time. No runtime request
to Google, no third-party origin in the critical path.

**Logos.** The files in `public/brand/` were extracted from the brand PDF at ~900px wide.
Request the original SVG/AI vector logo from the team's design lead and replace them —
drop-in same filenames.

---

## Typography

|                              | Face                                                 | Loaded by          | Used for                         |
| ---------------------------- | ---------------------------------------------------- | ------------------ | -------------------------------- |
| Headlines                    | **A4 Speed** _(gated — see [Licensing](#licensing))_ | `@font-face`       | `h1`–`h3` and stat numerals only |
| Headlines _(shipping today)_ | Barlow Condensed Bold Italic                         | `next/font/google` | as above                         |
| Body                         | **Barlow** 400/500/600                               | `next/font/google` | everything else                  |

Headlines are uppercase, `letter-spacing: -0.01em`, tight leading — applied in
`globals.css` on `h1`–`h3` so a heading cannot accidentally opt out. `h4` and below run
on Barlow: the display face is heavy and it costs more legibility than it buys below
~20px. Nav links, buttons, table cells and form labels are all Barlow.

**No `font-style: italic` and no `font-weight: bold` anywhere on the display face.** Both
faces in the stack are already slanted — A4 Speed is _drawn_ on a slant while reporting
`italicAngle: 0`, and Barlow Condensed is selected as a real italic — so asking CSS for
italic makes the browser synthesise an oblique on top and produces a visible double slant.
Same for weight: A4 Speed reports `usWeightClass: 500` while calling itself Bold, and only
one weight exists, so `--text-display--font-weight` and `--text-h1--font-weight` are 700
rather than 800.

### Glyph coverage — `pnpm check:glyphs`

A4 Speed maps **95 characters, exactly U+0020–U+007E**. No en dash, em dash, curly
quotes, curly apostrophe, middle dot or degree sign. Any of those in a heading falls
through to a different typeface mid-word, which reads as a rendering bug.

`pnpm check:glyphs` walks the rendered DOM of every route, collects every text node whose
resolved `font-family` names the display face, and fails on any unmapped character —
naming the character, the route and the element. It runs in CI and it runs whether or not
the licensed binary ships, so the strings are safe on the day the licence lands rather
than fixed afterwards.

Coverage comes from `src/assets/fonts/A4SPEED-Bold.ttf` when present, and otherwise from
`scripts/data/a4-speed-coverage.json` — the same cmap extracted to a range list, which is
metadata rather than the font, so CI works without the binary. Regenerate it with
`node scripts/check-glyphs.mjs --regenerate`.

### `pnpm font:subset`

Uses the wasm build of harfbuzz — no Python, no fontTools, no native toolchain. It
**refuses to subset a face under 256 glyphs** and converts it whole instead: A4 Speed has
98 glyphs in 7,968 bytes, so stripping any of them would trade a broken character set for
a few hundred bytes. Converted whole it is **3.4 KB WOFF2** (56.5% smaller than the TTF),
against a 30 KB budget. The subsetting path is retained for future faces; run against
Impact (135.2 KB TTF) it produced a 14.2 KB subset, an 89.5% reduction.

---

## Editing content

Everything lives in `/content`, is read at build time, and is validated against a Zod
schema in `src/lib/schemas.ts`. **A malformed file fails `pnpm build` with a message
naming the file and the field** rather than shipping a broken sponsor strip.

There are two ways to edit it and they are the same thing: the files directly, or the
[admin panel](#the-admin-panel) at `/admin`, which is a front end for the same files
and commits to this repository when you press Save. No database, either way.

```
content/
├── site.json        team name, tagline, socials, competition date, hero config
├── site.ts          loader — reads site.json and validates it. No values here.
├── sponsors.json    { sponsors: [ { name, tier, logo, url, blurb?, ... } ] }
├── team.json        { team: [ { name, year, major, roles[], photo?, linkedin? } ] }
├── tiers.json       { tiers: [ { tier, name, amount, summary, slots, benefits } ] }
├── milestones.json  { milestones: [ { title, date, status, description, ... } ] }
├── roles.json       { roles: [ { title, subteam, description, lookingFor[] } ] }
├── cars/<year>.json the season's car: spec table, subsystems, gallery
├── affiliations.json { affiliations: [ { name, permissionConfirmed, logo, url, ... } ] }
├── news/*.mdx       frontmatter: title, date, author, excerpt, cover
└── newsletter/*.mdx one issue per month, named <year>-<month>.mdx
```

### Contact configuration

`content/site.json` carries three addresses — `contactEmail`, `sponsorshipEmail` and
`sponsorship.enquiryEmail` — and all three are currently the same personal Gmail
account.

> **This is an interim personal address. Replace it with a team address on a
> KUFS-controlled domain before public launch.**
>
> It replaced `kufs@ku.ac.ae` and `partnerships.kufs@ku.ac.ae`, which were guesses at a
> KU address format and were never confirmed to reach anyone — an unmonitored inbox on
> a sponsorship page is worse than no address at all. A personal address is better than
> a wrong one, and worse than a team one: **it stops working for the team the moment
> that person graduates**, and until then it puts one member's inbox on every page of a
> public site. It is on the [handover checklist](#content-the-team-must-supply-before-launch).

The address is **never written into the HTML in plain text.** Every place it appears —
the footer, `/contact`, `/join`, `/become-a-sponsor` and both enquiry forms — renders it
through `<ObfuscatedEmail>`, which emits the `mailto:` href and the visible text as HTML
numeric character references. The link works with JavaScript disabled, screen readers
announce the ordinary address, and a scraper running an email regex over the page source
matches nothing. The full reasoning, and the honest limit of what it protects against,
is at the top of `src/lib/obfuscateEmail.ts`.

### Third-party logos

`content/affiliations.json` holds the organisations KUFS is affiliated with — Khalifa
University, Formula Student and the IMechE. **These are other people's trademarks, and
the rules are not the same as for our own brand assets or for a sponsor who has asked us
to display their logo.**

An entry renders only when **both** of these are true:

1. `permissionConfirmed: true` — the organisation has confirmed we may use their mark.
2. A `logo` file is actually present.

**Today no entry meets both, so the logo strip does not render at all** — there is no
empty box and no placeholder. What does render is a plain sentence in the footer,
"Competing in Formula Student UK 2027, organised by the Institution of Mechanical
Engineers (IMechE)", which names the affiliation without using anyone's mark and so
needs nobody's permission.

| Organisation           | Permission       | Logo file  | What is needed                                                                                                                                                              |
| ---------------------- | ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Khalifa University** | ✅ Granted       | ❌ Missing | The official file from KU's brand office. Ask specifically for the lockup issued to **student organisations** — usually not the plain university mark. Do not download one. |
| **Formula Student**    | ❌ Not confirmed | ❌ Missing | Written confirmation that a competing team may display the mark, and in what form. Their competitor branding guidance governs it.                                           |
| **IMechE**             | ❌ Not confirmed | ❌ Missing | As above. Teams may generally state that they compete; using the event logo is more constrained.                                                                            |

> **Do not commit a logo the organisation has not supplied**, and do not lift one from a
> search result or off a web page. A wrong-version mark used without permission is a
> trademark problem, not a design problem.

Notes:

- **The list files are wrapped in an object** — `{ "sponsors": [ ... ] }`, not a bare
  `[ ... ]`. TinaCMS writes JSON documents as objects and cannot produce a top-level
  array; rather than reshape the Zod schemas around that, `readList()` in
  `src/lib/content.ts` unwraps them in the one place that reads them, and the schemas
  still validate a plain array.
- **Nullable images are absent rather than `null`.** Tina refuses to start if it is
  asked to seed a `null` where an object belongs, so `photo` and `image` keys are left
  out until a picture exists. The schemas use `.nullish().default(null)`, so every
  reader still receives `null` and nothing downstream changed.

- Sponsor tiers: `tier1 | tier2 | tier3 | inkind`, matching the team's sponsorship
  pack (AED 100,000 / 60,000 / 25,000 / value-based). Tier 1 and Tier 2 render at size;
  the rest render as a compact row. **`sponsors.json` is currently empty** — KUFS has no
  confirmed partners yet, and every surface handles that with a "be the first" state
  rather than inventing logos.
- At most one milestone may be `active` — it is the single "you are here" marker, and
  the schema enforces it.
- Every image declares `src`, `width`, `height` and `alt`. The dimensions are
  mandatory because every image goes through `next/image`; this is what keeps
  cumulative layout shift at zero.

---

## The hero

`<ScrollCarHero />` has two modes, selected by `hero.mode` in `content/site.json`.

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

It is proportioned to real Formula Student numbers — 3.0 m long, 1.55 m wheelbase,
18-inch tyres on 10-inch rims — and painted in the team livery: KUFS Navy bodywork, the
speed stripe raking down the sidepod in red → copper → orange, Performance Orange wing
endplates. Under 2,000 triangles, verified on every render.

**No third-party model is used, and none is committed.** This is our own geometry, so
there is no licence to verify, nothing to attribute, and nothing to remove later.

**Replacing it with the real car is one command.** Drop the CAD export at
`public/models/2027-car.glb`, set `hero.modelPath` to that path in `content/site.ts`,
and run `pnpm render:frames`. Every frame and the mobile poster regenerate; arbitrary
GLBs are auto-normalised to the camera path, so the export's own scale and origin do
not matter.

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

Budgets are enforced in CI by `pnpm check:perf`: **LCP under 2.0 s on Fast 4G and
under 3.0 s on Slow 4G**, CLS under 0.1, accessibility at 100 on every audited page.

Fast 4G is roughly what a real visitor on campus wifi or a decent mobile signal gets.
Slow 4G with a 4× CPU penalty is a deliberately pessimistic floor — not the median
visitor, but the worst one we still want to serve well.

**JavaScript: under 170 KB gzipped on every route**, enforced by `pnpm check:bundle`,
which checks all thirteen prerendered routes rather than just the home page. Nearly all
of it is the React 19 + Next 16 App Router baseline; first-party application code is a
few KB. `/` currently measures **149.7 KB**.

**That 170 is a ceiling we chose, not a measurement.** It has no external authority — it
is the number past which this site should not grow without someone deciding that
deliberately. It started at 150 and earned its keep twice: it caught Zod leaking into the
client bundle through an import chain, and it kept TinaCMS's editor out of the public
bundle entirely. It was raised to 170 in Brief #7 with the headroom left unspent rather
than consumed.

When a route crosses it, the first question is not "what should the budget be" — it is
which component crossed a client boundary that should not have.

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

## The admin panel

`/admin` is a TinaCMS panel for everything under `/content`, including image upload.
Git-based: every save is a commit to this repository, so content stays as files, the
Zod schemas still validate it, and there is no database anywhere in the system.
[CONTRIBUTING.md](CONTRIBUTING.md#the-admin-panel) documents it for editors; this is
the architecture.

**Every visible word is editable, not just the data.** Headings, paragraphs, button
labels, form labels and validation messages, empty states, FAQ answers, glossary
definitions, page metadata and alt text all live in `content/copy/*.json` — one file per
page, plus `common.json` for the header, footer, nav labels and forms. 447 fields,
every one of them annotated with plain-English help text in `tina/overlays.ts`.

Copy is server-rendered, so this cost nothing: `/` went from 149.9 KB to **149.7 KB**
gzipped, because moving the hero's headline into content took two strings _out_ of the
client bundle.

**Length limits are enforced in the panel, not just at build time.** Every heading,
button and label carries a `.max()` in its Zod schema, sized to what the design holds at
390px. `tina/zod-to-tina.ts` compiles those into field-level validation, so an editor
who pastes a paragraph into a button gets a red line while they are typing rather than a
failed deploy several minutes later. `parseOrThrow` is still the backstop for anything
edited by hand.

**What is deliberately NOT editable**, and enforced rather than merely avoided: design
tokens (the palette is contrast-verified — a CMS that can set a heading to Racing Red on
navy ships 2.12:1); routes and URLs (nav _labels_ are editable, `href` is an enum of the
routes that exist); heading levels and semantic structure; and anything that would let an
edit break the layout, which is what the length limits are for.

**`pnpm check:copy`** walks the TypeScript AST of every file under `src/app` and
`src/components` and fails on a user-visible string literal that is not in an allowlist.
Without it the next feature quietly reintroduces hardcoded copy and the panel stops being
complete. It has a `--self-test` that plants a hardcoded heading and asserts the check
catches it; CI runs the self-test first, because a green run from a check nobody has seen
fail is not evidence of anything.

**Zod is the single source of truth, structurally.** The Tina fields are not written
anywhere — `tina/zod-to-tina.ts` compiles them from `src/lib/schemas.ts` through Zod
4's `z.toJSONSchema()`, so there is no second schema to keep in sync and no way for
one to drift from the other. The compiler **throws rather than guesses**: a Zod
construct it has not been taught fails the build with the field path named, instead of
silently producing a field an editor can no longer edit.

The only hand-written part is `tina/overlays.ts` — labels and help text, keyed by
dotted field path. It is additive: it cannot add, remove or rename a field.
`pnpm check:tina` fails if an overlay key stops resolving, and it diffs the generated
field tree against a committed snapshot, so a schema change shows up in review as a
change to _what editors will see_.

Tina cannot express cross-field rules — "each tier appears once", "at most one active
milestone", "this must be a real URL". Those stay where they were: `parseOrThrow`
during `pnpm build`. A bad edit through the panel therefore fails CI and never reaches
production, and the live site keeps serving the last good version. Verified: an edit
written through Tina's API with `url: "definitely-not-a-url"` and `since: 1742` failed
the build with `• 0.url: Invalid URL` and `• 0.since: Too small`.

**It degrades to nothing.** `tinacms build` writes the admin SPA to `public/admin/`,
which is gitignored, and `scripts/build-admin.mjs` only runs it when
`NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` are both set. With no credentials the
directory does not exist, the `/admin` rewrite points at nothing, and Next returns 404
— the same file-presence gate used for the licensed display font, and for the same
reason: a flag is something you have to remember. A committee that lets the Tina
account lapse gets a site that builds, deploys and serves exactly as before, with all
of its content still editable in git.

**No public route can load the editor.** The admin is a separate single-page app, not
a Next route, so there is no import path from the app to Tina at all. First-party JS
on `/` is 149.9 KB gzipped, unchanged to the decimal from before Tina was added.

`/admin` is disallowed in `robots.ts`, absent from `sitemap.ts`, and served with
`X-Robots-Tag: noindex, nofollow` — the header rather than a meta tag because the page
is a static file Tina generates.

`tina/tina-lock.json` is generated and committed, as Tina requires for cloud indexing.
Do not hand-edit it; `tinacms build` rewrites it.

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

| Package                                                  | Why                                                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `typescript`, `@types/*`                                 | Strict-mode TypeScript.                                                                                                                          |
| `tailwindcss`, `@tailwindcss/postcss`                    | Styling; `@theme` is what wires `tokens.css` into the utility layer.                                                                             |
| `eslint`, `eslint-config-next`, `eslint-config-prettier` | Linting, with stylistic rules delegated to Prettier.                                                                                             |
| `prettier`                                               | Formatting. Checked in CI.                                                                                                                       |
| `three`, `@types/three`                                  | Hero Mode B and the frame renderer. Never in the production bundle.                                                                              |
| `playwright`                                             | Drives headless Chromium for `render:frames` and `check:hero`.                                                                                   |
| `sharp`                                                  | Encodes WebP for the hero frames and the placeholder assets.                                                                                     |
| `tinacms`, `@tinacms/cli`                                | The `/admin` content panel. Builds a standalone SPA into `public/admin/`; no public route can import it.                                         |
| `jiti`                                                   | Lets `check:tina` import the TypeScript Zod schemas from a plain `.mjs` script. Already present transitively; declared so it is not an accident. |

Deliberately **not** added: `clsx`/`tailwind-merge` (a six-line `cn()` covers our
usage), `framer-motion` (the scroll hook is ~60 lines and avoids ~40 KB), any dialog
library (one modal surface), and `next-mdx-remote` (MDX _bodies_ are not rendered until
the `/news/[slug]` route exists — see below).

---

## Known issues and deferred work

Read this before the next milestone.

1. **There is no news and no newsletter yet.** `content/news/` and
   `content/newsletter/` are both empty, and both sections render an honest empty state
   rather than a seeded placeholder. The home page therefore shows no news section at
   all, which is correct while nothing is published. When posts and issues do exist, the
   `draft: true` flag keeps one out of the sitemap, out of its RSS feed, off the home
   page and marked `noindex` — one flag, both sections, no second mechanism.
2. **A4 Speed is not the live headline face.** The font file is on the design lead's
   machine and wired up, but it is deliberately not deployed: the free licence covers
   personal use only, and this site carries sponsor logos. Barlow Condensed Bold Italic —
   the declared fallback — is running. Buying the USD 12 commercial licence unblocks it;
   see [Licensing](#licensing).
3. **The hero car is a stand-in.** It is proportioned and liveried correctly, but it is
   code, not the real car. See [The placeholder car](#the-placeholder-car).
4. **No mono light-background logo.** The brand assets include two mono lockups, both
   for dark grounds. There is no light-ground mono artwork and inverting one ourselves
   would be inventing a lockup. Ask the design lead if one is needed.
5. **No sponsors, and no affiliation logos.** `sponsors.json` is deliberately empty.
   `content/affiliations.json` has all three entries — Khalifa University, Formula
   Student, IMechE — and **none of them render**, because rendering requires both
   confirmed permission and a supplied logo file. See
   [Third-party logos](#third-party-logos). The roster, tiers, milestones and car spec
   are real.
6. **The JS budget has headroom again.** Around 150 KB on the heaviest routes against a
   170 KB ceiling, nearly all framework. A new client-side library would still eat most
   of the gap; `check:bundle` will catch it, but the fix will be architectural.
7. **Part of `/press-kit` is a coming-soon state.** Photography and the fact sheet are
   outstanding; the logo lockups are final.

## Content the team must supply before launch

Most of what used to be here has been filled in from the team's own documents. What
remains is genuinely unknown — nothing below is guessed at anywhere on the site.

| What                                                    | Where                                                                                | Who can close it                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **FSUK 2027 competition dates**                         | `content/site.json` → `competition.startsAt`                                         | IMechE. **Checked 6 September 2026: still not published** — the key dates page covers 2026 only. Expected **early October 2026**; re-check the [key dates page](https://www.imeche.org/events/formula-student/team-information/key-dates) then. The placeholder 14 July 2027 stands until it is. |
| **FSUK spectator / industry-visitor attendance**        | `content/site.ts` → `stats`                                                          | IMechE, once the 2027 event is published. Renders TBC until then.                                                                                                                                                                                                                                |
| **Every car specification except the baseline targets** | `content/cars/2027.json`                                                             | CTO Mechanical and the subteam leads, after architecture down-select (30 Sep) and concept freeze (30 Oct).                                                                                                                                                                                       |
| **A team email address on a KUFS-controlled domain**    | `content/site.json` → `contactEmail`, `sponsorshipEmail`, `sponsorship.enquiryEmail` | President / Secretary. **All three are currently one member's personal Gmail** — an interim stand-in that stops working for the team when that person graduates. See [Contact configuration](#contact-configuration).                                                                            |
| **A YouTube channel, if one is wanted**                 | `content/site.json` → `socials`                                                      | Marketing / Media / Outreach. Instagram and LinkedIn are confirmed and live. The unverified YouTube entry was removed; adding one back is a single entry in the panel.                                                                                                                           |
| **Khalifa University logo file**                        | `content/affiliations.json` + `public/affiliations/`                                 | Ask KU's brand office for the **student-organisation lockup**. Permission is already granted; only the artwork is missing. See [Third-party logos](#third-party-logos).                                                                                                                          |
| **Formula Student / IMechE logo permission**            | `content/affiliations.json`                                                          | Written confirmation from IMechE that a competing team may display the marks, and in what form. Until then both stay `permissionConfirmed: false` and neither renders.                                                                                                                           |
| **Hosting plan decision**                               | Vercel → Settings                                                                    | President / Sponsorship & Finance. Hobby is non-commercial; paid sponsor logos are not. Settle before the first sponsor goes live — see [Hosting plan](#hosting-plan--hobby-for-now-review-before-launch).                                                                                       |
| **Formspree endpoint**                                  | Vercel env, `NEXT_PUBLIC_FORMSPREE_ENDPOINT`                                         | Whoever owns the team's shared account. Until set, both forms fall back to `mailto:`.                                                                                                                                                                                                            |
| **Sponsorship prospectus PDF**                          | `public/downloads/`, then `prospectusAvailable: true`                                | Sponsorship & Finance.                                                                                                                                                                                                                                                                           |
| **Confirmed sponsors and their logos**                  | `content/sponsors.json` + `public/sponsors/`                                         | Sponsorship & Finance, once a partner signs.                                                                                                                                                                                                                                                     |
| **Team headshots**                                      | `public/team/` + `photo` in `content/team.json`                                      | Marketing / Media / Outreach. Cards show a monogram until then.                                                                                                                                                                                                                                  |
| **Milestone updates and photos**                        | `content/milestones.json` → `update`, `photo`                                        | Subteam leads, as each milestone closes.                                                                                                                                                                                                                                                         |
| **News posts**                                          | `content/news/`                                                                      | Marketing / Media / Outreach. The folder is empty — the placeholder posts were removed.                                                                                                                                                                                                          |
| **Newsletter issues**                                   | `content/newsletter/`                                                                | Marketing / Media / Outreach assembles; each subteam lead writes their own section. Empty until the first real issue — see the recipe in CONTRIBUTING.md.                                                                                                                                        |
| **Campus / workshop address**                           | `src/app/contact/page.tsx`                                                           | Secretary.                                                                                                                                                                                                                                                                                       |
| **Vector logo originals (SVG/AI)**                      | `public/brand/`                                                                      | Design lead. Current files are high-resolution PNG slices of the team's exports.                                                                                                                                                                                                                 |
| **A4 Speed commercial licence certificate (USD 12)**    | `src/assets/fonts/LICENCE-A4SPEED.txt`                                               | Marketing / Media / Outreach. The font is wired up and gated; the certificate is the only thing missing — see [Licensing](#licensing).                                                                                                                                                           |
| **The car's CAD export**                                | `public/models/`, then `pnpm render:frames`                                          | CTO Mechanical, after concept freeze.                                                                                                                                                                                                                                                            |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to make each of these changes.

### A note on what is deliberately absent

There is **no "best finish" statistic anywhere on this site**, and there will not be one
until KUFS has competed. KUFS is a first-year team building its first car; a `TBC` in
that slot would invite a reader to assume a result exists that simply has not been typed
in. The same rule applies to the car: the specification page shows _targets_ from the
team's benchmarking study, clearly labelled as such, because the architecture is not
frozen until 30 October 2026.
