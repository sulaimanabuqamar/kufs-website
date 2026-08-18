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
      "KUFS is the official Formula Student team of Khalifa University, Abu Dhabi. We design, build and race a student-engineered single-seater at Formula Student UK, Silverstone.",

    // TODO(deploy): point at the real domain before launch. Drives canonical
    // URLs, the sitemap, robots.txt and every Open Graph tag.
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
      // TODO(dates): PLACEHOLDER. The 2027 event dates are not published yet.
      // Confirm against the IMechE Formula Student key dates page
      // (https://www.imeche.org/events/formula-student) and update this single
      // value — the whole countdown and every "Silverstone 2027" label derive
      // from it. Keep the +01:00 (BST) offset; the event runs in British summer.
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
        // TODO: confirm with team — this is KUFS's actual best FSUK result and
        // must not be published until someone confirms the placing and year.
        value: "TBC",
        label: "Our best finish",
        detail: "Overall at Formula Student UK. Awaiting confirmation from the team.",
      },
    ],

    sponsorship: {
      prospectusPath: "/downloads/kufs-sponsorship-prospectus.pdf",
      // The PDF has not been supplied. Flip to true the moment it is committed
      // at the path above; the button changes from "request it" to "download".
      prospectusAvailable: false,
      enquiryEmail: "partnerships.kufs@ku.ac.ae",
      reasons: [
        {
          title: "Engineering visibility, not just a logo",
          body:
            "Your mark travels on a car that is photographed, filmed and scrutineered in " +
            "front of the largest gathering of student engineers in Europe — and on the " +
            "kit worn by the students who built it.",
          // TODO: confirm with team — FSUK publishes attendance figures, but we
          // should cite the number for the year we are actually attending.
          stat: { value: null, label: "Spectators and industry visitors at FSUK" },
        },
        {
          title: "A recruitment pipeline that has already been tested",
          body:
            "Formula Student students arrive in industry having shipped hardware against " +
            "a fixed deadline and defended their design to practising engineers. Partners " +
            "get early access to that cohort.",
          // TODO: confirm with team — headcount for the current season.
          stat: { value: null, label: "Students on the team this season" },
        },
        {
          title: "Reach into a region investing heavily in mobility",
          body:
            "Khalifa University sits at the centre of the UAE's advanced-mobility and " +
            "clean-energy programmes. Backing KUFS puts your name in front of that " +
            "audience, in Abu Dhabi and at Silverstone.",
          // TODO: confirm with team — count of disciplines actually represented.
          stat: { value: null, label: "Engineering disciplines represented" },
        },
        {
          title: "Reporting you can put in front of your own board",
          body:
            "We report back at the end of every season: where your logo appeared, what it " +
            "was fitted to, click-throughs from this site, and what the car achieved.",
          stat: { value: "1", label: "Written season report, every year" },
        },
      ],
    },

    // TODO(team): confirm the faculty advisor's name and department, or set
    // this to null to hide the section entirely.
    facultyAdvisor: null,

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
