import site from "@/content/site";
import { getPublishedNews } from "@/lib/content";
import { siteUrl } from "@/lib/env";

/**
 * RSS 2.0 feed at /news/rss.xml.
 *
 * PUBLISHED POSTS ONLY. Drafts are visible on the site with a placeholder
 * banner, but a feed is syndication — once a placeholder is in someone's
 * reader it is out of our hands and reads as a published account.
 *
 * Hand-written rather than pulled from a feed library: it is thirty lines of
 * XML, it is generated once at build time, and the standing rule is that a
 * dependency has to earn itself.
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
  const posts = getPublishedNews();
  const title = `${site.longName} — News`;

  const items = posts
    .map((post) => {
      const url = `${origin}/news/${post.slug}`;
      // RFC 822 date, which is what RSS readers expect.
      const pubDate = new Date(`${post.date}T09:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <author>${escapeXml(post.author)}</author>
      <enclosure url="${origin}${post.cover.src}" type="image/webp" length="0" />
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${origin}/news</link>
    <description>${escapeXml(site.description)}</description>
    <language>en-GB</language>
    <atom:link href="${origin}/news/rss.xml" rel="self" type="application/rss+xml" />
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
