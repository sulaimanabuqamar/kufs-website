import "server-only";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

import site from "@/content/site";
import { CTA_HREF, PRIMARY_ROUTES, SECONDARY_ROUTES, type NavItem } from "@/lib/nav";
import {
  affiliationsSchema,
  carSchema,
  milestonesSchema,
  MILESTONE_PHASES,
  rolesSchema,
  tiersSchema,
  newsFrontmatterSchema,
  newsletterFrontmatterSchema,
  parseOrThrow,
  COPY_SCHEMAS,
  type Copy,
  type CopyKey,
  sponsorsSchema,
  teamSchema,
  type Affiliation,
  type Milestone,
  type NewsPost,
  type NewsletterIssue,
  type NewsletterSection,
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
   Copy
   ------------------------------------------------------------------------- */

/**
 * Every user-visible word on a page, from content/copy/<page>.json.
 *
 *   const copy = getCopy("sponsors");
 *   <h1>{copy.header.title}</h1>
 *
 * One file per page plus `common`, mirroring the site rather than the
 * component tree. Validated through the same Zod pipeline as everything else,
 * so an over-length heading typed into /admin fails the build with the field
 * named rather than reaching the layout.
 *
 * Memoised per page: /become-a-sponsor reads its copy from four components and
 * should parse it once.
 */
const copyCache = new Map<CopyKey, unknown>();

export function getCopy<K extends CopyKey>(page: K): Copy<K> {
  const cached = copyCache.get(page);
  if (cached) return cached as Copy<K>;

  const parsed = parseOrThrow(
    COPY_SCHEMAS[page],
    readJson(join("copy", `${page}.json`)),
    `content/copy/${page}.json`,
  );
  copyCache.set(page, parsed);
  return parsed as Copy<K>;
}

/**
 * Milestone status words, in the shape StatusPill wants.
 *
 * StatusPill takes them as a prop rather than reading copy itself, so it stays
 * importable from a client tree. This is the one place the mapping lives.
 */
export function getStatusLabels() {
  const ui = getCopy("common").ui;
  return {
    done: ui.statusDone,
    active: ui.statusActive,
    upcoming: ui.statusUpcoming,
  };
}

/* -------------------------------------------------------------------------
   Navigation
   ------------------------------------------------------------------------- */

/**
 * The nav, with editable labels merged onto the fixed route list.
 *
 * src/lib/nav.ts owns which pages exist; content/copy/common.json owns what
 * they are called. This is the join, and it is strict in both directions: a
 * route with no label, or a label for a route that no longer exists, fails the
 * build here rather than rendering a gap in the header.
 *
 * Returns items in the order the ROUTES are declared, not the order the copy
 * file happens to be in — reordering the header is a layout decision, and
 * leaving it to whichever way a CMS list got dragged is how a nav ends up with
 * the sponsorship page buried at position six.
 */
export const getNav = once(() => {
  const copy = getCopy("common");

  const merge = <R extends string>(
    routes: readonly R[],
    entries: readonly { href: string; label: string; description?: string }[],
    which: string,
  ): NavItem[] =>
    routes.map((href) => {
      const entry = entries.find((item) => item.href === href);
      if (!entry) {
        throw new Error(
          `\n\nNo ${which} nav label for ${href} in content/copy/common.json.\n` +
            `Every route in src/lib/nav.ts needs one. Add it back in /admin under\n` +
            `Shared wording -> Navigation, or restore the entry in the file.\n`,
        );
      }
      return { href, label: entry.label, description: entry.description };
    });

  return {
    primary: merge(PRIMARY_ROUTES, copy.nav.primary, "primary"),
    secondary: merge(SECONDARY_ROUTES, copy.nav.secondary, "secondary"),
    cta: {
      sponsor: { href: CTA_HREF.sponsor, label: copy.cta.sponsor },
      join: { href: CTA_HREF.join, label: copy.cta.join },
    },
  };
});

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
   Affiliations
   ------------------------------------------------------------------------- */

/** Every entry, including the ones that may not be shown. For docs and checks. */
export const getAllAffiliations = once((): Affiliation[] =>
  parseOrThrow(
    affiliationsSchema,
    readList("affiliations.json", "affiliations"),
    "content/affiliations.json",
  ),
);

/**
 * The affiliations that may actually be displayed.
 *
 * TWO conditions, both required, and this is the only place they are checked:
 *
 *   1. `permissionConfirmed` — the organisation has confirmed we may use their
 *      mark. These are third-party trademarks, not our own brand assets.
 *   2. A logo file. Permission is not artwork; an entry can have the first and
 *      not the second, which is exactly where Khalifa University sits today.
 *
 * With neither condition met by any entry, this returns an empty array and
 * `<AffiliationStrip>` renders nothing at all — not an empty box and not a
 * placeholder. The site says the true thing in words instead.
 */
export const getAffiliations = once((): Affiliation[] =>
  getAllAffiliations().filter((a) => a.permissionConfirmed && a.logo),
);

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
   Newsletter
   ------------------------------------------------------------------------- */

const NEWSLETTER_DIR = join(CONTENT_DIR, "newsletter");

/** "Chassis & Driver Ergonomics" -> "chassis-driver-ergonomics". */
function subteamAnchor(subteam: string): string {
  return subteam
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Split an issue body into one section per contributing subteam.
 *
 * THE SECTIONS ARE THE `##` HEADINGS. An issue is written as plain MDX with a
 * level-two heading per subteam and that subteam's report underneath it. The
 * alternative — a `sections:` array in the frontmatter with the prose inside
 * YAML — is worse to write, worse to review as a diff, and would have put
 * paragraphs of MDX inside a string.
 *
 * THE HEADINGS ARE VALIDATED AGAINST THE ROSTER'S OWN SUBTEAM LIST, which is
 * the point of doing it this way. `ENGINEERING_SUBTEAMS` is the same list
 * `content/team.json` validates its roles against and the same list /team and
 * /join group by. There is no second copy of the subteam names anywhere in the
 * newsletter, so renaming a subteam is one edit and cannot leave an issue
 * heading pointing at a subteam that no longer exists — the build fails
 * instead, naming the file and the heading.
 *
 * A SUBTEAM THAT DID NOT CONTRIBUTE IS ABSENT. Nothing is rendered in its
 * place. Eight "no update this month" rows makes a quiet month look like a
 * dead team, which is the opposite of what a newsletter is for; a reader
 * counts what is there, not what is missing.
 */
function parseSections(body: string, source: string): NewsletterSection[] {
  const HEADING = /^##[ \t]+(.+?)[ \t]*$/gm;

  const matches = [...body.matchAll(HEADING)];
  const preamble = body.slice(0, matches[0]?.index ?? body.length).trim();
  if (preamble) {
    throw new Error(
      `\n\n${source}: text appears before the first subteam heading.\n\n` +
        `The editorial introduction belongs in the frontmatter, as \`intro\`.\n` +
        `Everything in the body must sit under a "## <Subteam>" heading.\n`,
    );
  }
  if (matches.length === 0) {
    throw new Error(
      `\n\n${source}: the issue has no subteam sections.\n\n` +
        `Add at least one "## <Subteam>" heading with that subteam's report\n` +
        `underneath it. Valid subteams:\n` +
        ENGINEERING_SUBTEAMS.map((s) => `  ## ${s}`).join("\n") +
        `\n`,
    );
  }

  const sections = matches.map((match, index) => {
    const name = match[1].trim();
    const subteam = ENGINEERING_SUBTEAMS.find((s) => s === name);
    if (!subteam) {
      throw new Error(
        `\n\n${source}: "## ${name}" is not one of the team's subteams.\n\n` +
          `Section headings are matched against the roster, so they cannot\n` +
          `drift from it. Use exactly one of:\n` +
          ENGINEERING_SUBTEAMS.map((s) => `  ## ${s}`).join("\n") +
          `\n\nUse "###" for a subheading inside a subteam's section.\n`,
      );
    }

    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? body.length;
    const text = body.slice(start, end).trim();
    if (!text) {
      throw new Error(
        `\n\n${source}: "## ${name}" has a heading but no report under it.\n\n` +
          `A subteam that did not contribute this month should be left out\n` +
          `entirely rather than given an empty section.\n`,
      );
    }

    return { subteam, id: subteamAnchor(subteam), body: text };
  });

  const seen = new Set<string>();
  for (const section of sections) {
    if (seen.has(section.subteam)) {
      throw new Error(
        `\n\n${source}: "## ${section.subteam}" appears twice.\n\n` +
          `Each subteam gets one section per issue. Merge the two.\n`,
      );
    }
    seen.add(section.subteam);
  }

  // Canonical order, not the order they were typed, so every issue reads in
  // the same sequence as /team and /join and a reader learns where to look.
  return sections.sort(
    (a, b) =>
      ENGINEERING_SUBTEAMS.indexOf(a.subteam) - ENGINEERING_SUBTEAMS.indexOf(b.subteam),
  );
}

/**
 * Every issue, newest first, INCLUDING drafts.
 *
 * Exactly the arrangement /news uses, and deliberately the same one rather
 * than a second mechanism: drafts are listed and readable behind a visible
 * banner, `getPublishedNewsletter()` excludes them, the sitemap and the feed
 * read the published list, and the issue route marks a draft `noindex`.
 *
 * The directory may legitimately not exist. There are no issues yet, git does
 * not track empty directories, and "no issues yet" is the honest state of a
 * newsletter that has not published its first one — it must not fail a build.
 */
export const getNewsletterIssues = once((): NewsletterIssue[] => {
  if (!existsSync(NEWSLETTER_DIR)) return [];

  const files = readdirSync(NEWSLETTER_DIR).filter((f) => f.endsWith(".mdx"));

  const issues = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const source = `content/newsletter/${file}`;
    const raw = readFileSync(join(NEWSLETTER_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = parseOrThrow(
      newsletterFrontmatterSchema,
      data,
      `${source} (frontmatter)`,
    );

    // The filename is the URL, so it has to agree with the frontmatter rather
    // than merely look like it does. `2026-10.mdx` carrying month 11 would
    // publish an issue at a URL naming the wrong month.
    const expected = `${frontmatter.year}-${String(frontmatter.month).padStart(2, "0")}`;
    if (slug !== expected) {
      throw new Error(
        `\n\n${source} is named for a different month than its frontmatter.\n\n` +
          `  frontmatter: year ${frontmatter.year}, month ${frontmatter.month}` +
          ` -> ${expected}.mdx\n` +
          `  filename:    ${file}\n\n` +
          `The filename is the URL. Rename the file, or fix the frontmatter.\n`,
      );
    }

    return {
      ...frontmatter,
      slug,
      sections: parseSections(content, source),
    } satisfies NewsletterIssue;
  });

  const duplicate = issues.find(
    (issue, i) => issues.findIndex((o) => o.issue === issue.issue) !== i,
  );
  if (duplicate) {
    throw new Error(
      `\n\nTwo newsletter issues are both numbered ${duplicate.issue}.\n` +
        `Issue numbers are sequential and unique. Check content/newsletter/.\n`,
    );
  }

  // Newest first. Slugs are zero-padded "YYYY-MM", so this sorts by date.
  return issues.sort((a, b) => b.slug.localeCompare(a.slug));
});

/** Issues that are not drafts. Use this anywhere an issue is being promoted. */
export const getPublishedNewsletter = once((): NewsletterIssue[] =>
  getNewsletterIssues().filter((issue) => !issue.draft),
);

export function getIssueBySlug(slug: string): NewsletterIssue | undefined {
  return getNewsletterIssues().find((issue) => issue.slug === slug);
}

/** Previous and next by date, for the issue footer. Mirrors getAdjacentPosts. */
export function getAdjacentIssues(slug: string): {
  previous: NewsletterIssue | undefined;
  next: NewsletterIssue | undefined;
} {
  const issues = getNewsletterIssues();
  const index = issues.findIndex((i) => i.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  // Newest-first, so "next" is the newer issue.
  return { previous: issues[index + 1], next: issues[index - 1] };
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
