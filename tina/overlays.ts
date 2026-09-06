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

/**
 * A newsletter issue.
 *
 * The subteam sections are NOT here: they are the `##` headings in the body,
 * validated against the roster when the site builds. The panel edits the body
 * as rich text like a news post, and a heading that is not a subteam name
 * fails the build with the file and the heading named.
 */
export const newsletterOverlay: Overlay = {
  issue: {
    label: "Issue number",
    description: 'Sequential, starting at 1. Shown as "Issue 4".',
  },
  month: {
    label: "Month",
    description: "1 to 12. The file must be named <year>-<month>.mdx to match.",
  },
  year: { label: "Year" },
  intro: {
    component: "textarea",
    label: "Editor's introduction",
    description:
      "A short paragraph opening the issue. Also used as the search-result description and the RSS summary, so keep it plain — no formatting. 500 characters maximum.",
  },
  draft: {
    label: "Keep as a draft",
    description:
      "While this is on, the issue is invisible to search engines, absent from the newsletter RSS feed and not listed publicly. Turn it off to publish.",
  },
};

/* -------------------------------------------------------------------------
   Page copy
   -------------------------------------------------------------------------
   The copy collections are where a committee lead spends most of their time,
   so these labels matter more than the ones above. Two rules were applied
   throughout:

   1. Name a field after what the reader SEES, not after the component. The
      person editing has the live page open in another tab and is looking for
      the words in front of them — "Intro paragraph", not "SectionHeading
      lead".

   2. Say what a length limit is FOR. "Maximum 70 characters" invites someone
      to wonder who decided that. "Two lines on a phone; longer pushes the
      buttons below the fold" tells them what happens if they push it, which
      is the thing they actually want to know.
   ------------------------------------------------------------------------- */

/** Used wherever a section header repeats: eyebrow, heading, standfirst. */
function sectionOverlay(prefix: string, what: string): Overlay {
  const at = (field: string) => (prefix ? `${prefix}.${field}` : field);
  return {
    ...(prefix ? { [prefix]: { label: what } } : {}),
    [at("eyebrow")]: {
      label: "Small label above the heading",
      description: "A few words in capitals. Keep it short — it sits on one line.",
    },
    [at("title")]: {
      label: "Heading",
      description:
        "Two lines on a phone at this size. Longer wraps to three and starts pushing everything below it down the page.",
    },
    [at("lead")]: {
      label: "Intro paragraph",
      description: "The larger paragraph under the heading. Leave empty to hide it.",
    },
  };
}

const META_OVERLAY: Overlay = {
  meta: { label: "Search engines and link previews" },
  "meta.title": {
    label: "Page title",
    description:
      "Shown in the browser tab and as the blue link in Google. Google cuts it off around 60 characters.",
  },
  "meta.description": {
    label: "Search description",
    description:
      "The grey text under the link in Google, and the preview when the page is shared. Google cuts it off around 160 characters.",
  },
};

export const commonCopyOverlay: Overlay = {
  nav: { label: "Navigation" },
  "nav.primary": {
    label: "Main menu",
    itemField: "label",
    description:
      "The words only. You cannot add, remove or reorder pages here — ask a developer for that.",
  },
  "nav.primary.href": {
    label: "Page",
    description: "Which page this links to. Fixed; do not change it.",
  },
  "nav.primary.label": { label: "Menu wording" },
  "nav.primary.description": {
    label: "One-line explanation",
    description: "Shown under the link in the phone menu and in the footer.",
  },
  "nav.secondary": { label: "Footer menu", itemField: "label" },
  "nav.secondary.href": { label: "Page", description: "Fixed; do not change it." },
  "nav.secondary.label": { label: "Menu wording" },
  cta: { label: "The two buttons that appear across the site" },
  "cta.sponsor": { label: "Sponsorship button" },
  "cta.join": { label: "Recruitment button" },
  header: { label: "Header" },
  "header.skipToContent": {
    label: "Skip link",
    description:
      "The first thing a keyboard or screen-reader user reaches on every page. Leave it plain.",
  },
  "header.openMenu": { label: "Open menu button (spoken, not shown)" },
  "header.closeMenu": { label: "Close menu button" },
  seoKeywords: {
    label: "Search keywords",
    description:
      "Search engines largely ignore these now. The team name, competition and university are added automatically.",
  },
  footer: { label: "Footer" },
  "footer.exploreHeading": { label: "First column heading" },
  "footer.getInvolvedHeading": { label: "Second column heading" },
  "footer.legalLine": {
    label: "Copyright line",
    description:
      "Use {name} for the team name and {university} for the university. The year is added automatically.",
  },
  comingSoon: { label: '"Coming soon" panel on unfinished pages' },
  "comingSoon.badge": { label: "Badge" },
  "comingSoon.body": { label: "Explanation" },
  "comingSoon.backLink": { label: "Link back to the home page" },
  hero: { label: "Home page hero" },
  "hero.scrollHint": { label: '"Scroll" hint under the car' },
  countdown: { label: "Countdown clock" },
  "countdown.days": { label: '"Days"' },
  "countdown.hours": { label: '"Hours"' },
  "countdown.minutes": { label: '"Minutes"' },
  "countdown.seconds": { label: '"Seconds"' },
  "countdown.happeningNow": { label: "Heading during the competition" },
  "countdown.happeningNowDetail": {
    label: "Text during the competition",
    description: "Use {event} for the competition name and year.",
  },
  "countdown.finished": { label: "Heading after the competition" },
  "countdown.finishedDetail": {
    label: "Text after the competition",
    description: "Use {event} for the competition name and year.",
  },
  "countdown.remainingSummary": {
    label: "Spoken summary",
    description:
      "Read aloud by screen readers instead of the ticking digits. Use {days}, {hours}, {minutes} and {event}.",
  },
  "countdown.loadingSummary": {
    label: "Spoken summary while loading",
    description: "Use {event}.",
  },
  ui: { label: "Words used in more than one place" },
  "ui.logoAlt": {
    label: "Logo description",
    description: "What a screen reader says in place of the KUFS logo.",
  },
  "ui.sponsorBarHeading": { label: "Heading above the footer sponsor logos" },
  "ui.linkedinLabel": { label: "LinkedIn link on a team card" },
  "ui.statusDone": { label: "Milestone status: finished" },
  "ui.statusActive": { label: "Milestone status: in progress" },
  "ui.statusUpcoming": { label: "Milestone status: not started" },
  "ui.heroLoading": {
    label: "Spoken text while the hero loads",
    description: "Use {percent} for the number.",
  },
  tierTable: { label: "Sponsorship tier comparison table" },
  "tierTable.notIncluded": {
    label: '"Not included" (spoken)',
    description: "Sighted readers see a dash; this is what a screen reader says instead.",
  },
  "tierTable.tbcLabel": { label: "Placeholder for an unset amount" },
  "tierTable.tbcTooltip": { label: "Explanation on hover" },
  "tierTable.usdApprox": {
    label: "Dollar equivalent",
    description: "Use {amount} for the converted figure.",
  },
  "tierTable.tableCaption": {
    label: "Table description (spoken)",
    description: "Read aloud before the table so it makes sense without seeing it.",
  },
  "tierTable.benefitColumnLabel": { label: "First column heading (spoken)" },
  "tierTable.purposeRowLabel": { label: '"What it is for" row' },
  "tierTable.placeSingular": { label: '"place" (one)' },
  "tierTable.placePlural": { label: '"places" (more than one)' },
  form: { label: "Enquiry forms" },
  "form.nameLabel": { label: "Name field" },
  "form.organisationLabel": { label: "Organisation field" },
  "form.emailLabel": { label: "Email field" },
  "form.messageLabel": { label: "Message field" },
  "form.honeypotLabel": {
    label: "Spam trap field",
    description:
      "Invisible to people, filled in by bots. Leave it looking like a real field name.",
  },
  "form.submitLabel": { label: "Send button" },
  "form.submittingLabel": { label: "Send button while sending" },
  "form.submittingAnnouncement": { label: "Spoken while sending" },
  "form.sendAnotherLabel": { label: '"Send another" button' },
  "form.successTitle": { label: "Heading after a message is sent" },
  "form.successBody": {
    label: "Text after a message is sent",
    description:
      "Use {window} for the reply time and {email} for the address, which becomes a link.",
  },
  "form.errorTitle": { label: "Heading when sending fails" },
  "form.errorBody": {
    label: "Text when sending fails",
    description: "Use {email} for the address, which becomes a link.",
  },
  "form.replyPromise": {
    label: "Note under the send button",
    description: "Use {window} for the reply time and {email} for the address.",
  },
  "form.mailtoNote": {
    label: "Note when the form falls back to email",
    description:
      "Shown when no form service is set up and the button opens the visitor's mail app. Use {email}.",
  },
  "form.requiredNote": { label: '"All fields are required" note' },
  "form.errors": { label: "Messages when a field is wrong" },
  "form.errors.name": { label: "Name is empty" },
  "form.errors.organisation": { label: "Organisation is empty" },
  "form.errors.emailMissing": { label: "Email is empty" },
  "form.errors.emailInvalid": { label: "Email is not a valid address" },
  "form.errors.topic": {
    label: "Nothing chosen from the list",
    description: "Use {topic} for the name of the list.",
  },
  "form.errors.message": { label: "Message is empty" },
};

export const homeCopyOverlay: Overlay = {
  ...META_OVERLAY,
  hero: { label: "Hero" },
  "hero.headlineLine1": { label: "Headline, first line" },
  "hero.headlineLine2": {
    label: "Headline, second line",
    description: "This line is shown in orange.",
  },
  "hero.eyebrow": {
    label: "Line above the headline",
    description: "Use {competition}, {year} and {venue}.",
  },
  "hero.specArchitectureLabel": { label: "Stat label: vehicle type" },
  "hero.specTargetMassLabel": { label: "Stat label: target mass" },
  "hero.specHeadcountLabel": { label: "Stat label: team size" },
  ...sectionOverlay("whatIsFs", '"What is Formula Student?" section'),
  "whatIsFs.body": {
    label: "First paragraph",
    description: "Use {competition} and {organiser}.",
  },
  "whatIsFs.judgingBody": { label: "Second paragraph — how it is judged" },
  "whatIsFs.shippingBody": { label: "Third paragraph" },
  "whatIsFs.seasonLine": {
    label: "Highlighted season line",
    description:
      "Use {headcount}, {disciplines}, {architecture} and {targetMass}. All four are counted from the roster and the car settings, so they cannot go out of date.",
  },
  "whatIsFs.videoLinkLabel": { label: "Video link wording" },
  "whatIsFs.officialLinkLabel": { label: "Official site link wording" },
  "whatIsFs.resultsLinkLabel": { label: "Results link wording" },
  "whatIsFs.tbcLabel": { label: "Placeholder for an unknown figure" },
  "whatIsFs.tbcTooltip": { label: "Explanation on hover" },
  countdown: { label: "Countdown section" },
  "countdown.eyebrow": { label: "Small label above the heading" },
  "countdown.note": {
    label: "Line under the heading",
    description: "Use {class} and {organiser}.",
  },
  ...sectionOverlay("progress", "Progress section"),
  "progress.title": {
    label: "Heading",
    description: "Use {year} for the competition year.",
  },
  "progress.allLink": { label: '"Full timeline" link' },
  ...sectionOverlay("news", "News section"),
  "news.allLink": { label: '"All news" link' },
  sponsors: { label: "Sponsors section" },
  "sponsors.eyebrow": { label: "Small label above the heading" },
  "sponsors.titleWithPartners": { label: "Heading once we have partners" },
  "sponsors.titleEmpty": { label: "Heading while we have none" },
  "sponsors.leadWithPartners": { label: "Intro once we have partners" },
  "sponsors.leadEmpty": { label: "Intro while we have none" },
  "sponsors.supportingHeading": { label: "Heading above the smaller logos" },
  "sponsors.entryLine": {
    label: "Entry price line",
    description:
      "Use {amount}. The figure comes from the cheapest cash tier, so it updates itself.",
  },
  "sponsors.entryLineUnknown": { label: "Shown when no tier has a price yet" },
  "sponsors.entryBody": { label: "Paragraph beside the button" },
  "sponsors.partnerSince": { label: '"Partner since" label' },
  "sponsors.logoAlt": {
    label: "Logo description",
    description: "What a screen reader says for a partner logo. Use {name} and {tier}.",
  },
  recruitment: { label: "Recruitment band (the orange one)" },
  "recruitment.eyebrow": { label: "Small label" },
  "recruitment.title": { label: "Heading" },
  "recruitment.body": {
    label: "Paragraph",
    description: "Use {headcount}, {subteams} and {university}.",
  },
  "recruitment.teamLink": { label: '"Meet the team" button' },
};

export const becomeASponsorCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.body": {
    label: "Opening paragraph",
    description:
      "Use {longName}, {university}, {architecture}, {competition}, {year} and {venue}.",
  },
  "header.tiersLink": { label: '"See the tiers" button' },
  "header.contactLink": { label: '"Talk to us" button' },
  process: { label: '"What happens when you get in touch" panel' },
  "process.heading": { label: "Panel heading" },
  "process.steps": {
    label: "Steps",
    itemField: "title",
    description:
      "Numbered automatically. Three works well; more than five is a lot to read.",
  },
  "process.steps.title": { label: "Step" },
  "process.steps.body": { label: "Detail" },
  "process.inKindNote": { label: "Note under the steps" },
  ...sectionOverlay("reasons", '"What a partnership buys" section'),
  "reasons.tbcLabel": { label: "Placeholder for an unset figure" },
  "reasons.tbcTooltip": { label: "Explanation on hover" },
  ...sectionOverlay("tiers", "Tier table section"),
  "tiers.inKindFootnote": { label: "Footnote: how in-kind value is agreed" },
  "tiers.liveryFootnote": { label: "Footnote: logo placement" },
  "tiers.currencyFootnote": {
    label: "Footnote: currency",
    description: "Use {rate} for the exchange rate.",
  },
  ...sectionOverlay("inKind", "In-kind section"),
  "inKind.body": { label: "Paragraph under the intro" },
  "inKind.categories": {
    label: "What we can use",
    itemField: "title",
    description: "The list of things a company could give us instead of money.",
  },
  "inKind.categories.title": { label: "Category" },
  "inKind.categories.body": { label: "Examples" },
  ...sectionOverlay("enquiry", "Enquiry section"),
  "enquiry.prospectusHeading": { label: "Prospectus panel heading" },
  "enquiry.prospectusAvailable": { label: "Text once the PDF is uploaded" },
  "enquiry.prospectusUnavailable": {
    label: "Text while the PDF does not exist",
    description:
      "Shown until the prospectus is uploaded. Switch that on in Site settings once it is.",
  },
  "enquiry.prospectusRequestLabel": { label: '"Request it" button' },
  "enquiry.prospectusRequestSubject": { label: "Subject line of that email" },
  "enquiry.prospectusDownloadLabel": { label: '"Download" button' },
  "enquiry.directHeading": { label: '"Prefer to talk directly?" line' },
  "enquiry.formHeading": { label: "Form heading" },
  "enquiry.formNote": { label: "Note above the form" },
  "enquiry.tierLabel": { label: "Tier dropdown label" },
  "enquiry.tierPlaceholder": { label: "Tier dropdown, nothing chosen" },
  "enquiry.messagePlaceholder": { label: "Grey text inside the message box" },
  "enquiry.formSubject": { label: "Subject line of enquiry emails" },
};

export const sponsorsCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.lead": { label: "Intro paragraph" },
  "header.asideHeading": { label: "Side panel heading" },
  "header.totalLabel": { label: '"Total partners" label' },
  "header.asideNote": {
    label: "Note under the counts",
    description: "Use {year} for the competition year.",
  },
  partners: { label: "Partner logos section" },
  "partners.title": { label: "Section heading" },
  "partners.emptyTitle": { label: "Heading while we have no partners" },
  "partners.emptyBody": {
    label: "Text while we have no partners",
    description:
      "This is the page a prospective sponsor sees today. It is deliberately honest rather than padded with logos.",
  },
  "partners.emptyCta": { label: "Button on the empty state" },
  "partners.inKindNote": { label: "Note above the in-kind partners" },
  "partners.partnerSince": { label: '"Partner since" label' },
  "partners.visitLabel": {
    label: "Link to a partner's site",
    description: "Use {name} for the company name.",
  },
  cta: { label: "Closing panel" },
  "cta.title": { label: "Heading", description: "Use {year}." },
  "cta.body": { label: "Paragraph" },
};

export const teamCopyOverlay: Overlay = {
  ...META_OVERLAY,
  about: { label: "About section" },
  "about.eyebrow": { label: "Small label above the heading" },
  "about.fsBody": {
    label: "What Formula Student is",
    description: "Written for someone who has never heard of it. Use {organiser}.",
  },
  "about.kufsBody": {
    label: "What KUFS is",
    description: "Use {university}, {competition} and {venue}.",
  },
  "about.asideHeading": { label: "Side panel heading" },
  "about.headcountLabel": { label: "Stat: team size" },
  "about.subteamsLabel": { label: "Stat: number of subteams" },
  "about.disciplinesLabel": { label: "Stat: disciplines" },
  "about.competingLabel": { label: "Stat: competition" },
  values: { label: "Values section" },
  "values.title": {
    label: "Heading",
    description: "The four values themselves are in Site settings.",
  },
  ...sectionOverlay("roster", "Roster section"),
  "roster.operationsHeading": { label: "Operations heading" },
  "roster.operationsBody": { label: "Operations description" },
  "roster.engineeringHeading": { label: "Engineering heading" },
  "roster.engineeringBody": { label: "Engineering description" },
  "roster.vacantBadge": { label: "Badge on an unfilled role" },
  "roster.vacantBody": { label: "Text on an unfilled role" },
  "roster.vacantLink": { label: '"Read the role" link' },
  "roster.advisorHeading": { label: "Faculty advisor heading" },
  "roster.joinLink": { label: '"See what joining involves" button' },
  cta: { label: "Closing panel" },
  "cta.title": { label: "Heading" },
  "cta.body": { label: "Paragraph" },
};

export const theCarCopyOverlay: Overlay = {
  ...META_OVERLAY,
  statusLabels: {
    label: "Build status words",
    description: "Which one shows is set by the car's status, not here.",
  },
  "statusLabels.concept": { label: "Concept" },
  "statusLabels.inBuild": { label: "In build" },
  "statusLabels.testing": { label: "Testing" },
  "statusLabels.competing": { label: "Competing" },
  "statusLabels.retired": { label: "Retired" },
  header: { label: "Top of the page" },
  "header.architectureLabel": { label: "Stat: vehicle type" },
  "header.targetMassLabel": { label: "Stat: target mass" },
  "header.buildLink": { label: '"Follow the build" button' },
  "header.posterCaption": {
    label: "Caption under the render",
    description:
      "Says plainly that this is not the real car. Use {firstDrive} for the first-drive date.",
  },
  spec: { label: "Specification section" },
  "spec.eyebrow": { label: "Small label above the heading" },
  "spec.title": { label: "Heading" },
  "spec.lead": {
    label: "Intro paragraph",
    description: "Use {specified}, {total} and {freezeDate}.",
  },
  "spec.tableCaption": {
    label: "Table description (spoken)",
    description: "Read aloud before the table. Use {name} for the car's name.",
  },
  "spec.tbcLabel": { label: "Placeholder for an unmeasured value" },
  "spec.tbcTooltip": { label: "Explanation on hover" },
  ...sectionOverlay("subsystems", "Subsystems section"),
  "subsystems.noImageNote": {
    label: "Text where a photo is missing",
    description: "Use {system} for the subsystem name.",
  },
  ...sectionOverlay("gallery", "Gallery section"),
  "gallery.emptyBody": {
    label: "Text while there are no photos",
    description: "Use {name} for the car's name and {status} for its build status.",
  },
  "gallery.emptyCta": { label: "Button on the empty gallery" },
};

export const progressCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.lead": { label: "Intro paragraph" },
  status: { label: "Side panel" },
  "status.heading": { label: "Panel heading" },
  "status.completeLabel": { label: '"Milestones complete" label' },
  "status.daysToLabel": {
    label: "Countdown label",
    description: "Use {event} for the competition name and year.",
  },
  ...sectionOverlay("timeline", "Timeline section"),
  preliminaryNote: {
    label: '"Dates are preliminary" note',
    description: "Remove this once IMechE publishes the official FSUK 2027 key dates.",
  },
  manufacturing: { label: "Manufacturing window band" },
  "manufacturing.heading": { label: "Band heading" },
  "manufacturing.label": { label: "Date range" },
  "manufacturing.note": { label: "Explanation" },
  updateLabel: { label: '"Update" label on a milestone' },
  noUpdate: { label: "Text where a milestone has no update yet" },
  "noUpdate.done": { label: "Finished, but not written up" },
  "noUpdate.active": { label: "In progress" },
  "noUpdate.upcoming": { label: "Not started" },
  ...sectionOverlay("glossary", "Glossary section"),
  "glossary.terms": {
    label: "Acronyms",
    itemField: "abbr",
    description:
      "Formula Student runs on documents and the milestones are named after them. A reader who does not know what a DCS is cannot read the timeline.",
  },
  "glossary.terms.abbr": { label: "Acronym" },
  "glossary.terms.term": { label: "What it stands for" },
  "glossary.terms.definition": { label: "What it is" },
  cta: { label: "Closing panel" },
  "cta.title": { label: "Heading" },
  "cta.body": { label: "Paragraph" },
};

export const newsCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.lead": { label: "Intro paragraph" },
  aside: { label: "Side panel" },
  "aside.heading": { label: "Panel heading" },
  "aside.postsLabel": { label: '"Posts" label' },
  "aside.subscribeLabel": { label: '"Subscribe" label' },
  "aside.socialLabel": { label: '"Or on social" label' },
  listHeading: {
    label: "List heading (spoken)",
    description: "Not shown on screen; read aloud by screen readers.",
  },
  emptyTitle: { label: "Heading when there are no posts" },
  emptyBody: { label: "Text when there are no posts" },
  draftBadge: { label: "Badge on a draft in the list" },
  rssLabel: { label: "RSS link wording" },
  post: { label: "A single post's page" },
  "post.draftBadge": { label: "Draft badge" },
  "post.draftNote": { label: "Draft explanation" },
  "post.backLink": { label: "Back to the list" },
  "post.olderLink": { label: "Previous post" },
  "post.newerLink": { label: "Next post" },
  "post.ctaTitle": { label: "Closing panel heading" },
  "post.ctaBody": { label: "Closing panel paragraph" },
};

export const newsletterCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.lead": { label: "Intro paragraph" },
  aside: { label: "Side panel" },
  "aside.heading": { label: "Panel heading" },
  "aside.issuesLabel": { label: '"Issues published" label' },
  "aside.subscribeLabel": { label: '"Subscribe" label' },
  "aside.latestLabel": { label: '"Latest issue" label' },
  listHeading: {
    label: "List heading (spoken)",
    description: "Not shown on screen; read aloud by screen readers.",
  },
  issueLabel: {
    label: "How an issue is named",
    description: "Use {issue} for the issue number.",
  },
  contributorsLabel: { label: '"Reporting this month" label' },
  contributorCount: {
    label: "Count of contributing subteams",
    description: "Use {count} and {total}.",
  },
  emptyTitle: { label: "Heading when there are no issues" },
  emptyBody: { label: "Text when there are no issues" },
  emptyCta: { label: "Button when there are no issues" },
  draftBadge: { label: "Badge on a draft in the list" },
  rssLabel: { label: "RSS link wording" },
  issue: { label: "A single issue's page" },
  "issue.draftBadge": { label: "Draft badge" },
  "issue.draftNote": { label: "Draft explanation" },
  "issue.backLink": { label: "Back to the list" },
  "issue.contentsHeading": { label: '"In this issue" heading' },
  "issue.introHeading": {
    label: "Introduction heading (spoken)",
    description: "Not shown on screen; read aloud by screen readers.",
  },
  "issue.olderLink": { label: "Previous issue" },
  "issue.newerLink": { label: "Next issue" },
  "issue.ctaTitle": { label: "Closing panel heading" },
  "issue.ctaBody": { label: "Closing panel paragraph" },
};

export const joinCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.body": {
    label: "Opening paragraph",
    description: "Use {headcount}, {subteams} and {university}.",
  },
  "header.rolesLink": { label: '"See open roles" button' },
  "header.teamLink": { label: '"Meet the team" button' },
  "header.asideHeading": { label: "Side panel heading" },
  "header.headcountLabel": { label: "Stat: team size" },
  "header.subteamsLabel": { label: "Stat: subteams recruiting" },
  "header.vacantLabel": { label: "Stat: vacant leadership roles" },
  "header.experienceLabel": { label: "Stat: experience required" },
  "header.experienceValue": { label: "Stat value: experience required" },
  ...sectionOverlay("gaps", '"The honest gaps" section'),
  "gaps.vacantBadge": { label: "Badge on a vacant leadership role" },
  "gaps.vacantBody": {
    label: "Text on a vacant leadership role",
    description: "Use {role} for the role's name.",
  },
  "gaps.vacantSuited": { label: "Who it suits" },
  "gaps.thinBadge": { label: "Badge on a one-person subteam" },
  "gaps.thinBody": {
    label: "Text on a one-person subteam",
    description: "Use {subteam} for the subteam's name.",
  },
  "gaps.thinSuited": { label: "Who it suits" },
  ...sectionOverlay("audience", '"Who we are looking for" section'),
  "audience.body": { label: "Main paragraph" },
  "audience.staticEventsNote": {
    label: "Note about the static events",
    description: "Use {competition}.",
  },
  ...sectionOverlay("roles", "Open roles section"),
  "roles.onSubteamLabel": { label: '"on this subteam" label' },
  "roles.lookingForLabel": { label: '"What we look for" heading' },
  ...sectionOverlay("season", "Season timeline section"),
  benefits: {
    label: "What members get",
    itemField: "title",
    description: "The four reasons to join, shown beside the section above.",
  },
  "benefits.title": { label: "Reason" },
  "benefits.body": { label: "Detail" },
  ...sectionOverlay("faq", "Questions section"),
  "faq.items": { label: "Questions", itemField: "question" },
  "faq.items.question": { label: "Question" },
  "faq.items.answer": { label: "Answer" },
  apply: { label: "Closing panel" },
  "apply.title": { label: "Heading" },
  "apply.body": { label: "Paragraph" },
  "apply.emailLabel": { label: '"Email us" button' },
  "apply.emailSubject": { label: "Subject line of that email" },
  "apply.sponsorLink": { label: '"I want to sponsor instead" button' },
};

export const pressKitCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.lead": { label: "Intro paragraph" },
  comingSoon: { label: "What is still to come on this page" },
  ...sectionOverlay("lockups", "Logo lockups section"),
  "lockups.captions": {
    label: "Captions",
    description: "One per logo, in the order they appear on the page.",
  },
  "lockups.clearSpaceNote": { label: "How to use the logo" },
};

export const contactCopyOverlay: Overlay = {
  ...META_OVERLAY,
  header: { label: "Top of the page" },
  "header.eyebrow": { label: "Small label above the heading" },
  "header.title": { label: "Main heading" },
  "header.lead": { label: "Intro paragraph" },
  ...sectionOverlay("routes", '"Who answers what" section'),
  "routes.answeredLabel": { label: '"Typically answered" label' },
  "routes.items": { label: "Enquiry types", itemField: "label" },
  "routes.items.key": {
    label: "Which inbox",
    description:
      "Fixed. This decides which address the enquiry goes to — changing it would send press enquiries to the sponsorship inbox.",
  },
  "routes.items.label": { label: "Heading" },
  "routes.items.blurb": { label: "Description" },
  "routes.items.responseTime": {
    label: "How quickly we reply",
    description: 'Written as a phrase, e.g. "within two working days".',
  },
  ...sectionOverlay("form", "Message form section"),
  "form.heading": { label: "Form heading" },
  "form.note": { label: "Note above the form" },
  "form.messagePlaceholder": { label: "Grey text inside the message box" },
  "form.topicLabel": { label: "Enquiry type dropdown label" },
  "form.topicPlaceholder": { label: "Dropdown, nothing chosen" },
  "form.subject": { label: "Subject line of these emails" },
  location: { label: '"Where to find us" panel' },
  "location.heading": { label: "Panel heading" },
  "location.teamLabel": { label: '"The team" label' },
  "location.basedAtLabel": { label: '"Based at" label' },
  "location.city": { label: "City and country" },
  "location.generalLabel": { label: '"General enquiries" label' },
  "location.followLabel": { label: '"Follow the build" label' },
  responseTime: {
    label: "Reply time shown on the form",
    description: 'Written as a phrase, e.g. "within two working days".',
  },
  sponsorNote: { label: '"Sponsorship enquiries" panel' },
  "sponsorNote.title": { label: "Heading" },
  "sponsorNote.bodyBefore": { label: "Text before the link" },
  "sponsorNote.linkLabel": { label: "Link wording" },
  "sponsorNote.bodyAfter": { label: "Text after the link" },
};

export const notFoundCopyOverlay: Overlay = {
  ...META_OVERLAY,
  title: { label: "Heading" },
  body: { label: "Paragraph" },
  homeLink: { label: '"Back to the home page" button' },
  contactLink: { label: '"Contact us" button' },
};
