import type { Metadata } from "next";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StatusPill } from "@/components/ui/StatusPill";
import site from "@/content/site";
import { getMilestones, getRolesBySubteam } from "@/lib/content";
import { CTA } from "@/lib/nav";

const TITLE = "Join the Team";
const DESCRIPTION =
  "Open roles across every KUFS subteam — engineering and business. Recruitment timeline, what members get, and what we actually look for.";

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

const BENEFITS = [
  {
    title: "You build real hardware",
    body: "Not a coursework model. A part you specified gets machined, fitted, and either works at Silverstone or does not. Very few graduates have that on a CV.",
  },
  {
    title: "You travel to compete",
    body: "The team goes to Silverstone for Formula Student UK. Scrutineering, the paddock, a week alongside a hundred other university teams.",
  },
  {
    title: "You meet industry directly",
    body: "Design judges are practising engineers. Our partners run workshops, attend reviews and see your work. Several members have been hired off the back of it.",
  },
  {
    title: "You learn to ship against a deadline",
    body: "The competition date does not move. Learning to make decisions with incomplete information and a fixed date is the single most transferable thing here.",
  },
];

const FAQ = [
  {
    q: "How much time does it take?",
    a: "Realistically 6–10 hours a week through term, more in the weeks before manufacturing deadlines and competition. We would rather you commit to less and turn up reliably than promise more and disappear.",
  },
  {
    q: "What year do I need to be in?",
    a: "Any. First years are welcome and encouraged — you get three more seasons than someone joining in their final year, and the people running the team now mostly joined in first year.",
  },
  {
    q: "Do I need prior experience?",
    a: "No. Nobody arrives knowing how to lay up a monocoque or calibrate an engine. We teach it. What we cannot teach is turning up, so that is what we select for.",
  },
  {
    q: "I am not an engineer. Is there a place for me?",
    a: "Yes, and we need you more than we need another CFD applicant. Sponsorship, marketing, media and cost control are scored events and hard constraints — a car nobody funded does not get built.",
  },
  {
    q: "When can I apply?",
    a: "Recruitment opens at the start of the autumn term each year. Applications outside that window are still read — if we have a gap, we will come back to you.",
  },
];

export default function JoinPage() {
  const roleGroups = getRolesBySubteam();
  const timeline = getMilestones();
  const totalOpenings = roleGroups
    .flatMap((g) => g.roles)
    .reduce((sum, r) => sum + (r.openings ?? 0), 0);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section className="border-b border-border">
        <div className="flex max-w-[62ch] flex-col gap-6">
          <p className="text-eyebrow uppercase text-accent">Recruitment</p>
          <h1 className="text-h1 text-text">
            You do not need experience. You need to turn up.
          </h1>
          <SpeedStripe variant="accent" />
          <p className="text-lead text-text-muted">
            We recruit across every subteam each October, from first years to PhDs. Around{" "}
            {totalOpenings} places this season, and the majority of the people running the
            team now joined knowing nothing about race cars.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button href="#roles" size="lg">
              See open roles
            </Button>
            <Button href="/team" variant="secondary" size="lg">
              Meet the team
            </Button>
          </div>
        </div>
      </Section>

      {/* ---------- Who we want ---------- */}
      <Section labelledBy="who-heading" className="border-b border-border">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="who-heading"
              eyebrow="Who we are looking for"
              title="Engineers and non-engineers, equally"
            />
            <p className="text-body text-text-muted">
              Formula Student teams reliably over-recruit mechanical engineers and
              under-recruit everyone else. We are saying this plainly because it is the
              most useful thing on this page: if you study business, marketing, finance,
              communications or design, you are not a nice-to-have here. You are the
              reason the car gets funded, the reason anyone hears about it, and a third of
              the points available at competition.
            </p>
            <p className="text-body text-text-muted">
              Three of the eight scored events at Formula Student UK are static — Design,
              Cost, and the Business Plan Presentation. They are judged on documentation,
              commercial reasoning and how well you present, not on lap time.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {BENEFITS.map((benefit) => (
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
          eyebrow="Open roles"
          title="Where we need people"
          lead="Roles are editable in content/roles.json — this list is what we are actually recruiting for right now."
        />

        <div className="mt-12 flex flex-col gap-12">
          {roleGroups.map((group) => (
            <div key={group.subteam}>
              <div className="flex flex-col gap-2">
                <h3 className="text-h3 text-text">{group.subteam}</h3>
                <SpeedStripe variant="underline" />
              </div>
              <ul className="mt-6 grid gap-5 lg:grid-cols-2">
                {group.roles.map((role) => (
                  <li
                    key={role.title}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="text-h4 text-text">{role.title}</h4>
                      {role.openings ? (
                        <p className="tabular text-caption font-semibold uppercase tracking-wider text-accent">
                          {role.openings} {role.openings === 1 ? "place" : "places"}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-small text-text-muted">{role.description}</p>
                    <div className="mt-2">
                      <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                        What we look for
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
          eyebrow="The season"
          title="What you would be joining"
          lead="The build schedule you would be working to. Recruitment opens at the start of the autumn term, ahead of the manufacturing push."
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
              <StatusPill status={milestone.status} className="justify-self-start" />
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
        <SectionHeading id="faq-heading" eyebrow="Before you apply" title="Questions" />
        <dl className="mt-12 grid gap-6 lg:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-lg border border-border bg-surface p-6">
              <dt className="text-h4 text-text">{item.q}</dt>
              <dd className="mt-2 text-small text-text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------- Apply ---------- */}
      <Section tight className="border-t border-border bg-accent text-accent-contrast">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <h2 className="text-h2">Applications open each October</h2>
            <p className="max-w-[56ch] text-lead opacity-90">
              Send us a short email telling us what you study and which subteam interests
              you. That is the whole application — we will take it from there.
            </p>
          </div>
          {/* On the accent band the standard variants would invert awkwardly, so
              both buttons take explicit on-accent treatment. Measured on
              --color-accent: solid navy label 7.29:1, the /70 border 4.02:1. */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button
              href={`mailto:${site.contactEmail}?subject=${encodeURIComponent(
                "Joining KUFS",
              )}`}
              size="lg"
              className="bg-bg text-text hover:bg-surface-raised"
            >
              Email us to apply
            </Button>
            <Button
              href={CTA.sponsor.href}
              size="lg"
              className="border-2 border-accent-contrast/70 bg-transparent text-accent-contrast hover:bg-accent-contrast/10"
            >
              I want to sponsor instead
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
