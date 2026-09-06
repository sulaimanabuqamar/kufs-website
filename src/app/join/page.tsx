import type { Metadata } from "next";

import { SmoothHashScroll } from "@/components/SmoothHashScroll";
import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { ObfuscatedEmailButton } from "@/components/ui/ObfuscatedEmail";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StatusPill } from "@/components/ui/StatusPill";
import site from "@/content/site";
import {
  getCopy,
  getEngineering,
  getMilestones,
  getNav,
  getRolesBySubteam,
  getSinglePersonSubteams,
  getTeamStats,
  getVacantRoles,
  getStatusLabels,
} from "@/lib/content";
import { fill } from "@/lib/copy";

const { title: TITLE, description: DESCRIPTION } = getCopy("join").meta;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/join" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/join" },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function JoinPage() {
  const copy = getCopy("join");
  const statusLabels = getStatusLabels();
  const nav = getNav();
  const roleGroups = getRolesBySubteam();
  const timeline = getMilestones();
  const vacancies = getVacantRoles();
  const thin = getSinglePersonSubteams();
  const stats = getTeamStats();
  const engineering = getEngineering();
  const headcountBySubteam = new Map(
    engineering.map((g) => [g.subteam, g.members.length] as const),
  );

  return (
    <>
      {/* Only mounted on the pages that have in-page anchors. It used to sit in
          the root layout, which shipped a global click listener to every route
          for a feature two pages use. */}
      <SmoothHashScroll />
      {/* ---------- Hero ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-6">
            <p className="text-eyebrow uppercase text-accent">{copy.header.eyebrow}</p>
            <h1 className="text-h1 text-text">{copy.header.title}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">
              {fill(copy.header.body, {
                headcount: stats.headcount,
                subteams: roleGroups.length,
                university: site.university,
              })}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="#roles" size="lg">
                {copy.header.rolesLink}
              </Button>
              <Button href="/team" variant="secondary" size="lg">
                {copy.header.teamLink}
              </Button>
            </div>
          </div>

          {/* Right column carries the facts a student actually decides on. */}
          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">{copy.header.asideHeading}</h2>
            <dl className="flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.header.headcountLabel}
                </dt>
                <dd className="tabular text-h3 text-accent">{stats.headcount}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.header.subteamsLabel}
                </dt>
                <dd className="tabular text-h3 text-accent">{roleGroups.length}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.header.vacantLabel}
                </dt>
                <dd className="tabular text-h3 text-accent">{vacancies.length}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.header.experienceLabel}
                </dt>
                <dd className="text-h4 text-text">{copy.header.experienceValue}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      {/* ---------- The real gaps ---------- */}
      {/* Computed from content/team.json: a canonical Operations role with
          nobody in it is a vacancy, and a subteam with one member is a single
          point of failure. Nobody maintains this list — it follows the roster. */}
      <Section labelledBy="gaps-heading" className="border-b border-border">
        <SectionHeading
          id="gaps-heading"
          eyebrow={copy.gaps.eyebrow}
          title={copy.gaps.title}
          lead={copy.gaps.lead ?? undefined}
        />

        <ul className="mt-12 grid gap-5 lg:grid-cols-2">
          {vacancies.map((role) => (
            <li
              key={role}
              className="flex flex-col gap-3 rounded-lg border-2 border-accent bg-surface p-7"
            >
              <p className="text-caption font-semibold uppercase tracking-widest text-accent">
                {copy.gaps.vacantBadge}
              </p>
              <h3 className="text-h3 text-text">{role}</h3>
              <p className="text-body text-text-muted">
                {fill(copy.gaps.vacantBody, { role })}
              </p>
              <p className="text-small text-text-muted">{copy.gaps.vacantSuited}</p>
            </li>
          ))}

          {thin.map((subteam) => (
            <li
              key={subteam}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-7"
            >
              <p className="text-caption font-semibold uppercase tracking-widest text-status-active">
                {copy.gaps.thinBadge}
              </p>
              <h3 className="text-h3 text-text">{subteam}</h3>
              <p className="text-body text-text-muted">
                {fill(copy.gaps.thinBody, { subteam })}
              </p>
              <p className="text-small text-text-muted">{copy.gaps.thinSuited}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Who we want ---------- */}
      <Section labelledBy="who-heading" className="border-b border-border">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="who-heading"
              eyebrow={copy.audience.eyebrow}
              title={copy.audience.title}
            />
            <p className="text-body text-text-muted">{copy.audience.body}</p>
            <p className="text-body text-text-muted">
              {fill(copy.audience.staticEventsNote, {
                competition: site.competition.name,
              })}
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {copy.benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <h3 className="text-h4 text-text">{benefit.title}</h3>
                <p className="mt-2 text-small text-text-muted">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------- Open roles ---------- */}
      <Section id="roles" labelledBy="roles-heading" className="border-b border-border">
        <SectionHeading
          id="roles-heading"
          eyebrow={copy.roles.eyebrow}
          title={copy.roles.title}
          lead={copy.roles.lead ?? undefined}
        />

        <div className="mt-12 flex flex-col gap-12">
          {roleGroups.map((group) => (
            <div key={group.subteam}>
              <h3 className="border-b border-border pb-3 text-h3 text-text">
                {group.subteam}
              </h3>
              <ul className="mt-6 grid gap-5 lg:grid-cols-2">
                {group.roles.map((role) => (
                  <li
                    key={role.title}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="text-h4 text-text">{role.title}</h4>
                      {/* Current size, not an invented number of places. */}
                      <p className="tabular text-caption font-semibold uppercase tracking-wider text-text-muted">
                        {headcountBySubteam.get(role.subteam) ?? 0}{" "}
                        {copy.roles.onSubteamLabel}
                      </p>
                    </div>
                    <p className="text-small text-text-muted">{role.description}</p>
                    <div className="mt-2">
                      <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                        {copy.roles.lookingForLabel}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {role.lookingFor.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-small text-text-muted"
                          >
                            <span
                              aria-hidden
                              className="mt-2 size-1 shrink-0 rounded-pill bg-accent"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Timeline ---------- */}
      <Section labelledBy="timeline-heading" className="border-b border-border">
        <SectionHeading
          id="timeline-heading"
          eyebrow={copy.season.eyebrow}
          title={copy.season.title}
          lead={copy.season.lead ?? undefined}
        />

        <ol className="mt-12 flex flex-col">
          {timeline.map((milestone) => (
            <li
              key={milestone.title}
              className="grid gap-3 border-b border-border py-6 last:border-0 md:grid-cols-[10rem_9rem_1fr] md:items-baseline md:gap-6"
            >
              <time
                dateTime={milestone.date}
                className="tabular text-small text-text-muted"
              >
                {DATE_FORMAT.format(new Date(`${milestone.date}T00:00:00Z`))}
              </time>
              <StatusPill
                labels={statusLabels}
                status={milestone.status}
                className="justify-self-start"
              />
              <div>
                <h3 className="text-h4 text-text">{milestone.title}</h3>
                <p className="mt-1 max-w-[70ch] text-small text-text-muted">
                  {milestone.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section labelledBy="faq-heading">
        <SectionHeading
          id="faq-heading"
          eyebrow={copy.faq.eyebrow}
          title={copy.faq.title}
        />
        <dl className="mt-12 grid gap-6 lg:grid-cols-2">
          {copy.faq.items.map((item) => (
            <div
              key={item.question}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <dt className="text-h4 text-text">{item.question}</dt>
              <dd className="mt-2 text-small text-text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------- Apply ---------- */}
      <Section tight className="border-t border-border bg-accent text-accent-contrast">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <h2 className="text-h2">{copy.apply.title}</h2>
            <p className="max-w-[56ch] text-lead opacity-90">{copy.apply.body}</p>
          </div>
          {/* On the accent band the standard variants would invert awkwardly, so
              both buttons take explicit on-accent treatment. Measured on
              --color-accent: solid navy label 7.29:1, the /70 border 4.02:1. */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <ObfuscatedEmailButton
              email={site.contactEmail}
              subject={copy.apply.emailSubject}
              label={copy.apply.emailLabel}
              size="lg"
              className="bg-bg text-text hover:bg-surface-raised"
            />
            <Button
              href={nav.cta.sponsor.href}
              size="lg"
              className="border-2 border-accent-contrast/70 bg-transparent text-accent-contrast hover:bg-accent-contrast/10"
            >
              {copy.apply.sponsorLink}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
