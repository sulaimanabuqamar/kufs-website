import "server-only";

import { readFileSync, readdirSync } from "node:fs";
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
  SUBTEAMS,
  type Car,
  type MilestonePhase,
  type Role,
  type SponsorshipTier,
  type Subteam,
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

function once<T>(fn: () => T): () => T {
  let cached: { value: T } | undefined;
  return () => (cached ??= { value: fn() }).value;
}

export { site };

/* -------------------------------------------------------------------------
   Sponsors
   ------------------------------------------------------------------------- */

/** Display order for tiers. Drives the footer bar and the home page strip. */
export const TIER_ORDER: readonly SponsorTier[] = [
  "title",
  "gold",
  "silver",
  "bronze",
  "inkind",
];

/** Re-exported so server components have one import for content concerns.
 *  The definition lives in src/lib/tierLabels.ts because client components
 *  need it too and this module is server-only. */
export { TIER_LABEL } from "@/lib/tiers";

export const getSponsors = once((): Sponsor[] => {
  const sponsors = parseOrThrow(
    sponsorsSchema,
    readJson("sponsors.json"),
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
  parseOrThrow(teamSchema, readJson("team.json"), "content/team.json"),
);

/* -------------------------------------------------------------------------
   Milestones
   ------------------------------------------------------------------------- */

export const getMilestones = once((): Milestone[] => {
  const milestones = parseOrThrow(
    milestonesSchema,
    readJson("milestones.json"),
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
  const tiers = parseOrThrow(tiersSchema, readJson("tiers.json"), "content/tiers.json");
  return [...tiers].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );
});

/* -------------------------------------------------------------------------
   Recruitment roles
   ------------------------------------------------------------------------- */

export const getRoles = once((): Role[] =>
  parseOrThrow(rolesSchema, readJson("roles.json"), "content/roles.json"),
);

/** Roles grouped by subteam, in SUBTEAMS order, skipping empty groups. */
export function getRolesBySubteam(): { subteam: Subteam; roles: Role[] }[] {
  const roles = getRoles();
  return SUBTEAMS.map((subteam) => ({
    subteam,
    roles: roles.filter((r) => r.subteam === subteam),
  })).filter((group) => group.roles.length > 0);
}

/* -------------------------------------------------------------------------
   Team, grouped
   ------------------------------------------------------------------------- */

/**
 * Roster grouped by subteam, in SUBTEAMS order, skipping empty groups.
 *
 * A yearly roster swap is one edit to content/team.json — add, remove or move
 * people between subteams and this regroups automatically. No component knows
 * how many members or groups there are.
 */
export function getTeamBySubteam(): { subteam: Subteam; members: TeamMember[] }[] {
  const team = getTeam();
  return SUBTEAMS.map((subteam) => ({
    subteam,
    members: team.filter((m) => m.subteam === subteam),
  })).filter((group) => group.members.length > 0);
}

/* -------------------------------------------------------------------------
   Cars
   ------------------------------------------------------------------------- */

/**
 * The car for a given season.
 *
 * PER-SEASON BY DESIGN. Each car is its own file at content/cars/<year>.json,
 * and /the-car reads the year from site.competition.year. Next season is a new
 * file plus one number in site.ts — not a rewrite, and last year's car stays on
 * disk for an archive page whenever someone wants to build one.
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
