import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { mdxComponents } from "@/components/news/mdxComponents";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getAdjacentPosts, getNewsPosts, getPostBySlug } from "@/lib/content";
import { CTA } from "@/lib/nav";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

type Params = { slug: string };

/** Every post is prerendered at build time — there is no runtime data source. */
export function generateStaticParams(): Params[] {
  return getNewsPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    // A placeholder post must never be indexable. The draft flag drives this,
    // the sitemap exclusion, and the home page exclusion from one place.
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/news/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.cover.src,
          width: post.cover.width,
          height: post.cover.height,
          alt: post.cover.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover.src],
    },
  };
}

export default async function NewsPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { previous, next } = getAdjacentPosts(slug);

  return (
    <>
      {/* ---------- Header ---------- */}
      <Section className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-5">
          <p className="text-caption">
            <Link
              href="/news"
              className="font-semibold text-accent underline-offset-4 hover:underline"
            >
              ← All news
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <time
              dateTime={post.date}
              className="text-caption uppercase tracking-wider text-text-muted"
            >
              {DATE_FORMAT.format(new Date(`${post.date}T00:00:00Z`))}
            </time>
            <span aria-hidden className="text-text-muted">
              ·
            </span>
            <span className="text-caption uppercase tracking-wider text-text-muted">
              {post.author}
            </span>
          </div>

          <h1 className="text-h1 text-text">{post.title}</h1>
          <SpeedStripe variant="accent" />
          <p className="text-lead text-text-muted">{post.excerpt}</p>

          {post.draft ? (
            /* Visible, unmissable, and matched by robots noindex above. This
               is placeholder copy about a real team; it must not be mistaken
               for a published account. */
            <div
              role="note"
              className="mt-2 rounded-lg border-2 border-status-upcoming/50 bg-surface p-5"
            >
              <p className="text-caption font-semibold uppercase tracking-widest text-status-upcoming">
                Placeholder post
              </p>
              <p className="mt-2 text-small text-text-muted">
                Seeded content so the news pages render in a real state. The figures and
                events below are illustrative and have not happened. This post is excluded
                from search engines, the sitemap and the home page.
              </p>
            </div>
          ) : null}
        </div>
      </Section>

      {/* ---------- Cover + body ---------- */}
      <Section>
        <div className="mx-auto w-full max-w-[46rem]">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            sizes="(min-width: 768px) 736px, 100vw"
            priority
            className="mb-10 h-auto w-full rounded-lg border border-border"
          />

          <article>
            <MDXRemote source={post.body} components={mdxComponents} />
          </article>

          {/* ---------- Prev / next ---------- */}
          <nav
            aria-label="More posts"
            className="mt-16 grid gap-4 border-t border-border pt-10 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/news/${previous.slug}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong"
              >
                <span className="text-caption uppercase tracking-wider text-text-muted">
                  ← Older
                </span>
                <span className="text-h4 text-text">{previous.title}</span>
              </Link>
            ) : (
              <span aria-hidden />
            )}

            {next ? (
              <Link
                href={`/news/${next.slug}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-5 text-right transition-colors hover:border-border-strong sm:items-end"
              >
                <span className="text-caption uppercase tracking-wider text-text-muted">
                  Newer →
                </span>
                <span className="text-h4 text-text">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </div>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tight className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[46rem] flex-col items-start gap-5 rounded-lg border border-border bg-surface p-8">
          <h2 className="text-h3 text-text">Stories like this need a car</h2>
          <p className="max-w-[56ch] text-body text-text-muted">
            Everything on this site is built by students and paid for by partners. If your
            organisation can help, we would like to hear from you.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={CTA.sponsor.href}>{CTA.sponsor.label}</Button>
            <Button href={CTA.join.href} variant="secondary">
              {CTA.join.label}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
