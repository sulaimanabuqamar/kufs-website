import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";

/**
 * The explainer.
 *
 * Written for the sponsor who has never heard of Formula Student and will not
 * read a second paragraph to find out. Three sentences, then three numbers.
 * Everything a prospective partner needs to understand what they would be
 * putting their name on.
 */
export function WhatIsFormulaStudent() {
  const { competition, stats } = site;

  return (
    <Section labelledBy="fs-heading">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeading
            id="fs-heading"
            eyebrow="What is Formula Student?"
            title="Europe's largest student engineering competition."
          />
          <div className="flex flex-col gap-4 text-lead text-text-muted">
            <p>
              {competition.name} challenges university teams to design, build, cost and
              race a single-seat car against a rulebook written by the{" "}
              {competition.organiser}.
            </p>
            <p>
              Every team is judged twice over: once on the engineering — design defence,
              cost report and business case, in front of practising industry engineers —
              and once on track, over acceleration, skid pad, sprint and a 22 km endurance
              run.
            </p>
            <p>
              It is the closest thing an undergraduate gets to shipping a real product: a
              fixed deadline, a real budget, a scrutineer who does not care how hard the
              term was, and a car that either finishes or does not.
            </p>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-6"
            >
              <p className="tabular text-h1 leading-none text-accent">{stat.value}</p>
              <p className="mt-2 text-h4 text-text">{stat.label}</p>
              <p className="text-small text-text-muted">{stat.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
