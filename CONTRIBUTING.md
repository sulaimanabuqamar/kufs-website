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
2. [The admin panel](#the-admin-panel) — editing without touching any code
3. [One-time setup](#one-time-setup)
4. [Making a change](#making-a-change)
5. [Common jobs](#common-jobs)
   - [Changing the words on a page](#changing-the-words-on-a-page)
   - [Add a sponsor](#add-a-sponsor)
   - [Update the roster for a new year](#update-the-roster-for-a-new-year)
   - [Add a news post](#add-a-news-post)
   - [Publish a newsletter issue](#publish-a-newsletter-issue)
   - [Update the season timeline](#update-the-season-timeline)
   - [Change open roles](#change-open-roles)
   - [Change team facts, emails or the competition date](#change-team-facts)
   - [Change the social links](#change-the-social-links)
   - [Replace the car in the hero](#replace-the-car-in-the-hero)
6. [What the checks mean when they fail](#what-the-checks-mean)
7. [Handover checklist for the outgoing committee](#handover-checklist)
8. [Where everything lives](#where-everything-lives)

---

## The five-minute version

- There are **two ways to change the site**, and they edit exactly the same thing.
  The [admin panel](#the-admin-panel) at `kufs-website.vercel.app/admin` is a
  normal-looking website editor — no code, no git. Editing the files in
  **`content/`** by hand does the same job with more control. Use whichever you
  prefer; you will not break anything by mixing them.
- All editable content is in the **`content/`** folder.
- Change a file there, commit it, open a pull request, and a preview link appears
  automatically. When it looks right, merge — the live site updates in about a minute.
- If you type something the site cannot use (a missing image, an invalid date), the
  build **fails and tells you exactly which file and which line**. It will not publish
  a broken page. That safety net is deliberate; do not work around it.

---

## The admin panel

If you have never used a content management system: this is a web page where you fill
in boxes and press Save. You do not need to install anything, you do not need to
understand git, and you cannot break the website with it — the checks described
further down still run, and a bad edit is refused before it goes live.

### Logging in

1. Go to **`https://kufs-website.vercel.app/admin`**.
2. Sign in with the account the previous committee added you to. If nobody has added
   you, ask the web lead — access is limited to committee leads on purpose.
3. You land on a list of everything you can edit: Site settings, Sponsors, Team
   roster, Sponsorship tiers, Progress timeline, Open roles, The car, News.

> **If `/admin` shows "404 — page not found"**, the panel is switched off for this
> deployment. That is a normal, supported state, not a fault: it means the Tina
> credentials are not set. The website itself is completely unaffected, and all of the
> content is still editable by editing the files in `content/` directly. See
> [Turning the panel on](#turning-the-panel-on).

### What happens when you press Save

This is the part that surprises people, so read it once:

1. You press **Save**.
2. Your edit is **committed to the GitHub repository** — the panel is a friendly front
   end for the same files described in the rest of this document. There is no separate
   database. Nothing is stored inside the CMS.
3. Vercel notices the commit and **rebuilds the site**.
4. **About one to two minutes later**, the live site shows your change.

**The delay is normal.** If you refresh the site five seconds after saving and nothing
has changed, nothing is broken — the rebuild has not finished. Wait two minutes and
refresh again. Do not press Save repeatedly; each press queues another rebuild.

### Adding a sponsor

1. Open **Sponsors**.
2. Press **Add item** at the bottom of the list.
3. Fill in:
   - **Company name** — exactly as they write it themselves.
   - **Tier** — pick from the list. This decides where and how big their logo appears.
   - **Website** — the full address, including `https://`.
   - **Logo** — press the image box, then **Upload**, and pick their logo file. Ask
     them for a transparent PNG or SVG: these logos sit on both white and navy
     backgrounds.
   - **Width in pixels** and **Height in pixels** — the real size of the file you just
     uploaded. On a Mac, right-click the file → Get Info. On Windows, right-click →
     Properties → Details. These are not optional: the page uses them to reserve the
     right amount of space so nothing jumps around while the logo loads.
   - **Alt text** — the company's name. This is what a blind visitor hears. Do not
     write "logo" or "image".
4. **Blurb** and **Contribution** are optional and worth writing. "Five-axis CNC
   machining of suspension components" tells a reader far more than a logo does.
5. Press **Save**.

They now appear on `/sponsors`, in the footer of every page, and on the home page.

### Posting a news update

1. Open **News**, then **Create New**.
2. **Headline** — the web address is made from this automatically, so you do not type
   a filename.
3. **Published date**, **Written by**, and **Excerpt** — the excerpt is the two-line
   summary on the news list. 280 characters maximum.
4. **Cover image** — same three extra fields as a logo: width, height, alt text.
5. Write the post in the big box at the bottom. It works like any document editor —
   headings, bold, links, lists.
6. **Keep as a draft** is on by default for a new post. While it is on, the post is
   invisible to search engines, absent from the news feed and off the home page, but
   you can still see it on the site to check it. Turn it off when you want it public.
7. Press **Save**.

### Uploading a photo

Any image box works the same way: press it, press **Upload**, choose the file. The
file is committed to the repository alongside your edit, so it is backed up with
everything else.

Two things to get right, every time:

- **Width and height** must match the real file. Wrong numbers make the page jump
  around as it loads.
- **Alt text** must describe the picture, not name it. "Chassis jig with the front
  bulkhead tacked in place" — not "chassis photo".

Photographs are the single biggest gap on this site. A real picture of the team
working beats a placeholder every time, so upload them as you take them.

### When a save is rejected

Two different things can stop an edit, and they look different.

**The panel refuses to save.** A required box is empty, or a number field has letters
in it. The panel highlights the box. Fill it in and save again.

**The save works, but the site does not update.** This means the edit was committed
but the rebuild failed the content checks. The rules in `src/lib/schemas.ts` are
stricter than the panel can express — a web address that is not really an address, a
sponsorship tier used twice, the same person entered twice.

You will get an email from Vercel saying the deployment failed. To see why:

1. Open the Vercel dashboard → the failed deployment → **Build Logs**.
2. Look for a block that starts `Invalid content in content/...`. It names the file and
   the exact field, in plain English. For example:

   ```
   Invalid content in content/sponsors.json
     • 0.url: Invalid URL
     • 0.since: Too small: expected number to be >=2000
   ```

3. Go back to the panel, fix that field, and save again.

**The live site is never affected by a failed build.** It keeps serving the last good
version until a build succeeds. Nothing is lost and nothing is broken — you just have
to fix the field.

### Turning the panel on

Only needed if `/admin` returns 404 and you want the panel back.

1. Sign in at [app.tina.io](https://app.tina.io) with the team's Tina account and open
   the KUFS project. If there is no project, create one and point it at this GitHub
   repository.
2. Copy the **Client ID** from the project's Overview tab, and create a **read-write
   token** on the Tokens tab.
3. In the Vercel dashboard → the KUFS project → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_TINA_CLIENT_ID` — the Client ID.
   - `TINA_TOKEN` — the token. **This one is a secret.** It can write to the
     repository. Never paste it into a file, a message, or an issue.
4. Redeploy. `/admin` works from the next deployment onwards.

To turn the panel off again, delete those two variables and redeploy. The website is
unaffected.

### Changing the words on a page

Every visible word on this site is editable here — headings, paragraphs, button
labels, form labels, the error messages, the empty states, even the text screen readers
read out. You do not need a developer and you do not need to touch the code.

1. Open the panel and pick the page from the list: **Home page**, **Become a Sponsor
   page**, **Team page**, and so on. There is one entry per page on the site.
   - Words that appear on _every_ page — the menu, the footer, the two buttons in the
     header, the enquiry forms — are under **Shared wording** instead.
2. Find the section by **what it says on the live site**, not by what a developer would
   call it. The fields are named after what the reader sees: "Main heading", "Intro
   paragraph", "\"See open roles\" button".
3. Change the text and press **Save**.
4. Wait one to two minutes for the rebuild, then refresh the live page. (See
   [What happens when you press Save](#what-happens-when-you-press-save) — the delay is
   normal.)

**Tip:** keep the live page open in a second tab. The panel is laid out in the same
order as the page, so scrolling both together is the fastest way to find something.

#### Why a heading will not let you type more

Headings, buttons and small labels have a **character limit**, shown under the box as
"Up to 70 characters." Go over it and the panel refuses to save, with a red line saying
how many characters you have used.

This is not the panel being fussy. The limits are measured against what the design
actually holds **on a phone**, which is where most people read this site:

| Field           | Limit | What happens past it                                       |
| --------------- | ----- | ---------------------------------------------------------- |
| Button label    | 32    | Wraps to two lines, next to buttons that are one line      |
| Heading         | 70    | Wraps to three lines and pushes the buttons below the fold |
| Small label     | 36    | Overlaps the number beside it in the stat panels           |
| Intro paragraph | 280   | Pushes the page content down past the first screen         |

If you genuinely need more room than a limit allows, that is a design question — ask a
developer rather than trying to squeeze the words. Changing a limit is one line, but it
should be a decision someone makes on purpose.

#### Words with a {something} in them

Some fields contain a placeholder in curly brackets:

```
Every tier is open for the {year} season.
KUFS is {headcount} students across {subteams} subteams.
```

Those get filled in automatically — `{year}` from the competition date, `{headcount}` by
counting the roster. **Leave the brackets exactly as they are**, but you can move them
around inside the sentence and rewrite everything else. "The {year} season is open at
every tier" works just as well.

The help text under each field lists which placeholders it accepts. Inventing a new one
will fail the build, because there is nothing to fill it with.

### What you cannot change here, and who to ask

The panel deliberately does not expose these. If you need one, it is a developer request,
not a broken panel:

| You want to...                                             | Why it is not here                                                                                                                                                                          | Ask      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Change a colour, a font or the spacing                     | Every colour on the site is contrast-checked so text stays readable for people with low vision. A CMS that can set a heading to red on navy ships something that fails accessibility rules. | Web lead |
| Add, remove or rename a page                               | The URL of `/become-a-sponsor` is in sponsor emails and decks. A panel that can delete it is a liability. You _can_ rename what the menu link says.                                         | Web lead |
| Make a heading bigger, or turn a heading into a subheading | Heading levels are what screen readers use to navigate the page. Changing the words is safe; changing the structure is not.                                                                 | Web lead |
| Move a section up or down the page                         | Section order is a design decision that was made per page for a reason.                                                                                                                     | Web lead |
| Add a new section or a new field                           | The field has to exist in the content rules first, or the build rejects it.                                                                                                                 | Web lead |
| Change where an enquiry type sends email                   | Pointing "Press and media" at the sponsorship inbox is a routing mistake nobody notices for weeks.                                                                                          | Web lead |

Everything else — every word, every image, every sponsor, every milestone — is yours.

### Editing the panel itself

Developers only. The fields in the panel are **generated from the content rules** in
`src/lib/schemas.ts` by `tina/zod-to-tina.ts` — there is no second list of fields to
keep in step. Add a field to the Zod schema and it appears in the panel automatically.

What is written by hand is `tina/overlays.ts`: the plain-English labels and the help
text under each box. It can only annotate fields, never add or remove them, and
`pnpm check:tina` fails if a label points at a field that no longer exists.

To work on the panel locally, run `pnpm dev:cms` instead of `pnpm dev`. That starts the
site with a local copy of the CMS at `http://localhost:3000/admin`, backed by the files
on your machine — no Tina account and no internet needed. Saves write straight to
`content/`, so you can see exactly what the panel produces.

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
   git clone https://github.com/sulaimanabuqamar/kufs-website.git
   cd kufs-website
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
git commit -m "Add Example Partner Ltd as a silver sponsor"
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
   `example-partner.webp`.
   - Ask them for a **transparent PNG or SVG**. Logos here sit on both white and navy.
   - Note its width and height in pixels (right-click → Get Info on Mac).
2. Add a block to the `"sponsors"` list in `content/sponsors.json`, copying an
   existing one. The file looks like `{ "sponsors": [ ... ] }` — the outer wrapper is
   there because the admin panel writes JSON objects; leave it alone and edit the
   list inside it.

```json
{
  "name": "Example Partner Ltd",
  "tier": "tier3",
  "url": "https://example-partner.com",
  "since": 2027,
  "blurb": "One or two sentences on what they actually do for us.",
  "contribution": "Five-axis CNC machining of suspension components.",
  "logo": {
    "src": "/sponsors/example-partner.webp",
    "width": 360,
    "height": 112,
    "alt": "Example Partner Ltd"
  }
}
```

- `tier` must be one of: `tier1`, `tier2`, `tier3`, `inkind`. Amounts and what each
  tier includes live in `content/tiers.json`.
- `alt` is what a blind visitor hears. The sponsor's name is correct — do not write
  "logo" or "image".
- `blurb` and `contribution` are optional but strongly worth writing.

They will appear on `/sponsors`, in the footer of every page, and on the home page.
Nothing else needs changing.

### Update the roster for a new year

**File:** `content/team.json`

> **The list files all look like `{ "<name>": [ ... ] }`.** `sponsors.json` wraps its
> list in `"sponsors"`, `team.json` in `"team"`, and so on. That outer object is there
> because the admin panel writes JSON objects and cannot write a bare list. Leave the
> wrapper alone and edit the list inside it.

**This is a one-file job.** Replace the whole list. The `/team` page regroups itself:
subteams with nobody in them disappear, subteams you add appear, and the counts update.
No code changes, ever.

```json
{
  "name": "Full Name",
  "year": "Junior",
  "major": "Mechanical Engineering",
  "roles": [{ "division": "Engineering", "title": "Suspension" }],
  "photo": null
}
```

- `year` is one of `Freshman`, `Sophomore`, `Junior`, `Senior`, `Graduate`.
- `roles` is a list, because people hold more than one. Each entry is either
  `{ "division": "Operations", "title": ... }` — President, Vice President, Secretary,
  CTO Mechanical, CTO Electrical, Marketing / Media / Outreach, Sponsorship & Finance —
  or `{ "division": "Engineering", "title": ... }` — Aerodynamics, Chassis & Driver
  Ergonomics, Steering, Suspension, Throttle & Braking Systems, Powertrain & Drivetrain,
  High Voltage, Low Voltage & Controls.
- **One entry per person.** If someone does two jobs, give them two roles, not two
  cards. The build will reject duplicate names.
- An Operations role with nobody in it is treated as a **vacancy** and shown as one on
  `/team` and `/join`. That is how CTO Electrical currently appears — you do not
  maintain a separate list of openings.
- `photo` is `null` until a headshot exists; the card shows a branded monogram instead.
  When you have photos, put them in `public/team/` at 600×750 and fill in the object.

> ### Privacy — read this before editing the roster
>
> The team's internal roster spreadsheet contains **student ID numbers and personal
> mobile numbers**. Those must **never** go into this repository — not in `team.json`,
> not in a comment, not in a commit message. The only per-person fields this site
> publishes are **name, role, subteam, year of study and major**, and the schema has no
> field that could hold anything else. Do not copy the spreadsheet into the repo.

### Add a news post

**Folder:** `content/news/`

Create a file ending in `.mdx`, named after the story:
`content/news/first-drive.mdx`

```mdx
---
title: "First drive"
date: "2027-05-14"
author: "Your Name"
excerpt: "One sentence that makes someone want to read the rest. Under 280 characters."
cover:
  src: "/news/first-drive.webp"
  width: 1200
  height: 675
  alt: "The car running for the first time."
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

### Publish a newsletter issue

**Folder:** `content/newsletter/` — one file per month, named `<year>-<month>.mdx`, e.g.
`content/newsletter/2026-10.mdx`. **Panel:** Newsletter issues.

The newsletter is **not** `/news`. `/news` is for one-off announcements — a result, a
launch, a signed partner. The newsletter is the monthly record in which **each subteam
reports its own work**. They have separate pages and separate RSS feeds because they
have separate readers.

There are two jobs here, and they belong to different people.

---

#### If you are a subteam lead: write your section

You are writing **one section**, not the whole issue. Send it to the marketing lead, or
paste it straight into the file under your subteam's heading.

Your section starts with a level-two heading that is **your subteam's name, spelled
exactly as the roster spells it**:

```mdx
## Suspension

We finished the kinematics model and validated it against the rig measurement. Camber
gain came out 0.3° short of target through the first 30 mm of travel.

### What did not work

The first upright design failed at 1.4× the load case. It is being redesigned around a
thicker bearing boss — the analysis is in the shared drive.

### Next month

Wishbone tube sizing, and a decision on rod ends.
```

Four rules:

- **`##` is your subteam name and nothing else.** It becomes the heading and the jump
  link at the top of the issue. If it does not exactly match a subteam on the roster,
  the build fails and names the file and the heading — so a subteam that gets renamed
  can never leave an old name behind in an issue.
- **Use `###` for subheadings inside your section**, as above. `##` would start a new
  subteam section.
- **Write what actually happened**, including what did not work. That is the point of
  the newsletter and it is what a judge, a sponsor and a prospective member all want.
  Nobody needs a paragraph saying the month went well.
- **If you have nothing to report, send nothing.** Do not write "no update this month".

#### If you are the marketing lead: assemble and publish the issue

1. **Create the file.** `content/newsletter/<year>-<month>.mdx`, e.g. `2026-10.mdx`. In
   the panel, choose Newsletter issues → Create — the filename is generated from the
   year and month you enter, so it cannot disagree with them. Editing the file directly,
   note that **the filename must match the frontmatter**; the build refuses an issue
   named for a different month than it claims to be.

2. **Fill in the frontmatter and write the introduction.**

   ```mdx
   ---
   issue: 4
   month: 10
   year: 2026
   intro: "Concept freeze month. Three subteams closed out their architecture decisions and the chassis jig went up in the workshop."
   ---
   ```

   `issue` is sequential and must be unique — the build refuses two issues with the same
   number. `intro` is plain text, no formatting: it is also used as the search-result
   description and the RSS summary, where markup would be wrong. Keep it under 500
   characters.

3. **Paste each subteam's section in.** Order does not matter — sections are re-ordered
   into the same sequence the subteams appear in on `/team`, so every issue reads the
   same way.

4. **Leave out the subteams who did not contribute.** Do not add an empty section or a
   "no update this month" line for them. Eight of those makes a quiet month look like a
   dead team; a reader counts what is there. The issue page and the index both show
   which subteams reported, so a short issue is honest rather than broken. The build
   refuses a heading with nothing under it.

5. **Publish.** Add `draft: true` under `year` while you are still collecting sections —
   the issue is then readable at its own URL for the team to check, behind a visible
   banner, but it is not listed publicly, not in the RSS feed and not indexed by search
   engines. Delete the line to publish. This is the same flag, and the same behaviour,
   as a draft news post.

> **Nothing is seeded.** `content/newsletter/` is empty and `/newsletter` shows an
> honest "no issues yet" state. That is correct until the first real issue exists —
> please do not add a placeholder issue to make the page look populated.

### Update the season timeline

**File:** `content/milestones.json` (a `{ "milestones": [ ... ] }` wrapper — see above)

```json
{
  "title": "Integrated Vehicle & First Drive",
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

**File:** `content/roles.json` (a `{ "roles": [ ... ] }` wrapper — see above) — drives the `/join` page.

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

**File:** `content/site.json` — or **Site settings** in the panel, which is easier.

It holds the team name, tagline, email addresses, social links, the competition date,
the four values, and the headline statistics. The notes that cannot live in a JSON file
are in `content/site.ts` directly above the loader — read them before changing a value
you are unsure about.

**Where a statistic is not confirmed it is deliberately `null`, and shows as "TBC" on
the site.** Please do not replace those with estimates — a sponsor who finds out a
number was invented will not come back.

> **The contact address is a personal one, for now.** All three email fields point at a
> single personal Gmail account. That is a stand-in: it must be replaced with a team
> address on a KUFS-controlled domain before launch, because a personal address stops
> working for the team the moment that person graduates. It is on the handover checklist.

### Change the social links

**Panel:** Site settings → Social links. **File:** `content/site.json` → `socials`.

Each entry is a label, a URL and a handle. There are two today, Instagram and LinkedIn,
and they are the team's real accounts.

**Only add an account that actually exists.** A social link is a claim that the account
is ours. This list previously shipped three entries that were invented from the expected
handle format — an Instagram account that belonged to somebody else, and a YouTube
channel that had never been created — and they sat in the footer of every page for
weeks. If a YouTube channel is created later, adding it is one entry here.

> ### Do not paste a link copied from the app
>
> "Copy link" in Instagram or LinkedIn does not give you the plain profile URL. It
> appends a **share-tracking identifier tied to the phone that copied it**:
>
> ```
> https://www.instagram.com/kufs.ae?igsi=MThvcDg4aTU4cGI5MQ==
>                                    ^^^^^^^^^^^^^^^^^^^^^^^^ delete this
> ```
>
> Published, that puts one person's tracking token in the footer of every page on a
> public site. **The build will refuse it** — any social URL carrying a `?` or a `#` is
> rejected with an explanation — so you cannot ship one by accident. Delete everything
> from the `?` onwards and keep the bare profile URL. It goes to exactly the same place.

### Replace the car in the hero

The spinning car on the home page is currently a stand-in, built in code, because there
is no CAD export yet. Replacing it with the real car is **two steps**:

1. Export the car as a `.glb` file and put it at `public/models/2027-car.glb`.
2. In `content/site.json`, change `"modelPath": null` to
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

- [ ] Add the incoming web lead to the GitHub repository, with write access.
- [ ] Raise the required approval count on `main` to 1 once two people have write access
      (it is 0 today so a solo maintainer is not locked out).
- [ ] Add them to the Vercel project.
- [ ] Add them to the Formspree account (this receives sponsorship enquiries — losing
      access to it means losing enquiries).
- [ ] Add them to Plausible, if analytics is set up.
- [ ] **Transfer the TinaCMS account** (the `/admin` panel). Sign in at
      [app.tina.io](https://app.tina.io), open the KUFS project → Collaborators, and
      add the incoming web lead as an owner. Then remove yourself once they confirm
      they can log in. If the token is rotated or the project is deleted, `/admin`
      returns 404 and **the website carries on working normally** — every piece of
      content is still in `content/` and still editable by hand, so this is an
      inconvenience rather than an emergency.
- [ ] **Replace the contact address with a team address on a KUFS-controlled domain.**
      All three email fields in `content/site.json` currently point at one member's
      personal Gmail. This is the item that breaks silently: the address keeps accepting
      mail after they graduate, and nobody on the team can read it.
- [ ] Chase the **Khalifa University logo file** from KU's brand office — ask for the
      lockup issued to student organisations. Permission is granted; only the artwork is
      missing, and the affiliations strip stays hidden until it arrives.
- [ ] Chase **IMechE** on whether a competing team may display the Formula Student and
      IMechE marks, and in what form.
- [ ] **Review the hosting plan.** Vercel's Hobby plan is for non-commercial projects,
      and this site carries paid sponsor logos. Settle it before the first sponsor goes
      live.
- [ ] Update the roster in `content/team.json`.
- [ ] Update the competition date and year in `content/site.json`.
- [ ] Walk them through this document, and through one real change end to end.
- [ ] Remove graduated members' access.

**The single most important item on this list is the email addresses.** A sponsorship
enquiry arriving at an inbox nobody opens is worse than no website.

---

## Where everything lives

```
content/           ← everything you will normally edit
  site.json           team name, emails, socials, competition date, values, statistics
  site.ts             loads site.json and checks it — no values live here
  affiliations.json   KU / Formula Student / IMechE — logos, and whether we may use them
  sponsors.json       who backs us
  team.json           the roster
  milestones.json     the season timeline
  roles.json          open positions for /join
  tiers.json          sponsorship packages and what each includes
  news/*.mdx          news posts — one-off announcements
  newsletter/*.mdx    the monthly newsletter — one file per issue

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
