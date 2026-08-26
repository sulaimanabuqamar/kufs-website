import Image from "next/image";
import Link from "next/link";

import { Card, StretchedLinkOverlay } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getCopy, getLatestNews } from "@/lib/content";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function LatestNews() {
  const copy = getCopy("home").news;
  const posts = getLatestNews(3);
  if (posts.length === 0) return null;

  return (
    <Section labelledBy="news-heading" className="border-t border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          id="news-heading"
          eyebrow={copy.eyebrow}
          title={copy.title}
          lead={copy.lead ?? undefined}
        />
        <Link
          href="/news"
          className="shrink-0 rounded-sm text-small font-semibold text-accent underline-offset-4 hover:underline"
        >
          {copy.allLink}
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
                    element, so keyboard order and link semantics are intact. */}
                <Link href={`/news/${post.slug}`} className="outline-none">
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
