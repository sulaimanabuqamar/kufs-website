import type { Metadata } from "next";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { MemberCard } from "@/components/team/MemberCard";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import {
  getEngineering,
  getOperations,
  getTeamStats,
  getVacantRoles,
} from "@/lib/content";
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
  const operations = getOperations();
  const engineering = getEngineering();
  const stats = getTeamStats();
  const vacancies = getVacantRoles();

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
            <dl className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
              {/* Every figure here is computed from content/team.json, so the
                  roster and the numbers cannot drift apart. */}
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Students on the team
                </dt>
                <dd className="tabular text-h3 text-accent">{stats.headcount}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Engineering subteams
                </dt>
                <dd className="tabular text-h3 text-accent">{stats.subteams}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Disciplines represented
                </dt>
                <dd className="tabular text-h3 text-accent">{stats.disciplines}</dd>
                <dd className="mt-1 text-caption text-text-muted">
                  {stats.disciplineNames.join(", ")}
                </dd>
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

        {/* ---- Operations ---- */}
        <div className="mt-12">
          <h3 className="border-b border-border pb-3 text-h3 text-text">Operations</h3>
          <p className="mt-4 max-w-[62ch] text-body text-text-muted">
            The people who fund the programme, run it, and tell the world about it. Three
            of the eight events scored at Formula Student are static — design, cost and
            business — so this is not the support act.
          </p>

          <div className="mt-8 flex flex-col gap-10">
            {operations.map((group) => (
              <div key={group.role}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h4 className="text-h4 text-accent">{group.role}</h4>
                  {group.members.length === 0 ? (
                    <span className="rounded-pill border border-status-active/45 bg-status-active/10 px-2.5 py-1 text-caption font-semibold text-status-active">
                      Vacant — recruiting
                    </span>
                  ) : null}
                </div>

                {group.members.length > 0 ? (
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((member) => (
                      <MemberCard key={member.name} member={member} />
                    ))}
                  </ul>
                ) : (
                  /* An unfilled canonical role IS the vacancy — computed, not a
                     list somebody has to remember to update. */
                  <div className="mt-4 rounded-lg border border-dashed border-border p-6">
                    <p className="max-w-[56ch] text-small text-text-muted">
                      We are looking for someone to take this on. It is one of the most
                      consequential open positions on the team.
                    </p>
                    <Button
                      href={CTA.join.href}
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                    >
                      Read the role
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---- Engineering ---- */}
        <div className="mt-16">
          <h3 className="border-b border-border pb-3 text-h3 text-text">Engineering</h3>
          <p className="mt-4 max-w-[62ch] text-body text-text-muted">
            Eight subteams covering the whole car, from the frame to the high-voltage
            system. Several of them are one or two people — this is a first-year team, and
            there is room.
          </p>

          <div className="mt-8 flex flex-col gap-10">
            {engineering.map((group) => (
              <div key={group.subteam}>
                <h4 className="text-h4 text-accent">{group.subteam}</h4>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((member) => (
                    <MemberCard key={member.name} member={member} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Faculty advisor ---- */}
        {site.facultyAdvisor ? (
          <div className="mt-16 rounded-lg border border-border bg-surface p-7">
            <h3 className="text-h4 text-text">Faculty advisor</h3>
            <p className="mt-3 text-body text-text">{site.facultyAdvisor.name}</p>
            <p className="text-small text-text-muted">
              {site.facultyAdvisor.role}, {site.university}
            </p>
          </div>
        ) : null}

        {vacancies.length > 0 ? (
          <p className="mt-8 text-small text-text-muted">
            {vacancies.length === 1 ? "One role is" : `${vacancies.length} roles are`}{" "}
            currently open: {vacancies.join(", ")}.{" "}
            <a
              href={CTA.join.href}
              className="font-semibold text-accent underline-offset-4 hover:underline"
            >
              See what joining involves
            </a>
            .
          </p>
        ) : null}
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tight className="border-t border-border">
        <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-surface p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-h3 text-text">There is a seat for you here</h2>
            <p className="max-w-[56ch] text-body text-text-muted">
              This is a first-year team building a first car. Several subteams are one or
              two people, and one leadership role is unfilled — which means there is real
              work here for whoever takes it on.
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
