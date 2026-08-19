import type { Metadata } from "next";

import { SmoothHashScroll } from "@/components/SmoothHashScroll";
import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { TierTable } from "@/components/sponsorship/TierTable";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getTeamStats, getTiers } from "@/lib/content";
import { formspreeEndpoint } from "@/lib/env";
import { SPONSOR_TIERS, TIER_LABEL } from "@/lib/tiers";

const TITLE = "Become a Sponsor";
const DESCRIPTION =
  "Sponsorship tiers, what each one includes, and how to start a conversation with the KUFS partnerships team. Cash, materials, machining or expertise.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/become-a-sponsor" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/become-a-sponsor" },
};

/**
 * What a sponsor gets after they write to us. Concrete and checkable — vague
 * promises are what make a student team read as a student team.
 */
const ENQUIRY_STEPS = [
  {
    title: "We reply within two working days",
    body: "From a person on the partnerships team, not an autoresponder.",
  },
  {
    title: "You get a written proposal",
    body: "Which tier fits, what your logo goes on, and what we will report back at the end of the season.",
  },
  {
    title: "We agree it before you commit",
    body: "Nothing is invoiced until the deliverables are written down and you have signed them off, subject to university approval.",
  },
] as const;

/**
 * The commercial page. Written for a marketing or engineering-recruitment
 * decision-maker, not for students — they arrive via /join.
 *
 * Most of the page runs on the light palette: sponsor-facing tables and logo
 * walls read better on light, and it is the only place Racing Red is a usable
 * accent (6.27:1 on --color-bg-light, against 2.12:1 on navy).
 */
export default function BecomeASponsorPage() {
  const tiers = getTiers();
  const { sponsorship } = site;
  const endpoint = formspreeEndpoint();
  const stats = getTeamStats();

  return (
    <>
      {/* Only mounted on the pages that have in-page anchors. It used to sit in
          the root layout, which shipped a global click listener to every route
          for a feature two pages use. */}
      <SmoothHashScroll />
      {/* ---------- Hero ---------- */}
      {/* Two columns, not a lone left-hand measure. Every inner page header on
          this site pairs the copy with something load-bearing on the right —
          see the note in src/components/ui/PageHeader.tsx for why that beats
          centring. Here the right column answers the question a sponsor asks
          straight after "why": what actually happens if I get in touch. */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[60ch] flex-col gap-6">
            <p className="text-eyebrow uppercase text-accent">
              Founding partnership · Season one
            </p>
            <h1 className="text-h1 text-text">
              Be on the first car this university has ever built
            </h1>
            <SpeedStripe variant="accent" />
            {/* Reframed from track record to founding partner. KUFS has never
                competed, so a pitch built on results would be a lie — and a
                founding season is the stronger story anyway, because it is
                the one thing that can never be offered again. */}
            <p className="text-lead text-text-muted">
              {site.longName} is building Khalifa University&rsquo;s first Formula Student
              car — a {site.vehicle.architecture.toLowerCase()} single-seater for{" "}
              {site.competition.name} {site.competition.year} at {site.competition.venue}.
              There is exactly one season in which a company can be a founding partner of
              this programme, and this is it.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="#tiers" size="lg">
                See the tiers
              </Button>
              <Button href="#enquire" variant="secondary" size="lg">
                Talk to us
              </Button>
            </div>
          </div>

          <aside className="flex flex-col gap-5 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">What happens when you get in touch</h2>
            <ol className="flex flex-col gap-4 border-t border-border pt-5">
              {ENQUIRY_STEPS.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="tabular flex size-7 shrink-0 items-center justify-center rounded-pill bg-accent text-caption font-bold text-accent-contrast"
                  >
                    {index + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-small font-semibold text-text">
                      {item.title}
                    </span>
                    <span className="text-caption text-text-muted">{item.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-1 text-caption text-text-muted">
              In-kind support — parts, machining, materials, software — is worth as much
              to us as cash. Ask either way.
            </p>
          </aside>
        </div>
      </Section>

      {/* ---------- Why sponsor us ---------- */}
      <Section labelledBy="why-heading" className="border-b border-border">
        <SectionHeading
          id="why-heading"
          eyebrow="Why KUFS"
          title="What a partnership actually buys"
          lead="Four things, and we would rather be specific about them than promise exposure. We have no results to trade on yet — so this is what we can actually offer."
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {sponsorship.reasons.map((reason) => (
            <li
              key={reason.title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-7"
            >
              <h3 className="text-h4 text-text">{reason.title}</h3>
              <p className="text-small text-text-muted">{reason.body}</p>
              <p className="mt-auto flex items-baseline gap-2 pt-4">
                <span className="tabular text-h3 text-accent">
                  {/* Roster-derived figures are computed, so they cannot drift.
                      Anything still unconfirmed renders TBC — inventing a reach
                      figure for a sponsor deck is how teams lose sponsors. */}
                  {(reason.stat.computed === "headcount"
                    ? String(stats.headcount)
                    : reason.stat.computed === "disciplines"
                      ? String(stats.disciplines)
                      : reason.stat.value) ?? (
                    <abbr title="To be confirmed with the team" className="no-underline">
                      TBC
                    </abbr>
                  )}
                </span>
                <span className="text-caption uppercase tracking-wider text-text-muted">
                  {reason.stat.label}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Tier table (light) ---------- */}
      <Section id="tiers" tone="light" labelledBy="tiers-heading">
        <SectionHeading
          id="tiers-heading"
          tone="light"
          eyebrow="Packages"
          title="Sponsorship tiers"
          lead="Every tier is compared on the same eight things, so you can read across a row rather than hunt for what was left out. Not sure which fits? Tell us what you had in mind and we will advise."
        />
        <div className="mt-12">
          <TierTable tiers={tiers} aedToUsd={site.aedToUsd} />
        </div>

        {/* Both of these are carried verbatim from the team's sponsorship pack
            and must stay next to the table. They are the conditions the offer
            is actually made under. */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border-light pt-6">
          <p className="max-w-[76ch] text-small text-muted-on-light">
            Benefits and recognition will be agreed according to the value, relevance and
            impact of the contribution, subject to university approval.
          </p>
          <p className="max-w-[76ch] text-small text-muted-on-light">
            Vehicle and logo placement is illustrative and subject to final livery design,
            university approval and competition regulations.
          </p>
          <p className="mt-2 max-w-[76ch] text-caption text-muted-on-light">
            Amounts are in UAE dirhams. Dollar equivalents are indicative only, at a fixed
            reference rate — the dirham is pegged, but these are not quoted prices.
          </p>
        </div>
      </Section>

      {/* ---------- In-kind ---------- */}
      <Section labelledBy="inkind-heading" className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="inkind-heading"
              eyebrow="In-kind"
              title="You do not have to write us a cheque"
              lead="A large share of Formula Student sponsorship is parts, not cash — and it is often worth more to us than the equivalent money, because it comes with expertise attached."
            />
            <p className="text-body text-text-muted">
              We value in-kind contributions at market rate and place you at the
              equivalent tier, with the same benefits. If you are not sure whether what
              you do is useful to us, ask — the answer is usually yes.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                title: "Materials and vehicle components",
                body: "Steel, fasteners, composites, cells, motors, inverters — anything that ends up bolted to the car.",
              },
              {
                title: "Manufacturing and machining services",
                body: "Welding, five-axis work, waterjet, sheet metal. Turnaround matters as much as capacity.",
              },
              {
                title: "Software and engineering tools",
                body: "CAD, CFD, FEA, lap simulation, data acquisition and PCB tooling licences.",
              },
              {
                title: "Equipment and testing support",
                body: "Dyno time, rig time, measurement equipment, or somewhere safe to run the car.",
              },
              {
                title: "Transportation and logistics",
                body: "Freight from Abu Dhabi to Silverstone and back — one of our largest fixed costs.",
              },
              {
                title: "Technical consultation and expertise",
                body: "Design review attendance, mentoring, or a day of an engineer's time. Often worth more than the equivalent cash.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-md border border-border bg-surface p-5"
              >
                <h3 className="text-h4 text-text">{item.title}</h3>
                <p className="mt-1 text-small text-text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------- Prospectus + enquiry (light) ---------- */}
      <Section id="enquire" tone="light" labelledBy="enquire-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              id="enquire-heading"
              tone="light"
              eyebrow="Next step"
              title="Start the conversation"
              lead="Tell us roughly what you have in mind and we will come back with a concrete proposal, usually within two working days."
            />

            <div className="rounded-lg border-2 border-border-light bg-surface-light p-6">
              <h3 className="text-h4 text-text-on-light">Sponsorship prospectus</h3>
              {sponsorship.prospectusAvailable ? (
                <>
                  <p className="mt-2 text-small text-muted-on-light">
                    The full pack: tiers, deliverables, reach figures and last
                    season&rsquo;s report.
                  </p>
                  <Button
                    href={sponsorship.prospectusPath}
                    variant="onLight"
                    className="mt-5"
                    download
                  >
                    Download the prospectus (PDF)
                  </Button>
                </>
              ) : (
                <>
                  {/* The PDF is not committed yet. Rather than ship a button that
                      404s, the CTA becomes a request — and the email is prefilled
                      so it costs the visitor nothing. */}
                  <p className="mt-2 text-small text-muted-on-light">
                    The written prospectus is being finalised for this season. Ask us for
                    it and we will send it the moment it is ready — usually the same week.
                  </p>
                  <Button
                    href={`mailto:${sponsorship.enquiryEmail}?subject=${encodeURIComponent(
                      "Request: KUFS sponsorship prospectus",
                    )}`}
                    variant="onLightSecondary"
                    className="mt-5"
                  >
                    Request the prospectus
                  </Button>
                </>
              )}
            </div>

            <div className="text-small text-muted-on-light">
              <p>
                Prefer to talk directly?{" "}
                <a
                  href={`mailto:${sponsorship.enquiryEmail}`}
                  className="font-semibold text-accent-on-light underline underline-offset-2"
                >
                  {sponsorship.enquiryEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border-light bg-surface-light p-6 sm:p-8">
            <h3 className="text-h4 text-text-on-light">Sponsorship enquiry</h3>
            <p className="mt-2 mb-6 text-small text-muted-on-light">
              All fields are required except the tier, which we are happy to advise on.
            </p>
            <EnquiryForm
              endpoint={endpoint}
              toEmail={sponsorship.enquiryEmail}
              subject="Sponsorship enquiry — KUFS"
              topicLabel="Tier of interest"
              topicPlaceholder="Not sure yet — advise me"
              topicOptions={SPONSOR_TIERS.map((tier) => ({
                value: tier,
                label: TIER_LABEL[tier],
              }))}
              event="Sponsor CTA"
              messagePlaceholder="What you are interested in, and anything you would want from a partnership."
            />
          </div>
        </div>
      </Section>
    </>
  );
}
