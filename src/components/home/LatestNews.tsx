import Image from "next/image";
import Link from "next/link";

import { Card, StretchedLinkOverlay } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getLatestNews } from "@/lib/content";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function LatestNews() {
  const posts = getLatestNews(3);
  if (posts.length === 0) return null;

  return (
    <Section labelledBy="news-heading" className="border-t border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          id="news-heading"
          eyebrow="News"
          title="From the workshop"
          lead="Build updates, event reports and the occasional post-mortem."
        />
        <Link
          href="/news"
          className="shrink-0 rounded-sm text-small font-semibold text-accent underline-offset-4 hover:underline"
        >
          All news →
        </Link>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Card as="li" key={post.slug} interactive>
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              width={post.cover.width}
              height={post.cover.height}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-2 p-6">
              <time
                dateTime={post.date}
                className="text-caption uppercase tracking-wider text-text-muted"
              >
                {DATE_FORMAT.format(new Date(`${post.date}T00:00:00Z`))}
              </time>
              <h3 className="text-h4 text-text">
                {/* The card is the hit area; the link is still the focusable
                    element, so keyboard order and link semantics are intact.

                    TODO(milestone 2): point at `/news/${post.slug}` once the
                    article route exists. Linking there now would ship three
                    404s on the home page, so these go to the index instead. */}
                <Link href="/news" className="outline-none">
                  {post.title}
                  <StretchedLinkOverlay />
                </Link>
              </h3>
              <p className="text-small text-text-muted">{post.excerpt}</p>
              <p className="mt-auto pt-3 text-caption text-text-muted">{post.author}</p>
            </div>
          </Card>
        ))}
      </ul>
    </Section>
  );
}
