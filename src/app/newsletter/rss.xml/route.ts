import site from "@/content/site";
import { getCopy, getPublishedNewsletter } from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { issueDate, issueTitle } from "@/lib/newsletter";

/**
 * RSS 2.0 feed at /newsletter/rss.xml.
 *
 * ITS OWN FEED, separate from /news/rss.xml, for the same reason the two are
 * separate sections: a reader who wants monthly engineering reports and a
 * reader who wants announcements are not the same person, and merging them
 * makes both feeds worse.
 *
 * PUBLISHED ISSUES ONLY, by the same rule as the news feed — syndication is
 * irreversible, and a draft in someone's reader reads as published.
 *
 * The item description lists the contributing subteams after the editor's
 * intro. In a reader there is no card and no layout, so that line is the only
 * signal of whether this issue contains the subteam someone follows.
 *
 * Hand-written XML, matching src/app/news/rss.xml/route.ts. The standing rule
 * is that a dependency has to earn itself, and this is thirty lines.
 */

/** Prerendered with everything else; there is no runtime data source. */
export const dynamic = "force-static";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function GET(): Response {
  const origin = siteUrl();
  const copy = getCopy("newsletter");
  const issues = getPublishedNewsletter();
  const title = `${site.longName} — Newsletter`;

  const items = issues
    .map((issue) => {
      const url = `${origin}/newsletter/${issue.slug}`;
      // Dated to 09:00 UTC on the first of the issue's month. RFC 822, which
      // is what RSS readers expect.
      const pubDate = new Date(
        issueDate(issue).getTime() + 9 * 3600 * 1000,
      ).toUTCString();
      const contributors = issue.sections.map((s) => s.subteam).join(", ");
      return `    <item>
      <title>${escapeXml(issueTitle(issue, copy.issueLabel))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(`${issue.intro} — ${copy.contributorsLabel}: ${contributors}.`)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${origin}/newsletter</link>
    <description>${escapeXml(copy.meta.description)}</description>
    <language>en-GB</language>
    <atom:link href="${origin}/newsletter/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
