import "server-only";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

import site from "@/content/site";
import {
  carSchema,
  milestonesSchema,
  MILESTONE_PHASES,
  rolesSchema,
  tiersSchema,
  newsFrontmatterSchema,
  parseOrThrow,
  sponsorsSchema,
  teamSchema,
  type Milestone,
  type NewsPost,
  type Sponsor,
  type SponsorTier,
  ENGINEERING_SUBTEAMS,
  OPERATIONS_ROLES,
  type Car,
  type EngineeringSubteam,
  type MilestonePhase,
  type OperationsRole,
  type Role,
  type SponsorshipTier,
  type TeamMember,
} from "@/lib/schemas";

/**
 * Build-time content loaders.
 *
 * Everything here reads from /content on the filesystem and validates through
 * Zod. There is no CMS, no database and no runtime fetch — each of these runs
 * during `next build` and the result is baked into a static page.
 *
 * Module-level memoisation keeps a single build from re-reading and
 * re-validating the same JSON for every page that imports it.
 */

const CONTENT_DIR = join(process.cwd(), "content");

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(CONTENT_DIR, file), "utf8"));
}

/**
 * Reads a list file, which is stored as `{ "<key>": [ ... ] }` rather than as
 * a bare top-level array.
 *
 * The wrapper exists for one reason: TinaCMS writes JSON documents as objects
 * and cannot produce a top-level array. Rather than let that reshape the Zod
 * schemas — which carry the uniqueness refinements and the exported types —
 * the unwrapping happens here, in the one function that reads these files. The
 * schemas still validate a plain array, exactly as before.
 *
 * A missing or non-array key is reported here rather than as a Zod error about
 * the root being an object, which is a considerably less helpful thing to read
 * at 2am.
 */
function readList(file: string, key: string): unknown {
  const data = readJson(file);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const list = (data as Record<string, unknown>)[key];
    if (Array.isArray(list)) return list;
  }
  throw new Error(
    `\n\ncontent/${file} must be an object with a "${key}" array:\n` +
      `  { "${key}": [ ... ] }\n\n` +
      `It is stored wrapped because the admin panel writes JSON objects and\n` +
      `cannot write a top-level array. See readList() in src/lib/content.ts.\n`,
  );
}

function once<T>(fn: () => T): () => T {
  let cached: { value: T } | undefined;
  return () => (cached ??= { value: fn() }).value;
}

export { site };

/* -------------------------------------------------------------------------
   Sponsors
   ------------------------------------------------------------------------- */

/** Display order for tiers. Drives the footer bar and the home page strip. */
export const TIER_ORDER: readonly SponsorTier[] = ["tier1", "tier2", "tier3", "inkind"];

/** Re-exported so server components have one import for content concerns.
 *  The definition lives in src/lib/tierLabels.ts because client components
 *  need it too and this module is server-only. */
export { TIER_LABEL } from "@/lib/tiers";

export const getSponsors = once((): Sponsor[] => {
  const sponsors = parseOrThrow(
    sponsorsSchema,
    readList("sponsors.json", "sponsors"),
    "content/sponsors.json",
  );
  return [...sponsors].sort(
    (a, b) =>
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
      a.name.localeCompare(b.name),
  );
});

/** Sponsors grouped by tier, in display order, skipping empty tiers. */
export function getSponsorsByTier(): { tier: SponsorTier; sponsors: Sponsor[] }[] {
  const sponsors = getSponsors();
  return TIER_ORDER.map((tier) => ({
    tier,
    sponsors: sponsors.filter((s) => s.tier === tier),
  })).filter((group) => group.sponsors.length > 0);
}

/* -------------------------------------------------------------------------
   Team
   ------------------------------------------------------------------------- */

export const getTeam = once((): TeamMember[] =>
  parseOrThrow(teamSchema, readList("team.json", "team"), "content/team.json"),
);

/* -------------------------------------------------------------------------
   Milestones
   ------------------------------------------------------------------------- */

export const getMilestones = once((): Milestone[] => {
  const milestones = parseOrThrow(
    milestonesSchema,
    readList("milestones.json", "milestones"),
    "content/milestones.json",
  );
  return [...milestones].sort((a, b) => a.date.localeCompare(b.date));
});

/**
 * The next `count` milestones for the home page snapshot: the one in progress
 * plus whatever is queued behind it, oldest first.
 *
 * If the season is over and everything is `done`, fall back to the most recent
 * completed milestones so the section never renders empty.
 */
export function getUpcomingMilestones(count = 3): Milestone[] {
  const all = getMilestones();
  const ahead = all.filter((m) => m.status !== "done");
  if (ahead.length >= count) return ahead.slice(0, count);
  return [...all].slice(-count);
}

/* -------------------------------------------------------------------------
   News
   ------------------------------------------------------------------------- */

const NEWS_DIR = join(CONTENT_DIR, "news");

/**
 * Every post, newest first, INCLUDING drafts.
 *
 * Drafts are readable — /news lists them and /news/<slug> renders them, with a
 * visible placeholder banner — but they are not published:
 * `getPublishedNews()` excludes them, which is what the home page and the
 * sitemap use, and the article route marks them `noindex`.
 *
 * The distinction matters because the seeded posts are placeholder copy about
 * a real team. They need to be visible so the news components render in a real
 * state, and they must not be indexable, quotable or presented as fact.
 */
export const getNewsPosts = once((): NewsPost[] => {
  // The directory may not exist at all. Git does not track empty directories,
  // so once the last post is removed, a fresh clone has no content/news/ —
  // which is exactly what happened in CI while it built fine locally, because
  // the empty directory still existed on disk. "No posts yet" is a legitimate
  // state for a first-year team and must not fail the build.
  if (!existsSync(NEWS_DIR)) return [];

  const files = readdirSync(NEWS_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = readFileSync(join(NEWS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = parseOrThrow(
      newsFrontmatterSchema,
      data,
      `content/news/${file} (frontmatter)`,
    );
    return { ...frontmatter, slug, body: content } satisfies NewsPost;
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

/** Posts that are not drafts. Use this anywhere the post is being promoted. */
export const getPublishedNews = once((): NewsPost[] =>
  getNewsPosts().filter((post) => !post.draft),
);

export function getPostBySlug(slug: string): NewsPost | undefined {
  return getNewsPosts().find((post) => post.slug === slug);
}

/** Previous and next by date, for article footer navigation. Drafts are
 *  included so the chain does not break while the seeded posts are in place. */
export function getAdjacentPosts(slug: string): {
  previous: NewsPost | undefined;
  next: NewsPost | undefined;
} {
  const posts = getNewsPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  // The list is newest-first, so "next" is the newer post.
  return { previous: posts[index + 1], next: posts[index - 1] };
}

export function getLatestNews(count = 3): NewsPost[] {
  return getPublishedNews().slice(0, count);
}

/* -------------------------------------------------------------------------
   Sponsorship tiers
   ------------------------------------------------------------------------- */

export const getTiers = once((): SponsorshipTier[] => {
  const tiers = parseOrThrow(
    tiersSchema,
    readList("tiers.json", "tiers"),
    "content/tiers.json",
  );
  return [...tiers].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );
});

/* -------------------------------------------------------------------------
   Recruitment roles
   ------------------------------------------------------------------------- */

export const getRoles = once((): Role[] =>
  parseOrThrow(rolesSchema, readList("roles.json", "roles"), "content/roles.json"),
);

/** Roles grouped by subteam, in display order, skipping empty groups. */
export function getRolesBySubteam(): {
  subteam: EngineeringSubteam;
  roles: Role[];
}[] {
  const roles = getRoles();
  return ENGINEERING_SUBTEAMS.map((subteam) => ({
    subteam,
    roles: roles.filter((r) => r.subteam === subteam),
  })).filter((group) => group.roles.length > 0);
}

/* -------------------------------------------------------------------------
   Team, grouped
   ------------------------------------------------------------------------- */

/**
 * The Operations division, one entry per canonical role.
 *
 * Roles with no members are RETAINED, not filtered out — an empty role is a
 * vacancy, and the whole point is that /team shows it and /join recruits for
 * it without anyone maintaining a separate list. CTO Electrical is currently
 * the empty one.
 */
export function getOperations(): { role: OperationsRole; members: TeamMember[] }[] {
  const team = getTeam();
  return OPERATIONS_ROLES.map((role) => ({
    role,
    members: team.filter((m) =>
      m.roles.some((r) => r.division === "Operations" && r.title === role),
    ),
  }));
}

/** The Engineering division, grouped by subteam, skipping empty subteams. */
export function getEngineering(): {
  subteam: EngineeringSubteam;
  members: TeamMember[];
}[] {
  const team = getTeam();
  return ENGINEERING_SUBTEAMS.map((subteam) => ({
    subteam,
    members: team.filter((m) =>
      m.roles.some((r) => r.division === "Engineering" && r.title === subteam),
    ),
  })).filter((group) => group.members.length > 0);
}

/** Operations roles nobody currently holds. Computed, never hand-maintained. */
export function getVacantRoles(): OperationsRole[] {
  return getOperations()
    .filter((group) => group.members.length === 0)
    .map((group) => group.role);
}

/** Subteams carried by a single person — the other real recruitment gap. */
export function getSinglePersonSubteams(): EngineeringSubteam[] {
  return getEngineering()
    .filter((group) => group.members.length === 1)
    .map((group) => group.subteam);
}

/**
 * Headline team figures, COMPUTED from content/team.json rather than written
 * down anywhere. Editing the roster updates every number on the site, and no
 * stat can drift out of step with the people it counts.
 */
export function getTeamStats(): {
  headcount: number;
  disciplines: number;
  disciplineNames: string[];
  subteams: number;
} {
  const team = getTeam();
  const disciplineNames = [...new Set(team.map((m) => m.major))].sort();
  return {
    headcount: team.length,
    disciplines: disciplineNames.length,
    disciplineNames,
    subteams: getEngineering().length,
  };
}

/** A member's roles as a single readable line, e.g. "CTO Mechanical · Chassis". */
export function roleLine(member: TeamMember): string {
  return member.roles.map((r) => r.title).join(" · ");
}

/* -------------------------------------------------------------------------
   Cars
   ------------------------------------------------------------------------- */

/**
 * The car for a given season.
 *
 * PER-SEASON BY DESIGN. Each car is its own file at content/cars/<year>.json,
 * and /the-car reads the year from site.competition.year. Next season is a new
 * file plus one number in site.ts — not a rewrite, and this season's car stays
 * on disk for an archive page whenever someone wants to build one.
 */
export function getCar(year: number = site.competition.year): Car {
  return parseOrThrow(
    carSchema,
    readJson(join("cars", `${year}.json`)),
    `content/cars/${year}.json`,
  );
}

/* -------------------------------------------------------------------------
   Milestones, grouped by phase
   ------------------------------------------------------------------------- */

/** Milestones grouped by season phase, in phase order, skipping empty phases. */
export function getMilestonesByPhase(): {
  phase: MilestonePhase;
  milestones: Milestone[];
}[] {
  const all = getMilestones();
  return MILESTONE_PHASES.map((phase) => ({
    phase,
    milestones: all.filter((m) => m.phase === phase),
  })).filter((group) => group.milestones.length > 0);
}

/** Headline counts for the /progress summary. */
export function getProgressSummary(): {
  total: number;
  complete: number;
  active: number;
  percent: number;
} {
  const all = getMilestones();
  const complete = all.filter((m) => m.status === "done").length;
  return {
    total: all.length,
    complete,
    active: all.filter((m) => m.status === "active").length,
    percent: all.length === 0 ? 0 : Math.round((complete / all.length) * 100),
  };
}
