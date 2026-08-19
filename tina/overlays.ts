import type { Overlay } from "./zod-to-tina";

/**
 * UI metadata for the TinaCMS admin, keyed by dotted field path.
 *
 * The FIELDS themselves are compiled from src/lib/schemas.ts — see
 * tina/zod-to-tina.ts — so Zod stays the single source of truth and there is
 * no second schema to keep in sync. This file is the part a type cannot infer:
 * what to call a field in plain English, and what an editor needs to be told
 * before they change it.
 *
 * It is deliberately additive. Nothing here can add, remove or rename a field.
 * `pnpm check:tina` fails if a key stops resolving to a real generated field,
 * so a Zod rename surfaces as a failed check rather than as help text quietly
 * disappearing.
 *
 * It lives in its own module so the check script can import the same object
 * the config does, rather than a copy of it.
 */

/**
 * Shared help for the `imageRef` shape, which appears in six places.
 *
 * `pnpm check:tina` fails if any key here stops resolving to a real field, so
 * a rename in schemas.ts surfaces as a failed check rather than as help text
 * quietly vanishing.
 */
function imageOverlay(prefix: string, what: string): Overlay {
  return {
    [prefix]: { label: what },
    [`${prefix}.src`]: {
      label: "Image",
      component: "image",
      description: "Upload or pick a file. Everything else on this card describes it.",
    },
    [`${prefix}.width`]: {
      label: "Width in pixels",
      description:
        "The real pixel width of the file. Right-click the image → Get Info on a Mac, or Properties → Details on Windows. This is what stops the page jumping around while the picture loads.",
    },
    [`${prefix}.height`]: {
      label: "Height in pixels",
      description: "The real pixel height of the file. Same place as the width.",
    },
    [`${prefix}.alt`]: {
      label: "Alt text",
      component: "textarea",
      description:
        'Describe what is in the picture for someone who cannot see it. Do not just repeat the name — "Chassis jig with the front bulkhead tacked in place", not "chassis photo".',
    },
  };
}

export const siteOverlay: Overlay = {
  name: { label: "Short name", description: "Used in the header and page titles." },
  longName: { label: "Full team name" },
  tagline: {
    description:
      "Verbatim from the brand sheet. Do not reword this without the design lead.",
  },
  positioning: { component: "textarea", description: "Verbatim from the brand sheet." },
  description: {
    component: "textarea",
    description:
      "The sentence search engines and link previews show. Keep it under 160 characters.",
  },
  url: {
    description:
      "Local development fallback only. The live address comes from an environment variable in Vercel — changing this does not change the live site.",
  },
  contactEmail: { label: "General enquiries email" },
  sponsorshipEmail: { label: "Sponsorship email" },
  socials: { label: "Social accounts", itemField: "label" },
  "competition.startsAt": {
    label: "Competition start",
    description:
      'Drives the countdown and every "Silverstone 2027" label on the site. Currently a placeholder: IMechE is expected to publish the real FSUK 2027 key dates in early October 2026. Keep the +01:00 offset — the event runs in British summer time.',
  },
  stats: { label: "Headline statistics", itemField: "label" },
  "stats.value": {
    description:
      "Leave empty to show TBC. Never invent a number to fill this in — an honest TBC costs nothing and a wrong figure in front of a sponsor costs a lot.",
  },
  "stats.detail": { component: "textarea" },
  values: {
    label: "Team values",
    itemField: "title",
    description: "Verbatim from the brand sheet.",
  },
  "values.description": { component: "textarea" },
  straplines: {
    description:
      "Verbatim from the brand sheet, which defines the full set. Do not invent new ones.",
  },
  "vehicle.note": {
    component: "textarea",
    description:
      'These are targets from the benchmarking report, not decisions — the architecture is chosen on 30 September 2026 and frozen on 30 October. Say "target", never "is".',
  },
  aedToUsd: {
    label: "AED to USD rate",
    description:
      "The dirham is pegged to the dollar, so this does not move. Shown as an approximation and never fetched live.",
  },
  "sponsorship.prospectusAvailable": {
    label: "Prospectus PDF is uploaded",
    description:
      'Turn this on the moment the PDF exists at the path above. The button changes from "request it" to "download".',
  },
  "sponsorship.reasons": { label: "Why sponsor us", itemField: "title" },
  "sponsorship.reasons.body": { component: "textarea" },
  "sponsorship.reasons.stat.computed": {
    label: "Count automatically from",
    description:
      'Pick one to have the number counted from the team roster, so it can never drift. Leave empty and fill in "value" instead to write a number by hand.',
  },
  "hero.mode": {
    description:
      'Leave on "sequence". "model" is a developer preview and is much heavier on phones.',
  },
  "hero.frameCount": { description: "Set by `pnpm render:frames`. Do not edit by hand." },
  "hero.modelPath": { description: "Developer setting. Leave empty." },
  ...imageOverlay("hero.poster", "Hero poster image"),
};

export const sponsorOverlay: Overlay = {
  name: { label: "Company name" },
  tier: {
    description: "Which package they signed. Drives where and how big the logo appears.",
  },
  url: { label: "Website", description: "Full address including https://" },
  blurb: {
    component: "textarea",
    description: "One paragraph shown on the sponsors page. Optional.",
  },
  contribution: {
    component: "textarea",
    description:
      'What they actually give us. Worth filling in for in-kind partners — "CNC machining time" reads better than a logo alone.',
  },
  since: { label: "Partner since (year)" },
  ...imageOverlay("logo", "Logo"),
};

export const teamOverlay: Overlay = {
  name: { label: "Full name" },
  year: { label: "Year of study" },
  major: { label: "Major" },
  roles: {
    label: "Roles",
    description:
      "One person, one entry, however many roles they hold. Add a second role rather than a second person.",
  },
  linkedin: {
    label: "LinkedIn URL",
    description: "Optional. Full address including https://",
  },
  ...imageOverlay("photo", "Headshot"),
};

export const tierOverlay: Overlay = {
  tier: {
    label: "Tier key",
    description:
      "Do not change this on an existing tier — it is what links sponsors to their package.",
  },
  name: { label: "Tier name" },
  amount: { description: 'For example "AED 25,000". Leave empty to show TBC.' },
  summary: { component: "textarea", description: "One line on what this tier is for." },
  slots: { label: "Places available", description: "Leave empty for unlimited." },
  benefits: {
    label: "What the tier includes",
    description:
      'Type Yes or No for a plain yes/no. Type anything else — "2 per season", "Large" — to show that instead.',
  },
};

export const milestoneOverlay: Overlay = {
  status: {
    description:
      'Move this to "done" once it has actually happened, not once it is nearly done.',
  },
  description: { component: "textarea" },
  update: {
    component: "textarea",
    description:
      "What actually happened, added after the fact. This is the part sponsors read.",
  },
  ...imageOverlay("photo", "Photo"),
};

export const roleOverlay: Overlay = {
  title: { label: "Role title" },
  subteam: { label: "Subteam" },
  description: { component: "textarea" },
  lookingFor: {
    label: "What we are looking for",
    description: 'One point per line. Keep it honest — no "rockstar" language.',
  },
  openings: {
    label: "Places",
    description: "Leave empty to take as many good applicants as apply.",
  },
};

export const carOverlay: Overlay = {
  year: { label: "Competition year" },
  name: { label: "Car name", description: 'For example "KU-01".' },
  positioning: { component: "textarea" },
  spec: {
    label: "Specification",
    description: "Leave any line empty to show TBC on the site.",
  },
  subsystems: { label: "Subsystems", itemField: "name" },
  "subsystems.body": { component: "textarea" },
  ...imageOverlay("subsystems.image", "Photo or render"),
  gallery: { label: "Gallery" },
  ...imageOverlay("gallery", "Photo"),
};

export const newsOverlay: Overlay = {
  title: { label: "Headline" },
  date: { component: "datetime", label: "Published date" },
  author: { label: "Written by" },
  excerpt: {
    component: "textarea",
    description: "The two-line summary on the news list. 280 characters maximum.",
  },
  draft: {
    label: "Keep as a draft",
    description:
      "While this is on, the post is invisible to search engines, absent from the RSS feed and off the home page. Turn it off to publish.",
  },
  ...imageOverlay("cover", "Cover image"),
};
