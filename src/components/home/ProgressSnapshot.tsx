import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StatusPill } from "@/components/ui/StatusPill";
import site from "@/content/site";
import { getCopy, getUpcomingMilestones, getStatusLabels } from "@/lib/content";
import { fill } from "@/lib/copy";

/** Dates render identically on server and client — an explicit locale and
 *  time zone, never the machine's defaults. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function ProgressSnapshot() {
  const copy = getCopy("home").progress;
  const statusLabels = getStatusLabels();
  const milestones = getUpcomingMilestones(3);

  return (
    <Section labelledBy="progress-heading" className="border-t border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          id="progress-heading"
          eyebrow={copy.eyebrow}
          title={fill(copy.title, { year: site.competition.year })}
          lead={copy.lead ?? undefined}
        />
        <Link
          href="/progress"
          className="shrink-0 rounded-sm text-small font-semibold text-accent underline-offset-4 hover:underline"
        >
          {copy.allLink}
        </Link>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {milestones.map((milestone) => (
          <Card as="li" key={milestone.title} className="gap-3 p-6">
            <div className="flex items-center justify-between gap-3">
              <StatusPill labels={statusLabels} status={milestone.status} />
              <time
                dateTime={milestone.date}
                className="tabular text-caption text-text-muted"
              >
                {DATE_FORMAT.format(new Date(`${milestone.date}T00:00:00Z`))}
              </time>
            </div>
            <h3 className="text-h4 text-text">{milestone.title}</h3>
            <p className="text-small text-text-muted">{milestone.description}</p>
          </Card>
        ))}
      </ol>
    </Section>
  );
}
