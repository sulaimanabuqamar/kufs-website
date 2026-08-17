import "server-only";

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

import site from "@/content/site";
import {
  milestonesSchema,
  newsFrontmatterSchema,
  parseOrThrow,
  sponsorsSchema,
  teamSchema,
  type Milestone,
  type NewsPost,
  type Sponsor,
  type SponsorTier,
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

export const TIER_LABEL: Record<SponsorTier, string> = {
  title: "Title partner",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  inkind: "In-kind",
};

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

  return posts
    .filter((post) => !post.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => b.date.localeCompare(a.date));
});

export function getLatestNews(count = 3): NewsPost[] {
  return getNewsPosts().slice(0, count);
}
