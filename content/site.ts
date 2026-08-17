import { parseOrThrow, siteSchema, type SiteConfig } from "@/lib/schemas";

/**
 * Sitewide configuration. Editable by anyone on the team; validated at build
 * time by siteSchema, so a typo here fails `pnpm build` rather than shipping.
 *
 * TODO(brand): `name`, `longName` and `university` are placeholders — I
 * expanded the "KUFS" acronym as a guess. Replace with the registered team
 * and university names before this goes anywhere near a sponsor.
 */
const site: SiteConfig = parseOrThrow(
  siteSchema,
  {
    name: "KUFS",
    longName: "Kingsbury University Formula Student",
    university: "Kingsbury University",

    tagline: "Designed, built and driven by students. Every part, every season.",
    positioning:
      "We are a student engineering team that designs, manufactures and races a " +
      "single-seat race car against the best universities in the world — and we " +
      "graduate engineers who have already shipped hardware under a deadline.",
    description:
      "Kingsbury University Formula Student designs, builds and races a student-engineered single-seater at Formula Student UK, Silverstone.",

    // TODO(deploy): point at the real domain before launch. Drives canonical
    // URLs, the sitemap, robots.txt and every Open Graph tag.
    url: "https://kufs.example.ac.uk",

    contactEmail: "hello@kufs.example.ac.uk",
    sponsorshipEmail: "partnerships@kufs.example.ac.uk",

    socials: [
      {
        label: "Instagram",
        href: "https://instagram.com/kufsracing",
        handle: "@kufsracing",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/kufs-racing",
        handle: "KUFS Racing",
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@kufsracing",
        handle: "@kufsracing",
      },
    ],

    competition: {
      name: "Formula Student UK",
      class: "FS Class",
      organiser: "Institution of Mechanical Engineers (IMechE)",
      venue: "Silverstone Circuit",
      year: 2027,
      // TODO(dates): PLACEHOLDER. The 2027 event dates are not published yet.
      // Confirm against the IMechE Formula Student key dates page
      // (https://www.imeche.org/events/formula-student) and update this single
      // value — the whole countdown and every "Silverstone 2027" label derive
      // from it. Keep the +01:00 (BST) offset; the event runs in British summer.
      startsAt: "2027-07-14T08:00:00+01:00",
    },

    stats: [
      {
        value: "100+",
        label: "University teams",
        detail: "compete at Silverstone each July, from more than 30 countries.",
      },
      {
        value: "8",
        label: "Scored disciplines",
        detail:
          "Static events judge design, cost and business case. Dynamic events judge the car.",
      },
      {
        value: "P24",
        label: "Our best finish",
        detail: "Overall, Formula Student UK 2025 — up 31 places on our 2024 result.",
      },
    ],

    hero: {
      // "sequence" is the production hero. Switch to "model" locally to preview
      // a live three.js car before real renders exist; the three.js bundle is
      // lazy-loaded, so it never reaches the production payload either way.
      mode: "sequence",
      frameCount: 90,
      poster: {
        src: "/hero/poster.webp",
        width: 1600,
        height: 900,
        alt: "The KUFS single-seat race car in three-quarter view against a dark studio background.",
      },
      // null => the procedural low-poly car in src/lib/placeholderCar.ts.
      // Set to "/models/placeholder-car.glb" (or the real CAD export) to use a
      // GLB instead, then re-run `pnpm render:frames`.
      modelPath: null,
    },
  },
  "content/site.ts",
);

export default site;
