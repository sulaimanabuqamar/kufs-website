import { z } from "zod";

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

export const SPONSOR_TIERS = ["title", "gold", "silver", "bronze", "inkind"] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number];

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
  /** Headline stats for the "What is Formula Student" explainer. */
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .length(3),
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

export const sponsorsSchema = z.array(sponsorSchema).min(1);
export type Sponsor = z.infer<typeof sponsorSchema>;

/* -------------------------------------------------------------------------
   team.json
   ------------------------------------------------------------------------- */

export const SUBTEAMS = [
  "Management",
  "Chassis",
  "Powertrain",
  "Aerodynamics",
  "Vehicle Dynamics",
  "Electronics",
  "Business",
] as const;
export type Subteam = (typeof SUBTEAMS)[number];

export const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  subteam: z.enum(SUBTEAMS),
  photo: imageRef,
  linkedin: z.string().url().optional(),
  /** Year of study. "Alumni" is allowed for retained technical advisors. */
  year: z.union([z.number().int().min(1).max(8), z.literal("Alumni"), z.literal("PhD")]),
});

export const teamSchema = z.array(teamMemberSchema).min(1);
export type TeamMember = z.infer<typeof teamMemberSchema>;

/* -------------------------------------------------------------------------
   milestones.json
   ------------------------------------------------------------------------- */

export const MILESTONE_STATUSES = ["done", "active", "upcoming"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const milestoneSchema = z.object({
  title: z.string().min(1),
  date: isoDate,
  status: z.enum(MILESTONE_STATUSES),
  description: z.string().min(1),
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
