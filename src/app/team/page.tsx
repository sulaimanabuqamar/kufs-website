import type { Metadata } from "next";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { MemberCard } from "@/components/team/MemberCard";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getTeam, getTeamBySubteam } from "@/lib/content";
import { CTA } from "@/lib/nav";

const TITLE = "The Team";
const DESCRIPTION =
  "The students who design, build and race the KUFS car, across all seven subteams — plus what Formula Student is and what the team stands for.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/team" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/team" },
};

/**
 * Team page, with About merged in.
 *
 * ROSTER MAINTENANCE: a yearly swap is ONE edit to content/team.json. Add,
 * remove or move people between subteams and everything below regroups
 * automatically — no component knows how many members or groups exist, and
 * empty subteams disappear rather than rendering a bare heading. Nothing here
 * needs touching when the roster changes.
 */
export default function TeamPage() {
  const groups = getTeamBySubteam();
  const headcount = getTeam().length;

  return (
    <>
      {/* ---------- About ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[62ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">About KUFS</p>
            <h1 className="text-h1 text-text">{site.tagline}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{site.positioning}</p>

            <div className="mt-2 flex flex-col gap-4 text-body text-text-muted">
              <p>
                Formula Student is the largest student engineering competition in Europe:
                university teams design, build, cost and race a single-seat car against a
                rulebook written by the {site.competition.organiser}. It is judged twice
                over — once on the engineering, in design, cost and business presentations
                in front of practising industry engineers, and once on track, over
                acceleration, skid pad, sprint and a 22 km endurance run.
              </p>
              <p>
                KUFS represents {site.university} at {site.competition.name}, held at{" "}
                {site.competition.venue}. We are a student team: every part on the car is
                specified, designed, manufactured and signed off by the people listed
                further down this page.
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">The team at a glance</h2>
            <SpeedStripe variant="underline" />
            <dl className="mt-2 flex flex-col gap-4">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Students listed here
                </dt>
                <dd className="tabular text-h3 text-accent">{headcount}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Subteams
                </dt>
                <dd className="tabular text-h3 text-accent">{groups.length}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Competing at
                </dt>
                <dd className="text-h4 text-text">
                  {site.competition.name} {site.competition.year}
                </dd>
              </div>
            </dl>
            {/* TODO(team): `headcount` is the number of people in team.json, not
                the size of the team. Add the full roster, or replace this tile
                with a confirmed figure. */}
          </aside>
        </div>
      </Section>

      {/* ---------- Values ---------- */}
      <Section labelledBy="values-heading" className="border-b border-border">
        <SectionHeading
          id="values-heading"
          eyebrow={site.straplines[2]}
          title="What we stand for"
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {site.values.map((value) => (
            <li
              key={value.title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
            >
              {/* Verbatim from the brand sheet — do not reword. */}
              <h3 className="text-h4 tracking-widest text-accent">{value.title}</h3>
              <SpeedStripe variant="underline" className="w-16" />
              <p className="text-small text-text-muted">{value.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Roster ---------- */}
      <Section labelledBy="roster-heading">
        <SectionHeading
          id="roster-heading"
          eyebrow="The roster"
          title="Who builds the car"
          lead={site.straplines[0]}
        />

        <div className="mt-12 flex flex-col gap-14">
          {groups.map((group) => (
            <div key={group.subteam}>
              <div className="flex flex-col gap-2">
                <h3 className="text-h3 text-text">{group.subteam}</h3>
                <SpeedStripe variant="underline" />
              </div>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {group.members.map((member) => (
                  <MemberCard key={member.name} member={member} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Faculty advisor. Hidden entirely until the team confirms who it is,
            rather than rendering an empty slot. */}
        {site.facultyAdvisor ? (
          <div className="mt-16 rounded-lg border border-border bg-surface p-7">
            <h3 className="text-h4 text-text">Faculty advisor</h3>
            <SpeedStripe variant="underline" className="mt-2" />
            <p className="mt-4 text-body text-text">{site.facultyAdvisor.name}</p>
            <p className="text-small text-text-muted">
              {site.facultyAdvisor.role} · {site.facultyAdvisor.department}
            </p>
          </div>
        ) : null}
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tight className="border-t border-border">
        <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-surface p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-h3 text-text">There is a seat for you here</h2>
            <SpeedStripe variant="underline" />
            <p className="max-w-[56ch] text-body text-text-muted">
              We recruit across every subteam each October — engineering and business
              alike. Most of the people above joined knowing nothing about race cars.
            </p>
          </div>
          <Button href={CTA.join.href} size="lg" className="shrink-0">
            {CTA.join.label}
          </Button>
        </div>
      </Section>
    </>
  );
}
