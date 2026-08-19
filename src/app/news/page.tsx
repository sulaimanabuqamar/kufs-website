import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Card, StretchedLinkOverlay } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { getNewsPosts } from "@/lib/content";
import site from "@/content/site";

const TITLE = "News";
const DESCRIPTION =
  "Build updates, competition reports and technical write-ups from Khalifa University Formula Student, written by the people who did the work.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/news",
    types: { "application/rss+xml": "/news/rss.xml" },
  },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/news" },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * News index.
 *
 * Drafts appear here — they are how the components get exercised while the
 * team writes real posts — but each is badged, excluded from the sitemap, kept
 * off the home page, and marked noindex on its own route.
 *
 * No pagination: the brief sets the threshold at 12 posts and there are two.
 * Adding it now would be building for a problem we do not have.
 */
export default function NewsIndexPage() {
  const posts = getNewsPosts();

  return (
    <>
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">Updates</p>
            <h1 className="text-h1 text-text">From the workshop and the paddock</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">
              Build updates, event reports and post-mortems. Written by the people who did
              the work, including the parts that went wrong.
            </p>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">Follow along</h2>
            <dl className="flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Posts
                </dt>
                <dd className="tabular text-h3 text-accent">{posts.length}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Subscribe
                </dt>
                <dd className="text-body">
                  <a
                    href="/news/rss.xml"
                    className="font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    RSS feed
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Or on social
                </dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-1">
                  {site.socials.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-small text-accent underline-offset-4 hover:underline"
                    >
                      {social.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      <Section labelledBy="posts-heading">
        <h2 id="posts-heading" className="sr-only">
          All posts
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8">
            <p className="max-w-[56ch] text-body text-text-muted">
              No posts yet. Updates from the build start appearing here as the season gets
              going.
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card as="li" key={post.slug} interactive>
                <Image
                  src={post.cover.src}
                  alt={post.cover.alt}
                  width={post.cover.width}
                  height={post.cover.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <time
                      dateTime={post.date}
                      className="text-caption uppercase tracking-wider text-text-muted"
                    >
                      {DATE_FORMAT.format(new Date(`${post.date}T00:00:00Z`))}
                    </time>
                    {post.draft ? (
                      <span className="rounded-pill border border-status-upcoming/40 bg-status-upcoming/10 px-2 py-0.5 text-caption font-semibold text-status-upcoming">
                        Placeholder
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-h4 text-text">
                    <Link href={`/news/${post.slug}`} className="outline-none">
                      {post.title}
                      <StretchedLinkOverlay />
                    </Link>
                  </h3>
                  <p className="text-small text-text-muted">{post.excerpt}</p>
                  <p className="mt-auto pt-3 text-caption text-text-muted">
                    {post.author}
                  </p>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
