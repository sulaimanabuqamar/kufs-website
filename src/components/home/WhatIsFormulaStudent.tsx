import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getCopy, getTeamStats } from "@/lib/content";
import { fill } from "@/lib/copy";

/**
 * The explainer.
 *
 * Written for the sponsor who has never heard of Formula Student and will not
 * read a second paragraph to find out. Three sentences, then three numbers.
 * Everything a prospective partner needs to understand what they would be
 * putting their name on.
 */
export function WhatIsFormulaStudent() {
  const copy = getCopy("home").whatIsFs;
  const { competition, stats } = site;
  const team = getTeamStats();

  return (
    <Section labelledBy="fs-heading">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeading id="fs-heading" eyebrow={copy.eyebrow} title={copy.title} />
          <div className="flex flex-col gap-4 text-lead text-text-muted">
            <p>
              {fill(copy.body, {
                competition: competition.name,
                organiser: competition.organiser,
              })}
            </p>
            <p>{copy.judgingBody}</p>
            <p>{copy.shippingBody}</p>

            {/* Season-one line. Stated plainly — being new is a fact, not an
                apology, and a founding season is a real thing to offer. */}
            <p className="rounded-lg border-l-2 border-l-accent bg-surface px-6 py-5 text-text">
              {site.programme.seasonOneLine}{" "}
              {fill(copy.seasonLine, {
                headcount: team.headcount,
                disciplines: team.disciplines,
                architecture: site.vehicle.architecture.toLowerCase(),
                targetMass: site.vehicle.targetMass,
              })}
            </p>

            {/* The team's own reference set — genuinely useful to a sponsor or a
                prospective member who has never heard of any of this. */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                {
                  href: site.links.whatIsFormulaStudentVideo,
                  label: copy.videoLinkLabel,
                },
                { href: site.links.officialFsuk, label: copy.officialLinkLabel },
                { href: site.links.fsResults, label: copy.resultsLinkLabel },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-small font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {link.label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-6"
            >
              <p className="tabular text-h1 leading-none text-accent">
                {stat.value ?? (
                  <abbr title={copy.tbcTooltip} className="no-underline">
                    {copy.tbcLabel}
                  </abbr>
                )}
              </p>
              <p className="mt-2 text-h4 text-text">{stat.label}</p>
              <p className="text-small text-text-muted">{stat.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
