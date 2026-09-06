import type { Metadata } from "next";
import Link from "next/link";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Card, StretchedLinkOverlay } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { getCopy, getNewsletterIssues } from "@/lib/content";
import { fill } from "@/lib/copy";
import { issueMonth, issueTitle } from "@/lib/newsletter";
import { ENGINEERING_SUBTEAMS } from "@/lib/schemas";

const { title: TITLE, description: DESCRIPTION } = getCopy("newsletter").meta;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/newsletter",
    types: { "application/rss+xml": "/newsletter/rss.xml" },
  },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/newsletter" },
};

/**
 * Newsletter index.
 *
 * Issues newest first, each showing its month, its number and which subteams
 * contributed — the last of those being the thing a returning reader scans
 * for, because it tells them whether their subteam is in this one.
 *
 * Drafts are listed and badged, exactly as on /news. The same `draft` flag
 * keeps them out of the feed and the sitemap and marks the issue page
 * noindex; there is no second mechanism.
 *
 * TODAY THIS PAGE IS EMPTY, and that is the correct state — no seeded issue,
 * no "issue one coming soon" card. The empty state says so plainly and points
 * at /progress, which does have something to show.
 */
export default function NewsletterIndexPage() {
  const copy = getCopy("newsletter");
  const issues = getNewsletterIssues();
  const latest = issues.find((issue) => !issue.draft);

  return (
    <>
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">{copy.header.eyebrow}</p>
            <h1 className="text-h1 text-text">{copy.header.title}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{copy.header.lead}</p>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">{copy.aside.heading}</h2>
            <dl className="flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.aside.issuesLabel}
                </dt>
                <dd className="tabular text-h3 text-accent">{issues.length}</dd>
              </div>
              {latest ? (
                <div>
                  <dt className="text-caption uppercase tracking-wider text-text-muted">
                    {copy.aside.latestLabel}
                  </dt>
                  <dd className="text-body">
                    <Link
                      href={`/newsletter/${latest.slug}`}
                      className="font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      {issueTitle(latest, copy.issueLabel)}
                    </Link>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.aside.subscribeLabel}
                </dt>
                <dd className="text-body">
                  <a
                    href="/newsletter/rss.xml"
                    className="font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {copy.rssLabel}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      <Section labelledBy="issues-heading">
        <h2 id="issues-heading" className="sr-only">
          {copy.listHeading}
        </h2>

        {issues.length === 0 ? (
          /* The voice of the /sponsors empty state: say plainly that it is
             empty, say why that is deliberate, and send the reader somewhere
             that is not. */
          <div className="flex max-w-[62ch] flex-col items-start gap-4 rounded-lg border border-dashed border-border p-8">
            <h3 className="text-h3 text-text">{copy.emptyTitle}</h3>
            <p className="text-body text-text-muted">{copy.emptyBody}</p>
            <Button href="/progress" variant="secondary" className="mt-2">
              {copy.emptyCta}
            </Button>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <Card as="li" key={issue.slug} interactive>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-caption uppercase tracking-wider text-accent">
                      {fill(copy.issueLabel, { issue: issue.issue })}
                    </span>
                    {issue.draft ? (
                      <span className="rounded-pill border border-status-upcoming/40 bg-status-upcoming/10 px-2 py-0.5 text-caption font-semibold text-status-upcoming">
                        {copy.draftBadge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-h4 text-text">
                    <Link href={`/newsletter/${issue.slug}`} className="outline-none">
                      {issueMonth(issue)}
                      <StretchedLinkOverlay />
                    </Link>
                  </h3>

                  <p className="text-small text-text-muted">{issue.intro}</p>

                  <div className="mt-auto flex flex-col gap-1 pt-4">
                    <p className="text-caption uppercase tracking-wider text-text-muted">
                      {copy.contributorsLabel}
                    </p>
                    {/* The subteam names come from the issue's own parsed
                        sections, which are validated against the roster — so
                        this cannot name a subteam that no longer exists. */}
                    <p className="text-caption text-text-muted">
                      {issue.sections.map((s) => s.subteam).join(" · ")}
                    </p>
                    <p className="tabular text-caption text-text-muted">
                      {fill(copy.contributorCount, {
                        count: issue.sections.length,
                        total: ENGINEERING_SUBTEAMS.length,
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
