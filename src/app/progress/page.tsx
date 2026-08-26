import type { Metadata } from "next";
import Image from "next/image";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Glossary } from "@/components/progress/Glossary";
import { DaysUntil } from "@/components/home/DaysUntil";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StatusPill } from "@/components/ui/StatusPill";
import site from "@/content/site";
import {
  getCopy,
  getMilestonesByPhase,
  getNav,
  getProgressSummary,
  getStatusLabels,
} from "@/lib/content";
import { fill } from "@/lib/copy";

const { title: TITLE, description: DESCRIPTION } = getCopy("progress").meta;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/progress" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/progress" },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The progress page.
 *
 * Grouped by season phase rather than shown as one long list, because "where
 * is the car" is a phase question — a sponsor wants to know whether we are
 * still designing or already building.
 *
 * Milestones with no written update yet say so explicitly. An honest "not
 * started" is worth more here than a fabricated line: the whole premise of
 * this page is that we publish dates in advance and report against them,
 * including the ones we miss. Filling the gaps with invented progress would
 * defeat the point of having the page at all.
 */
export default function ProgressPage() {
  const copy = getCopy("progress");
  const statusLabels = getStatusLabels();
  const nav = getNav();
  const groups = getMilestonesByPhase();
  const summary = getProgressSummary();

  return (
    <>
      {/* ---------- Header + summary ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">{copy.header.eyebrow}</p>
            <h1 className="text-h1 text-text">{copy.header.title}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{copy.header.lead}</p>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">{copy.status.heading}</h2>
            <dl className="flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.status.completeLabel}
                </dt>
                <dd className="tabular text-h3 text-accent">
                  {summary.complete}
                  <span className="text-h4 text-text-muted"> / {summary.total}</span>
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {fill(copy.status.daysToLabel, {
                    event: `${site.competition.name} ${site.competition.year}`,
                  })}
                </dt>
                <dd className="text-h3 text-accent">
                  <DaysUntil targetIso={site.competition.startsAt} />
                </dd>
              </div>
            </dl>

            {/* Progress bar. The number is in the text above it, so this is a
                visual echo rather than the only carrier of the information. */}
            <div className="mt-1">
              <div
                role="progressbar"
                aria-valuenow={summary.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Season progress: ${summary.complete} of ${summary.total} milestones complete`}
                className="h-2 w-full overflow-hidden rounded-pill bg-surface-raised"
              >
                <div
                  className="h-full rounded-pill bg-accent"
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
              <p className="mt-2 text-caption text-text-muted">
                {summary.percent}% of the season&rsquo;s milestones complete
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* ---------- Timeline ---------- */}
      <Section labelledBy="timeline-heading">
        <SectionHeading
          id="timeline-heading"
          eyebrow={copy.timeline.eyebrow}
          title={copy.timeline.title}
          lead={copy.timeline.lead}
        />

        {/* Carried verbatim from the team's project timeline. The dates below
            are the team's own plan, not IMechE's published schedule. */}
        <p
          role="note"
          className="mt-8 max-w-[72ch] rounded-lg border-l-2 border-l-accent bg-surface px-6 py-5 text-small text-text-muted"
        >
          {copy.preliminaryNote}
        </p>

        {/* The manufacturing window is a span, not a point — it runs from the
            concept freeze through to first drive and overlaps most of the
            milestones below, so it is rendered as a band rather than an item. */}
        <div className="mt-8 overflow-hidden rounded-lg border border-border">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 bg-surface-raised px-6 py-4">
            <p className="text-h4 text-text">{copy.manufacturing.heading}</p>
            <p className="tabular text-caption uppercase tracking-wider text-text-muted">
              {copy.manufacturing.label}
            </p>
          </div>
          <div aria-hidden className="flex h-2">
            <span className="w-[18%] bg-border" />
            <span className="flex-1 bg-accent" />
            <span className="w-[22%] bg-border" />
          </div>
          <p className="px-6 py-4 text-small text-text-muted">
            {copy.manufacturing.note}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-14">
          {groups.map((group) => (
            <section key={group.phase} aria-label={`${group.phase} phase`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                <h3 className="text-h3 text-text">{group.phase}</h3>
                <p className="text-caption uppercase tracking-wider text-text-muted">
                  {group.milestones.filter((m) => m.status === "done").length} of{" "}
                  {group.milestones.length} complete
                </p>
              </div>

              {/* The rail is decorative and hidden below lg, where the layout
                  stacks vertically and a connector line would just be clutter. */}
              <ol className="relative mt-8 flex flex-col gap-8 lg:pl-8">
                <span
                  aria-hidden
                  className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border lg:block"
                />
                {group.milestones.map((milestone) => (
                  <li key={milestone.title} className="relative">
                    <span
                      aria-hidden
                      className={
                        "absolute -left-8 top-2 hidden size-[15px] rounded-pill border-2 lg:block " +
                        (milestone.status === "done"
                          ? "border-status-done bg-status-done"
                          : milestone.status === "active"
                            ? "border-status-active bg-status-active"
                            : "border-border-strong bg-bg")
                      }
                    />

                    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusPill labels={statusLabels} status={milestone.status} />
                          <time
                            dateTime={milestone.date}
                            className="tabular text-small text-text-muted"
                          >
                            {DATE_FORMAT.format(new Date(`${milestone.date}T00:00:00Z`))}
                          </time>
                        </div>
                        <h4 className="text-h4 text-text">{milestone.title}</h4>
                        <p className="max-w-[68ch] text-small text-text-muted">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    {/* Update slot. Explicit "nothing yet" beats a fake entry. */}
                    <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                      {milestone.update ? (
                        <div className="rounded-lg border-l-2 border-l-accent border-y border-r border-border bg-surface p-5">
                          <p className="text-caption font-semibold uppercase tracking-wider text-accent">
                            {copy.updateLabel}
                          </p>
                          <p className="mt-2 text-small text-text">{milestone.update}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border p-5">
                          <p className="text-small text-text-muted">
                            {copy.noUpdate[milestone.status]}
                          </p>
                        </div>
                      )}

                      {milestone.photo ? (
                        <Image
                          src={milestone.photo.src}
                          alt={milestone.photo.alt}
                          width={milestone.photo.width}
                          height={milestone.photo.height}
                          sizes="(min-width: 1024px) 30vw, 100vw"
                          className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
                        />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Section>

      {/* ---------- Glossary ---------- */}
      <Section labelledBy="glossary-heading" className="border-t border-border">
        <SectionHeading
          id="glossary-heading"
          eyebrow={copy.glossary.eyebrow}
          title={copy.glossary.title}
          lead={copy.glossary.lead}
        />
        <div className="mt-12">
          <Glossary terms={copy.glossary.terms} />
        </div>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tight className="border-t border-border">
        <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-surface p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-h3 text-text">{copy.cta.title}</h2>
            <p className="max-w-[56ch] text-body text-text-muted">{copy.cta.body}</p>
          </div>
          <Button href={nav.cta.sponsor.href} size="lg" className="shrink-0">
            {nav.cta.sponsor.label}
          </Button>
        </div>
      </Section>
    </>
  );
}
