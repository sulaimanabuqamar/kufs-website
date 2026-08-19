# Running this website

**You do not need to be a web developer to keep this site up to date.**

Most of what changes year to year — sponsors, the roster, milestones, open roles,
news posts — lives in plain text files in one folder. You edit a file, the site
updates. This guide assumes you have never used Next.js, React, or a terminal.

If you get stuck, the answer is almost always "ask the previous committee" or "open
an issue on GitHub". Nothing here is unrecoverable — every change is reviewed before
it goes live, and every version is kept.

---

## Contents

1. [The five-minute version](#the-five-minute-version)
2. [One-time setup](#one-time-setup)
3. [Making a change](#making-a-change)
4. [Common jobs](#common-jobs)
   - [Add a sponsor](#add-a-sponsor)
   - [Update the roster for a new year](#update-the-roster-for-a-new-year)
   - [Add a news post](#add-a-news-post)
   - [Update the season timeline](#update-the-season-timeline)
   - [Change open roles](#change-open-roles)
   - [Change team facts, emails or the competition date](#change-team-facts)
   - [Replace the car in the hero](#replace-the-car-in-the-hero)
5. [What the checks mean when they fail](#what-the-checks-mean)
6. [Handover checklist for the outgoing committee](#handover-checklist)
7. [Where everything lives](#where-everything-lives)

---

## The five-minute version

- All editable content is in the **`content/`** folder.
- Change a file there, commit it, open a pull request, and a preview link appears
  automatically. When it looks right, merge — the live site updates in about a minute.
- If you type something the site cannot use (a missing image, an invalid date), the
  build **fails and tells you exactly which file and which line**. It will not publish
  a broken page. That safety net is deliberate; do not work around it.

---

## One-time setup

You need three things installed. Do this once.

1. **Node.js** — the thing that runs the site.
   Download the LTS version from <https://nodejs.org>. Accept all defaults.

2. **pnpm** — installs the site's building blocks.
   Open Terminal (Mac) or PowerShell (Windows) and run:

   ```bash
   corepack enable pnpm
   ```

3. **The code itself.**
   ```bash
   git clone <the repository URL from GitHub>
   cd "KUFS Website"
   pnpm install
   ```

Then start it:

```bash
pnpm dev
```

Open <http://localhost:3000>. That is the site running on your own machine. Nothing you
do here affects the live site. Press `Ctrl+C` in the terminal to stop it.

> **Tip:** leave `pnpm dev` running while you edit. Save a file and the browser updates
> on its own.

---

## Making a change

Never edit the `main` branch directly — branch protection will stop you anyway.

```bash
# 1. Start from the latest version
git checkout main
git pull

# 2. Make a branch. Name it after what you are doing.
git checkout -b add-northgate-sponsor

# 3. Edit the files. Check it looks right at http://localhost:3000

# 4. Save your work
git add .
git commit -m "Add Northgate Precision as a silver sponsor"
git push -u origin add-northgate-sponsor
```

Then go to the repository on GitHub. It will offer a **"Compare & pull request"** button.
Click it, write a sentence about what you changed, and create the pull request.

Two things happen automatically:

- **Checks run.** Green tick = safe. Red cross = something is wrong; click "Details" to
  see what. See [what the checks mean](#what-the-checks-mean).
- **A preview link appears** in the pull request. That is your change, live on the
  internet at a temporary address, exactly as it will look. Send it to whoever needs to
  approve it.

When the checks are green and someone has looked at the preview, click **Merge**. The
live site updates within about a minute.

---

## Common jobs

### Add a sponsor

**File:** `content/sponsors.json`

1. Put the sponsor's logo in `public/sponsors/`. Name it lowercase with hyphens, e.g.
   `northgate-precision.webp`.
   - Ask them for a **transparent PNG or SVG**. Logos here sit on both white and navy.
   - Note its width and height in pixels (right-click → Get Info on Mac).
2. Add a block to `content/sponsors.json`, copying an existing one:

```json
{
  "name": "Northgate Precision",
  "tier": "silver",
  "url": "https://northgate-precision.example.com",
  "since": 2027,
  "blurb": "One or two sentences on what they actually do for us.",
  "contribution": "Five-axis CNC machining of suspension components.",
  "logo": {
    "src": "/sponsors/northgate-precision.webp",
    "width": 360,
    "height": 112,
    "alt": "Northgate Precision"
  }
}
```

- `tier` must be one of: `title`, `gold`, `silver`, `bronze`, `inkind`.
- `alt` is what a blind visitor hears. The sponsor's name is correct — do not write
  "logo" or "image".
- `blurb` and `contribution` are optional but strongly worth writing.

They will appear on `/sponsors`, in the footer of every page, and on the home page.
Nothing else needs changing.

### Update the roster for a new year

**File:** `content/team.json`

**This is a one-file job.** Replace the whole list. The `/team` page regroups itself:
subteams with nobody in them disappear, subteams you add appear, and the counts update.
No code changes, ever.

```json
{
  "name": "Aisha Al Mansoori",
  "role": "Team Principal",
  "subteam": "Management",
  "year": 4,
  "linkedin": "https://www.linkedin.com/in/example",
  "photo": {
    "src": "/team/aisha-al-mansoori.webp",
    "width": 600,
    "height": 750,
    "alt": "Aisha Al Mansoori, Team Principal"
  }
}
```

- `subteam` must be one of: `Management`, `Aerodynamics`, `Chassis`, `Powertrain`,
  `Electronics`, `Suspension`, `Business & Operations`.
- `year` is a number 1–8, or `"PhD"`, or `"Alumni"`.
- `linkedin` is optional. Leave it out entirely if they do not have one.
- Photos go in `public/team/`. Portrait orientation, ideally 600×750. They are cropped
  to a 4:5 box, so keep faces centred.

> **No photo yet?** Still add the person. Take the photo later and drop it in at the
> path you wrote.

### Add a news post

**Folder:** `content/news/`

Create a file ending in `.mdx`, named after the story:
`content/news/first-shakedown.mdx`

```mdx
---
title: "First shakedown at Yas Marina"
date: "2027-05-14"
author: "Aisha Al Mansoori"
excerpt: "One sentence that makes someone want to read the rest. Under 280 characters."
cover:
  src: "/news/first-shakedown.webp"
  width: 1200
  height: 675
  alt: "The car on track during its first shakedown run."
---

Write the post here. Blank lines separate paragraphs.

## A subheading looks like this

**Bold** and _italic_ work as you would expect. Links look like
[this](https://example.com).
```

Everything between the two `---` lines is the summary card. Everything after is the
post. Cover images go in `public/news/`, 1200×675.

The three most recent posts appear on the home page automatically.

> Add `draft: true` under `author` to keep a post visible locally but out of the live
> site until you are ready.

### Update the season timeline

**File:** `content/milestones.json`

```json
{
  "title": "Shakedown at Yas Marina",
  "date": "2027-05-14",
  "status": "upcoming",
  "description": "First running of the complete car. Two days of systems validation."
}
```

`status` is `done`, `active` or `upcoming`. **Only one milestone may be `active`** — it
is the "you are here" marker. The build will refuse if you mark two.

Keeping this honest, including the dates that slip, is a deliberate promise the site
makes to sponsors. Do not quietly delete a milestone that moved.

### Change open roles

**File:** `content/roles.json` — drives the `/join` page.

```json
{
  "title": "CFD Engineer",
  "subteam": "Aerodynamics",
  "description": "What they would actually be doing, in two sentences.",
  "lookingFor": ["One expectation per line", "Be honest", "No jargon"],
  "openings": 3
}
```

Set `openings` to `null` if you will take as many good applicants as apply. Delete a
role's block when it is filled.

### Change team facts

**File:** `content/site.ts`

This one is TypeScript rather than JSON, but you only ever change the text between
quotes. It holds the team name, tagline, email addresses, social links, the competition
date, the four values, and the headline statistics.

Anything marked `TODO` is waiting on a real number from the team. **Where a statistic is
not confirmed, it is deliberately set to `null` and shows as "TBC" on the site.** Please
do not replace those with estimates — a sponsor who finds out a number was invented will
not come back.

### Replace the car in the hero

The spinning car on the home page is currently a stand-in, built in code, because there
is no CAD export yet. Replacing it with the real car is **two steps**:

1. Export the car as a `.glb` file and put it at `public/models/2027-car.glb`.
2. In `content/site.ts`, change `modelPath: null` to
   `modelPath: "/models/2027-car.glb"`, then run:

```bash
pnpm render:frames
```

That regenerates all ninety frames of the hero animation and the still image used on
phones. Commit the results. The model is automatically scaled and positioned, so it
does not matter what size the export is.

---

## What the checks mean

When a pull request check fails, click **Details** and read the last few lines. These
are the ones you are most likely to see.

| Check                     | What it means                                                                              | How to fix it                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Build**                 | Something in `content/` is not valid.                                                      | The error names the file and the field, e.g. `content/sponsors.json → 0.logo.alt: alt text is required`. Fix that field. |
| **Prettier**              | Formatting is inconsistent.                                                                | Run `pnpm format` and commit the result.                                                                                 |
| **ESLint / Typecheck**    | A code problem.                                                                            | If you only edited `content/`, this should not fail — ask for help rather than guessing.                                 |
| **Check contrast claims** | A colour was changed and text is now hard to read.                                         | Do not change colours in `src/styles/tokens.css` without reading the notes at the top of that file.                      |
| **Hero behaviour**        | The home page animation broke on phones or for people who have reduced motion switched on. | Almost always a code change. Ask for help.                                                                               |
| **Brand rules**           | Racing Red has been used somewhere it is unreadable, or a logo is on the wrong background. | The error names the page and the element. See the colour rule below.                                                     |
| **JS budget**             | A page got too heavy to load quickly on mobile.                                            | A code change added a large library. Ask for help.                                                                       |
| **Performance budgets**   | The site got slow.                                                                         | Usually a very large image. Compress it.                                                                                 |

### The one colour rule

**Racing Red (`#AC2A26`) is decorative only on dark backgrounds.** On navy it is
genuinely hard to read — it fails accessibility standards at every level. It is fine on
white and off-white sections, and fine in the logo and the speed-stripe graphic.

If you want an orange or red-looking button, use **Performance Orange**, which is what
the site already does everywhere. The automated check will stop you either way.

---

## Handover checklist

For the outgoing committee, at the end of your term.

- [ ] Add the incoming web lead to the GitHub organisation, with write access.
- [ ] Add them to the Vercel project.
- [ ] Add them to the Formspree account (this receives sponsorship enquiries — losing
      access to it means losing enquiries).
- [ ] Add them to Plausible, if analytics is set up.
- [ ] Confirm the team email addresses in `content/site.ts` still reach someone who has
      not graduated.
- [ ] Update the roster in `content/team.json`.
- [ ] Update the competition date and year in `content/site.ts`.
- [ ] Walk them through this document, and through one real change end to end.
- [ ] Remove graduated members' access.

**The single most important item on this list is the email addresses.** A sponsorship
enquiry arriving at an inbox nobody opens is worse than no website.

---

## Where everything lives

```
content/           ← everything you will normally edit
  site.ts             team name, emails, competition date, values, statistics
  sponsors.json       who backs us
  team.json           the roster
  milestones.json     the season timeline
  roles.json          open positions for /join
  tiers.json          sponsorship packages and what each includes
  news/*.mdx          news posts

public/            ← images and files served as-is
  brand/              KUFS logos. Do not edit these without the design lead.
  sponsors/           sponsor logos
  team/               member photos
  news/               news cover images
  hero/               the home page car animation (generated — do not edit by hand)

src/               ← the code. You should rarely need to open this.
  styles/tokens.css   every colour, font and size in one file
  components/         the building blocks of each page
  app/                one folder per page of the site
  lib/                shared logic

scripts/           ← one-off tools, run with pnpm
```

### Useful commands

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `pnpm dev`           | Run the site locally at localhost:3000               |
| `pnpm build`         | Check everything is valid — this is what CI runs     |
| `pnpm format`        | Fix formatting automatically                         |
| `pnpm render:frames` | Rebuild the hero car animation                       |
| `pnpm screens`       | Save screenshots of every page at three screen sizes |

There is also a `/styleguide` page, visible only when running locally, that shows every
colour, font size and button on the site in one place. Useful when you are wondering
what is available.
