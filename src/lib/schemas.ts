import { z } from "zod";

import { SPONSOR_TIERS } from "@/lib/tiers";

/**
 * Schemas for everything under /content.
 *
 * These are the contract between whoever edits the content files (a team
 * member, not necessarily a developer) and the components that render them.
 * They are evaluated at build time and throw on the first invalid record, so
 * a malformed sponsor entry fails `pnpm build` loudly rather than shipping a
 * broken sponsor strip to a paying sponsor.
 */

/* -------------------------------------------------------------------------
   Shared primitives
   ------------------------------------------------------------------------- */

/** A path under /public, e.g. "/sponsors/apex-composites.webp". */
const publicPath = z
  .string()
  .regex(
    /^\/[^\s]*$/,
    "must be a root-relative path under /public, e.g. /sponsors/x.webp",
  );

/** An ISO calendar date, e.g. "2026-03-14". */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)")
  .refine((v) => !Number.isNaN(Date.parse(v)), "must be a real calendar date");

/** Image dimensions are mandatory: every image on this site goes through
 *  next/image with explicit width/height so nothing shifts during load. */
const imageRef = z.object({
  src: publicPath,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z
    .string()
    .min(1, "alt text is required — describe the image, do not repeat the name"),
});

export type ImageRef = z.infer<typeof imageRef>;

/* -------------------------------------------------------------------------
   site.ts
   ------------------------------------------------------------------------- */

// Re-exported from a zod-free module so client components can use them
// without pulling this file — and Zod — across the boundary.
export { SPONSOR_TIERS, type SponsorTier } from "@/lib/tiers";

/** Which hero implementation renders. See src/components/hero/ScrollCarHero.tsx.
 *  - "sequence": production. Scroll-driven pre-rendered WebP frames on canvas.
 *  - "model":    dev/preview only. Live three.js GLB, lazy-loaded. */
export const HERO_MODES = ["sequence", "model"] as const;
export type HeroMode = (typeof HERO_MODES)[number];

export const siteSchema = z.object({
  /** Short wordmark used in the header and footer. */
  name: z.string().min(1),
  /** Full legal/registered name, used in metadata and the press kit. */
  longName: z.string().min(1),
  university: z.string().min(1),
  /** One line, under ~90 chars. Appears under the hero headline. */
  tagline: z.string().min(1).max(120),
  /** The positioning statement — what we do and why a sponsor should care. */
  positioning: z.string().min(1),
  description: z.string().min(1).max(200),
  /** Canonical origin, no trailing slash. Drives sitemap, OG and robots. */
  url: z
    .string()
    .url()
    .refine((v) => !v.endsWith("/"), "no trailing slash"),
  contactEmail: z.string().email(),
  sponsorshipEmail: z.string().email(),
  socials: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().url(),
        handle: z.string().min(1),
      }),
    )
    .min(1),
  competition: z.object({
    name: z.string().min(1),
    /** e.g. "FS Class" — the class we enter. */
    class: z.string().min(1),
    organiser: z.string().min(1),
    venue: z.string().min(1),
    year: z.number().int().min(2024).max(2100),
    /** ISO 8601 WITH offset. Parsed once, on the server, into an epoch ms so
     *  the countdown never depends on the visitor's locale or DST rules. */
    startsAt: z.string().datetime({ offset: true }),
  }),
  /**
   * Headline stats for the "What is Formula Student" explainer.
   *
   * `value: null` renders as TBC. There is deliberately no "best finish" stat:
   * KUFS has never competed, and a TBC there would invite the reader to assume
   * a result exists that simply has not been typed in.
   */
  stats: z
    .array(
      z.object({
        value: z.string().min(1).nullable(),
        label: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .length(3),

  /** The programme's stage. Drives the first-year framing across the site. */
  programme: z.object({
    /** The season this team was founded. */
    foundedYear: z.number().int().min(2020).max(2100),
    /** First competition entry. Null if not yet entered anything. */
    firstCompetitionYear: z.number().int().min(2024).max(2100),
    /** One line establishing that this is season one, said with confidence. */
    seasonOneLine: z.string().min(1),
  }),

  /**
   * The vehicle programme.
   *
   * IMPORTANT: these are the team's TARGETS and working baseline, taken from
   * the first-year benchmarking report — not decided specifications. The
   * architecture is down-selected on 30 September 2026 and frozen on 30
   * October 2026. The site must say "target" and "baseline", never "is".
   */
  vehicle: z.object({
    /** e.g. "Single-motor rear-wheel-drive electric". */
    architecture: z.string().min(1),
    /** e.g. "230–250 kg". */
    targetMass: z.string().min(1),
    /** ISO date the architecture is selected. */
    architectureDownselect: isoDate,
    /** ISO date the concept is frozen. */
    conceptFreeze: isoDate,
    /** Short note on what is and is not yet decided. */
    note: z.string().min(1),
  }),

  /** Public reference links, from the team's own resource list. */
  links: z.object({
    whatIsFormulaStudentVideo: z.string().url(),
    officialFsuk: z.string().url(),
    fsukKeyDates: z.string().url(),
    fsukRulebook: z.string().url(),
    fsResults: z.string().url(),
    firstYearTeamArticles: z.string().url(),
  }),

  /**
   * Indicative AED to USD rate for the sponsorship page.
   * The dirham is pegged, so this does not move — but it is still displayed as
   * an approximation, and it is not fetched live.
   */
  aedToUsd: z.number().positive(),
  /** The four brand values. Verbatim from the brand sheet — do not reword. */
  values: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .length(4),

  /** Supporting straplines from the brand sheet, used across sections. */
  straplines: z.array(z.string().min(1)).min(3),

  sponsorship: z.object({
    /** Path under /public. May not exist yet — the UI handles that. */
    prospectusPath: publicPath,
    /** Set false until the PDF is actually committed; the button then
     *  explains itself instead of serving a 404. */
    prospectusAvailable: z.boolean(),
    /** Where sponsorship enquiries go until a real form endpoint exists. */
    enquiryEmail: z.string().email(),
    /** Reasons to sponsor, each with an optional supporting figure.
     *  `value: null` renders as "TBC" rather than an invented statistic. */
    reasons: z
      .array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          stat: z.object({
            /** A literal value, or null to render TBC. Ignored if `computed`
             *  is set — those come from the roster so they cannot drift. */
            value: z.string().min(1).nullable(),
            label: z.string().min(1),
            computed: z.enum(["headcount", "disciplines"]).nullable().default(null),
          }),
        }),
      )
      .min(3),
  }),

  facultyAdvisor: z
    .object({
      name: z.string().min(1),
      role: z.string().min(1),
    })
    .nullable(),

  hero: z.object({
    mode: z.enum(HERO_MODES),
    /** Number of frames in /public/hero/frames. Must match what
     *  `pnpm render:frames` produced, or the loader will 404. */
    frameCount: z.number().int().min(2).max(600),
    /** Static image shown on mobile, under reduced-motion, and as the
     *  canvas poster before frame 1 decodes. */
    poster: imageRef,
    /** Path to the GLB used by mode "model" and by the frame renderer.
     *  null => use the procedural placeholder car. */
    modelPath: publicPath.nullable(),
  }),
});

export type SiteConfig = z.infer<typeof siteSchema>;

/* -------------------------------------------------------------------------
   sponsors.json
   ------------------------------------------------------------------------- */

export const sponsorSchema = z.object({
  name: z.string().min(1),
  tier: z.enum(SPONSOR_TIERS),
  logo: imageRef,
  url: z.string().url(),
  /** Optional one-paragraph description shown on /sponsors. */
  blurb: z.string().min(1).optional(),
  /** Optional — what they actually give us. Useful for in-kind partners. */
  contribution: z.string().min(1).optional(),
  since: z.number().int().min(2000).max(2100).optional(),
});

/**
 * May be EMPTY. KUFS has no confirmed partners yet, and an empty sponsor list
 * is the honest state for a first-year team — every surface that renders
 * sponsors handles it with a "be the first" state rather than a blank space.
 * The invented example partners that used to live here were removed: a real
 * prospect must never see a fictional logo next to a real ask.
 */
export const sponsorsSchema = z.array(sponsorSchema);
export type Sponsor = z.infer<typeof sponsorSchema>;

/* -------------------------------------------------------------------------
   team.json
   ------------------------------------------------------------------------- */

/**
 * The two divisions the team is organised into.
 *
 * People can sit in both — the CTO Mechanical also leads Chassis, and two of
 * the marketing group also work on sponsorship — so a member carries a list of
 * roles rather than a single subteam. One person, one card, several roles.
 */
export const DIVISIONS = ["Operations", "Engineering"] as const;
export type Division = (typeof DIVISIONS)[number];

/**
 * Operations roles, in display order.
 *
 * This is the canonical list, which means a role with nobody in it IS a
 * vacancy — /team renders it as one and /join recruits for it, both computed
 * rather than maintained by hand. CTO Electrical is currently empty.
 */
export const OPERATIONS_ROLES = [
  "President",
  "Vice President",
  "Secretary",
  "CTO Mechanical",
  "CTO Electrical",
  "Marketing / Media / Outreach",
  "Sponsorship & Finance",
] as const;
export type OperationsRole = (typeof OPERATIONS_ROLES)[number];

/** The eight engineering subteams, in display order. */
export const ENGINEERING_SUBTEAMS = [
  "Aerodynamics",
  "Chassis & Driver Ergonomics",
  "Steering",
  "Suspension",
  "Throttle & Braking Systems",
  "Powertrain & Drivetrain",
  "High Voltage",
  "Low Voltage & Controls",
] as const;
export type EngineeringSubteam = (typeof ENGINEERING_SUBTEAMS)[number];

/** Year of study, as the university records it. */
export const STUDY_YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
] as const;

/**
 * PRIVACY: the permitted per-person fields are name, role, subteam, year of
 * study and major — and nothing else. The team's internal roster also holds
 * student ID numbers and personal mobile numbers. Those must never enter this
 * repository, in any file, in any form, including comments. There is
 * deliberately no field here that could hold one.
 */
export const teamMemberSchema = z.object({
  name: z.string().min(1),
  year: z.enum(STUDY_YEARS),
  major: z.string().min(1),
  /** Every role this person holds, across both divisions. */
  roles: z
    .array(
      z.union([
        z.object({
          division: z.literal("Operations"),
          title: z.enum(OPERATIONS_ROLES),
        }),
        z.object({
          division: z.literal("Engineering"),
          title: z.enum(ENGINEERING_SUBTEAMS),
        }),
      ]),
    )
    .min(1),
  /** null until a headshot exists. The card falls back to initials on navy. */
  photo: imageRef.nullable().default(null),
  linkedin: z.string().url().optional(),
});

export const teamSchema = z
  .array(teamMemberSchema)
  .min(1)
  .refine(
    (list) => new Set(list.map((m) => m.name)).size === list.length,
    "each person appears once; give them multiple roles rather than two entries",
  );

export type TeamMember = z.infer<typeof teamMemberSchema>;

/* -------------------------------------------------------------------------
   milestones.json
   ------------------------------------------------------------------------- */

/** Season phases, in order. Drives the grouping on /progress. */
export const MILESTONE_PHASES = [
  "Design",
  "Manufacture",
  "Assembly",
  "Testing",
  "Competition",
] as const;

export type MilestonePhase = (typeof MILESTONE_PHASES)[number];

export const MILESTONE_STATUSES = ["done", "active", "upcoming"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const milestoneSchema = z.object({
  title: z.string().min(1),
  date: isoDate,
  status: z.enum(MILESTONE_STATUSES),
  description: z.string().min(1),
  /** Which phase of the season this belongs to. Groups /progress. */
  phase: z.enum(MILESTONE_PHASES),
  /** What actually happened, written after the fact. null = not started, and
   *  the page says so rather than inventing an entry. */
  update: z.string().min(1).nullable().optional().default(null),
  /** Photo from the workshop or the track. null until one exists. */
  photo: imageRef.nullable().optional().default(null),
});

export const milestonesSchema = z
  .array(milestoneSchema)
  .min(1)
  .refine(
    (list) => list.filter((m) => m.status === "active").length <= 1,
    "at most one milestone may be 'active' — it is the single 'you are here' marker",
  );

export type Milestone = z.infer<typeof milestoneSchema>;

/* -------------------------------------------------------------------------
   tiers.json — the sponsorship package
   ------------------------------------------------------------------------- */

/**
 * The benefit rows in the tier comparison table, in display order.
 *
 * Fixed keys rather than free-form rows so every tier is compared on exactly
 * the same seven things. A sponsor deciding between Gold and Silver should be
 * able to read across a row, not hunt for whether a benefit was simply omitted.
 */
export const BENEFIT_ROWS = [
  { key: "livery", label: "Logo on the car" },
  { key: "kit", label: "Logo on teamwear" },
  { key: "website", label: "Logo on this site and materials" },
  { key: "social", label: "Social media" },
  { key: "designReport", label: "Competition Design Report" },
  { key: "recruitment", label: "Recruitment access" },
  { key: "recognition", label: "Recognition at events" },
  { key: "labVisit", label: "KUFS lab visit" },
] as const;

export type BenefitKey = (typeof BENEFIT_ROWS)[number]["key"];

const benefitValue = z.union([
  z.string().min(1),
  /** false = not included in this tier. Renders as an em dash, not a blank. */
  z.literal(false),
]);

export const tierSchema = z.object({
  tier: z.enum(SPONSOR_TIERS),
  name: z.string().min(1),
  /** Headline price. null until the team sets it — renders as "TBC". */
  amount: z.string().min(1).nullable(),
  /** One line on what this tier is for. */
  summary: z.string().min(1),
  /** How many partners we will take at this level. null = unlimited. */
  slots: z.number().int().positive().nullable(),
  benefits: z.object({
    livery: benefitValue,
    kit: benefitValue,
    website: benefitValue,
    social: benefitValue,
    designReport: benefitValue,
    recruitment: benefitValue,
    recognition: benefitValue,
    labVisit: benefitValue,
  }),
});

export const tiersSchema = z
  .array(tierSchema)
  .min(1)
  .refine(
    (list) => new Set(list.map((t) => t.tier)).size === list.length,
    "each tier may appear only once",
  );

export type SponsorshipTier = z.infer<typeof tierSchema>;

/* -------------------------------------------------------------------------
   roles.json — open recruitment positions
   ------------------------------------------------------------------------- */

export const roleSchema = z.object({
  title: z.string().min(1),
  subteam: z.enum(ENGINEERING_SUBTEAMS),
  description: z.string().min(1),
  /** What we actually want to see. Kept honest — no "rockstar" language. */
  lookingFor: z.array(z.string().min(1)).min(1),
  /** null = we will take as many good applicants as apply. */
  openings: z.number().int().positive().nullable(),
});

export const rolesSchema = z.array(roleSchema).min(1);
export type Role = z.infer<typeof roleSchema>;

/* -------------------------------------------------------------------------
   cars/<year>.json — the season's car
   ------------------------------------------------------------------------- */

/**
 * Spec rows, in display order.
 *
 * A fixed list rather than free-form keys so the table is comparable between
 * seasons: 2028's car sits beside 2027's and every row lines up. Anything the
 * team has not measured yet is `null` and renders as TBC — an invented figure
 * on a page engineers will read is worse than an admitted gap.
 */
export const SPEC_ROWS = [
  { key: "mass", label: "Mass", unit: "kg" },
  { key: "wheelbase", label: "Wheelbase", unit: "mm" },
  { key: "trackFront", label: "Front track", unit: "mm" },
  { key: "trackRear", label: "Rear track", unit: "mm" },
  { key: "power", label: "Power", unit: "" },
  { key: "drivetrain", label: "Drivetrain", unit: "" },
  { key: "chassis", label: "Chassis construction", unit: "" },
  { key: "laminate", label: "Laminate schedule", unit: "" },
  { key: "suspension", label: "Suspension", unit: "" },
  { key: "tyres", label: "Tyres", unit: "" },
  { key: "downforce", label: "Downforce", unit: "" },
  { key: "brakes", label: "Brakes", unit: "" },
  { key: "electronics", label: "Electronics", unit: "" },
] as const;

export type SpecKey = (typeof SPEC_ROWS)[number]["key"];

/** null renders as TBC. Never fill one of these in with an estimate. */
const specValue = z.string().min(1).nullable();

export const CAR_SUBSYSTEMS = [
  "Aerodynamics",
  "Chassis",
  "Powertrain",
  "Electronics",
  "Suspension",
] as const;

export const carSchema = z.object({
  /** The competition year this car was built for. */
  year: z.number().int().min(2024).max(2100),
  /** The car's name or designation, e.g. "KU-01". */
  name: z.string().min(1),
  /** One line: what this car is and what changed from last season. */
  positioning: z.string().min(1),
  status: z.enum(["concept", "in-build", "testing", "competing", "retired"]),
  spec: z.object({
    mass: specValue,
    wheelbase: specValue,
    trackFront: specValue,
    trackRear: specValue,
    power: specValue,
    drivetrain: specValue,
    chassis: specValue,
    laminate: specValue,
    suspension: specValue,
    tyres: specValue,
    downforce: specValue,
    brakes: specValue,
    electronics: specValue,
  }),
  subsystems: z
    .array(
      z.object({
        name: z.enum(CAR_SUBSYSTEMS),
        headline: z.string().min(1),
        body: z.string().min(1),
        /** Photo or CAD render. null until one exists. */
        image: imageRef.nullable(),
      }),
    )
    .min(1),
  /** May be empty — the page renders an honest empty state. */
  gallery: z.array(imageRef),
});

export type Car = z.infer<typeof carSchema>;

/* -------------------------------------------------------------------------
   news/*.mdx frontmatter
   ------------------------------------------------------------------------- */

export const newsFrontmatterSchema = z.object({
  title: z.string().min(1),
  /** gray-matter turns an unquoted YAML date into a Date; accept both. */
  date: z.union([isoDate, z.date().transform((d) => d.toISOString().slice(0, 10))]),
  author: z.string().min(1),
  excerpt: z.string().min(1).max(280),
  cover: imageRef,
  draft: z.boolean().optional().default(false),
});

export type NewsFrontmatter = z.infer<typeof newsFrontmatterSchema>;

export type NewsPost = NewsFrontmatter & {
  slug: string;
  /** Raw MDX body. Compiled when /news/[slug] is built (a later milestone). */
  body: string;
};

/* -------------------------------------------------------------------------
   Error reporting
   ------------------------------------------------------------------------- */

/**
 * Parse `data` or throw an error that names the file and the exact field.
 * A Zod stack trace in a Vercel build log is useless to the student editing
 * team.json at 2am; this is not.
 */
export function parseOrThrow<T extends z.ZodType>(
  schema: T,
  data: unknown,
  source: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const issues = result.error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      return `  • ${path}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(
    `\n\nInvalid content in ${source}\n${issues}\n\n` +
      `Fix the file above, then re-run. Schemas live in src/lib/schemas.ts.\n`,
  );
}
