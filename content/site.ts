import { parseOrThrow, siteSchema, type SiteConfig } from "@/lib/schemas";

/**
 * Sitewide configuration. Editable by anyone on the team; validated at build
 * time by siteSchema, so a typo here fails `pnpm build` rather than shipping.
 *
 * The identity, tagline, positioning line, values and straplines below are
 * taken verbatim from the official KUFS brand sheet. Do not reword them.
 */
const site: SiteConfig = parseOrThrow(
  siteSchema,
  {
    name: "KUFS",
    longName: "Khalifa University Formula Student",
    university: "Khalifa University",

    tagline: "ENGINEERED TO RACE. DRIVEN TO LEAD.",
    positioning:
      "KUFS is the official Formula Student team of Khalifa University. We design, " +
      "build, and compete with passion, precision, and purpose.",
    description:
      "KUFS is the official Formula Student team of Khalifa University, Abu Dhabi. We are building the university's first electric Formula Student car for Formula Student UK 2027 at Silverstone.",

    // LOCAL DEVELOPMENT FALLBACK ONLY. The live canonical origin comes from
    // NEXT_PUBLIC_SITE_URL, falling back to this deployment's own VERCEL_URL
    // on previews — see src/lib/env.ts. Change it there, not here.
    url: "https://kufs.ku.ac.ae",

    // TODO(contact): confirm these are the addresses the team actually monitors.
    contactEmail: "kufs@ku.ac.ae",
    sponsorshipEmail: "partnerships.kufs@ku.ac.ae",

    // TODO(social): confirm handles before launch — these are the expected
    // formats, not verified accounts.
    socials: [
      {
        label: "Instagram",
        href: "https://instagram.com/kufsracing",
        handle: "@kufsracing",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/khalifa-university-formula-student",
        handle: "Khalifa University Formula Student",
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
      // PLACEHOLDER DATE. The official FSUK 2027 key dates have not been
      // published. Per the team's project timeline, IMechE is expected to
      // release them in EARLY OCTOBER 2026 — check the key dates page then and
      // replace this single value. The countdown and every "Silverstone 2027"
      // label derive from it. Keep the +01:00 (BST) offset; the event runs in
      // British summer.
      startsAt: "2027-07-14T08:00:00+01:00",
    },

    // Verbatim from the brand sheet.
    values: [
      {
        title: "ENGINEERED",
        description: "We apply knowledge and creativity to solve real-world challenges.",
      },
      { title: "DRIVEN", description: "We push limits, on and off the track." },
      {
        title: "UNITED",
        description: "We are a team of diverse talents working as one.",
      },
      {
        title: "COMPETITIVE",
        description: "We strive for excellence in every competition.",
      },
    ],

    // Verbatim from the brand sheet. Used as section straplines; do not invent
    // new ones — the brand sheet defines the full set.
    straplines: [
      "From classroom concepts to circuit performance.",
      "Representing Khalifa University on the Formula Student stage.",
      "Innovate. Engineer. Compete.",
    ],

    // NOTE: headcount, disciplines and subteam count are NOT here. They are
    // computed from content/team.json by getTeamStats() so they cannot drift
    // from the roster. These three are about the competition itself.
    //
    // There is deliberately no "best finish" stat. KUFS has not competed yet.
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
        // Genuinely unknown: IMechE has not published FSUK 2027 attendance,
        // and quoting another year's figure to a sponsor would be inventing it.
        value: null,
        label: "Spectators and industry visitors",
        detail:
          "at Formula Student UK. Awaiting the published figure for the 2027 event.",
      },
    ],

    programme: {
      foundedYear: 2026,
      firstCompetitionYear: 2027,
      seasonOneLine:
        "Season one. We are building Khalifa University's first Formula Student car, for Silverstone 2027.",
    },

    vehicle: {
      // From the team's first-year benchmarking report. These are the working
      // baseline and targets — the architecture is selected on 30 September
      // 2026 and frozen on 30 October 2026. Say "target", never "is".
      architecture: "Single-motor rear-wheel-drive electric",
      targetMass: "230–250 kg",
      architectureDownselect: "2026-09-30",
      conceptFreeze: "2026-10-30",
      note:
        "Our benchmarking work sets a single-motor rear-wheel-drive electric baseline " +
        "with a 230–250 kg target mass. The architecture is selected at the end of " +
        "September and frozen at the end of October — until then these are targets, " +
        "not decisions.",
    },

    links: {
      whatIsFormulaStudentVideo: "https://www.youtube.com/watch?v=CjQifWW9r5w",
      officialFsuk: "https://www.imeche.org/events/formula-student",
      fsukKeyDates:
        "https://www.imeche.org/events/formula-student/team-information/key-dates",
      fsukRulebook:
        "https://www.imeche.org/docs/default-source/1-oscar/formula-student/2026/rules/fsuk-2026-rules---v1-09e21118e54216d0c8310ff0100d05193.pdf?sfvrsn=2",
      fsResults: "https://fsstats.co.uk/Home/Results",
      firstYearTeamArticles:
        "https://www.designjudges.com/articles?category=First%20Year%20Teams",
    },

    // The dirham is pegged to the dollar, so this does not move — but it is
    // still shown as an approximation and is never fetched live.
    aedToUsd: 0.2723,

    sponsorship: {
      prospectusPath: "/downloads/kufs-sponsorship-prospectus.pdf",
      // The PDF has not been supplied. Flip to true the moment it is committed
      // at the path above; the button changes from "request it" to "download".
      prospectusAvailable: false,
      enquiryEmail: "partnerships.kufs@ku.ac.ae",
      // `stat.value: null` renders as TBC. Headcount and discipline count are
      // NOT hardcoded here — they are computed from content/team.json and
      // injected by the page, so they cannot drift from the roster.
      reasons: [
        {
          title: "Founding partner of a programme, not a logo on a mature car",
          body:
            "There is exactly one season in which a company can be part of the first " +
            "car Khalifa University has ever built. Your name goes on that car, in our " +
            "first Competition Design Report, and into the team's history from the " +
            "beginning.",
          stat: { value: "1", label: "First season — this one", computed: null },
        },
        {
          title: "Direct access to Khalifa University engineering talent",
          body:
            "Tier 1 partners get access to KU's top engineering students for " +
            "internships and recruitment. These are students who will have specified, " +
            "manufactured and defended real hardware against a competition deadline.",
          stat: { value: null, label: "Students on the team", computed: "headcount" },
        },
        {
          title: "An electric vehicle programme in a region investing in exactly that",
          body:
            "Khalifa University sits at the centre of the UAE's advanced-mobility and " +
            "clean-energy work. This is an electric car: if you supply cells, " +
            "inverters, motors, composites or machining, your product goes on it and " +
            "gets tested in public.",
          stat: {
            value: null,
            label: "Engineering disciplines represented",
            computed: "disciplines",
          },
        },
        {
          title: "Reporting you can put in front of your own board",
          body:
            "We report back at the end of the season: where your logo appeared, what it " +
            "was fitted to, click-throughs from this site, and what the car achieved. " +
            "A first-year team has more to prove, not less.",
          stat: {
            value: "1",
            label: "Written season report, every year",
            computed: null,
          },
        },
      ],
    },

    facultyAdvisor: {
      name: "Dr. Bashar Khasawneh",
      role: "Faculty Advisor",
    },

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
