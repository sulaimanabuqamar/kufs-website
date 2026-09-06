import { parseOrThrow, siteSchema, type SiteConfig } from "@/lib/schemas";

import raw from "./site.json";

/**
 * Sitewide configuration — the loader.
 *
 * The values live in `content/site.json`; this file reads them, validates them
 * against `siteSchema` and exports the typed object. A typo fails `pnpm build`
 * with the field named, rather than shipping.
 *
 * WHY THE SPLIT: this used to be one TypeScript file with the values inline.
 * TinaCMS edits files, and it cannot edit TypeScript, so the editable half had
 * to become data. Nothing downstream changed — the import path, the export and
 * the type are all the same.
 *
 * WHAT THE JSON CANNOT CARRY IS BELOW. JSON has no comments, and the notes
 * that were attached to these values are the kind of thing that gets silently
 * lost in a format change and then relearned the expensive way. The short
 * versions of them are also set as field descriptions in `tina/config.ts`,
 * which is where an editor will actually encounter them.
 *
 * ---------------------------------------------------------------------------
 * VERBATIM FROM THE BRAND SHEET — do not reword
 * ---------------------------------------------------------------------------
 * `tagline`, `positioning`, `values[]` and `straplines[]`. The brand sheet
 * defines the full set of straplines; do not invent new ones.
 *
 * ---------------------------------------------------------------------------
 * `url`
 * ---------------------------------------------------------------------------
 * LOCAL DEVELOPMENT FALLBACK ONLY. The live canonical origin comes from
 * NEXT_PUBLIC_SITE_URL, falling back to the deployment's own VERCEL_URL on
 * previews — see `src/lib/env.ts`. Change it there, not here.
 *
 * It is nonetheless set to the REAL live origin. It used to read
 * `https://kufs.ku.ac.ae`, a domain that has never existed — the custom domain
 * has not been requested from university IT yet. A fallback only surfaces when
 * the environment variable is missing, which is precisely the moment nobody is
 * watching, so it must be a URL that resolves.
 *
 * ---------------------------------------------------------------------------
 * `competition.startsAt`
 * ---------------------------------------------------------------------------
 * PLACEHOLDER DATE. The official FSUK 2027 key dates have not been published.
 * Per the team's project timeline, IMechE is expected to release them in EARLY
 * OCTOBER 2026 — check the key dates page then and replace this single value.
 * The countdown and every "Silverstone 2027" label derive from it. Keep the
 * +01:00 (BST) offset; the event runs in British summer.
 *
 * ---------------------------------------------------------------------------
 * `stats` and `sponsorship.reasons[].stat`
 * ---------------------------------------------------------------------------
 * Headcount, discipline count and subteam count are deliberately NOT stored
 * here. They are computed from `content/team.json` by `getTeamStats()` so they
 * cannot drift from the roster — that is what `stat.computed` selects. A
 * `value` of null renders as TBC.
 *
 * There is deliberately no "best finish" stat. KUFS has not competed yet.
 *
 * ---------------------------------------------------------------------------
 * `vehicle`
 * ---------------------------------------------------------------------------
 * From the team's first-year benchmarking report. These are the working
 * baseline and targets, not decisions: the architecture is selected on 30
 * September 2026 and frozen on 30 October 2026. Say "target", never "is".
 *
 * ---------------------------------------------------------------------------
 * `aedToUsd`
 * ---------------------------------------------------------------------------
 * The dirham is pegged to the dollar, so this does not move — but it is still
 * shown as an approximation and is never fetched live.
 *
 * ---------------------------------------------------------------------------
 * `sponsorship.prospectusAvailable`
 * ---------------------------------------------------------------------------
 * The PDF has not been supplied. Flip to true the moment it is committed at
 * `prospectusPath`; the button changes from "request it" to "download".
 *
 * ---------------------------------------------------------------------------
 * `hero`
 * ---------------------------------------------------------------------------
 * "sequence" is the production hero. Switch to "model" locally to preview a
 * live three.js car before real renders exist; the three.js bundle is
 * lazy-loaded, so it never reaches the production payload either way.
 *
 * `modelPath: null` uses the procedural low-poly car in
 * `src/lib/placeholderCar.ts`. Set it to "/models/placeholder-car.glb" (or the
 * real CAD export) to use a GLB instead, then re-run `pnpm render:frames`.
 *
 * ---------------------------------------------------------------------------
 * `contactEmail` / `sponsorshipEmail` / `sponsorship.enquiryEmail`
 * ---------------------------------------------------------------------------
 * INTERIM PERSONAL ADDRESS. All three are one personal Gmail account. They
 * replaced `kufs@ku.ac.ae` and `partnerships.kufs@ku.ac.ae`, which were
 * guesses at a KU address format and were never confirmed to reach anyone.
 *
 * This must be replaced with a team address on a KUFS-controlled domain before
 * public launch: a personal address stops working for the team the moment that
 * person graduates, and it puts one member's inbox on every page. It is on the
 * handover checklist in README.md.
 *
 * The address is rendered entity-encoded everywhere it appears, so it is not
 * sitting in the HTML for an address harvester to regex out — see
 * `src/lib/obfuscateEmail.ts`.
 *
 * ---------------------------------------------------------------------------
 * `socials[]`
 * ---------------------------------------------------------------------------
 * CONFIRMED ACCOUNTS ONLY. This list previously held three entries invented
 * from the expected handle format: an Instagram account that was not ours
 * (`@kufsracing`), a LinkedIn page, and a YouTube channel that did not exist.
 * They were live in the footer of every page.
 *
 * Instagram and LinkedIn are now the team's real accounts. YouTube is gone and
 * comes back only when a channel exists. Adding one is a single entry here or
 * in /admin under Site settings.
 *
 * Do not paste a link copied from the Instagram or LinkedIn app: "Copy link"
 * appends a share-tracking identifier tied to the phone that copied it, and
 * the schema rejects any href carrying a query string or fragment for exactly
 * that reason.
 */
const site: SiteConfig = parseOrThrow(siteSchema, raw, "content/site.json");

export default site;
