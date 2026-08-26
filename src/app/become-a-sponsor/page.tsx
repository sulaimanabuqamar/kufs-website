import type { Metadata } from "next";

import { SmoothHashScroll } from "@/components/SmoothHashScroll";
import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { TierTable } from "@/components/sponsorship/TierTable";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getCopy, getTeamStats, getTiers } from "@/lib/content";
import { fill } from "@/lib/copy";
import { formspreeEndpoint } from "@/lib/env";
import { SPONSOR_TIERS, TIER_LABEL } from "@/lib/tiers";

const { title: TITLE, description: DESCRIPTION } = getCopy("become-a-sponsor").meta;

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

/**
 * The commercial page. Written for a marketing or engineering-recruitment
 * decision-maker, not for students — they arrive via /join.
 *
 * Most of the page runs on the light palette: sponsor-facing tables and logo
 * walls read better on light, and it is the only place Racing Red is a usable
 * accent (6.27:1 on --color-bg-light, against 2.12:1 on navy).
 */
export default function BecomeASponsorPage() {
  const copy = getCopy("become-a-sponsor");
  const tiers = getTiers();
  const { sponsorship } = site;
  const endpoint = formspreeEndpoint();
  const formCopy = getCopy("common").form;
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
            <p className="text-eyebrow uppercase text-accent">{copy.header.eyebrow}</p>
            <h1 className="text-h1 text-text">{copy.header.title}</h1>
            <SpeedStripe variant="accent" />
            {/* Reframed from track record to founding partner. KUFS has never
                competed, so a pitch built on results would be a lie — and a
                founding season is the stronger story anyway, because it is
                the one thing that can never be offered again. */}
            <p className="text-lead text-text-muted">
              {fill(copy.header.body, {
                longName: site.longName,
                university: site.university,
                architecture: site.vehicle.architecture.toLowerCase(),
                competition: site.competition.name,
                year: site.competition.year,
                venue: site.competition.venue,
              })}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="#tiers" size="lg">
                {copy.header.tiersLink}
              </Button>
              <Button href="#enquire" variant="secondary" size="lg">
                {copy.header.contactLink}
              </Button>
            </div>
          </div>

          <aside className="flex flex-col gap-5 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">{copy.process.heading}</h2>
            <ol className="flex flex-col gap-4 border-t border-border pt-5">
              {copy.process.steps.map((item, index) => (
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
            <p className="mt-1 text-caption text-text-muted">{copy.process.inKindNote}</p>
          </aside>
        </div>
      </Section>

      {/* ---------- Why sponsor us ---------- */}
      <Section labelledBy="why-heading" className="border-b border-border">
        <SectionHeading
          id="why-heading"
          eyebrow={copy.reasons.eyebrow}
          title={copy.reasons.title}
          lead={copy.reasons.lead ?? undefined}
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
                    <abbr title={copy.reasons.tbcTooltip} className="no-underline">
                      {copy.reasons.tbcLabel}
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
          eyebrow={copy.tiers.eyebrow}
          title={copy.tiers.title}
          lead={copy.tiers.lead ?? undefined}
        />
        <div className="mt-12">
          <TierTable
            tiers={tiers}
            aedToUsd={site.aedToUsd}
            copy={getCopy("common").tierTable}
          />
        </div>

        {/* Both of these are carried verbatim from the team's sponsorship pack
            and must stay next to the table. They are the conditions the offer
            is actually made under. */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border-light pt-6">
          <p className="max-w-[76ch] text-small text-muted-on-light">
            {copy.tiers.inKindFootnote}
          </p>
          <p className="max-w-[76ch] text-small text-muted-on-light">
            {copy.tiers.liveryFootnote}
          </p>
          <p className="mt-2 max-w-[76ch] text-caption text-muted-on-light">
            {copy.tiers.currencyFootnote}
          </p>
        </div>
      </Section>

      {/* ---------- In-kind ---------- */}
      <Section labelledBy="inkind-heading" className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              id="inkind-heading"
              eyebrow={copy.inKind.eyebrow}
              title={copy.inKind.title}
              lead={copy.inKind.lead ?? undefined}
            />
            <p className="text-body text-text-muted">{copy.inKind.body}</p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {copy.inKind.categories.map((item) => (
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
              eyebrow={copy.enquiry.eyebrow}
              title={copy.enquiry.title}
              lead={copy.enquiry.lead ?? undefined}
            />

            <div className="rounded-lg border-2 border-border-light bg-surface-light p-6">
              <h3 className="text-h4 text-text-on-light">
                {copy.enquiry.prospectusHeading}
              </h3>
              {sponsorship.prospectusAvailable ? (
                <>
                  <p className="mt-2 text-small text-muted-on-light">
                    {copy.enquiry.prospectusAvailable}
                  </p>
                  <Button
                    href={sponsorship.prospectusPath}
                    variant="onLight"
                    className="mt-5"
                    download
                  >
                    {copy.enquiry.prospectusDownloadLabel}
                  </Button>
                </>
              ) : (
                <>
                  {/* The PDF is not committed yet. Rather than ship a button that
                      404s, the CTA becomes a request — and the email is prefilled
                      so it costs the visitor nothing. */}
                  <p className="mt-2 text-small text-muted-on-light">
                    {copy.enquiry.prospectusUnavailable}
                  </p>
                  <Button
                    href={`mailto:${sponsorship.enquiryEmail}?subject=${encodeURIComponent(
                      copy.enquiry.prospectusRequestSubject,
                    )}`}
                    variant="onLightSecondary"
                    className="mt-5"
                  >
                    {copy.enquiry.prospectusRequestLabel}
                  </Button>
                </>
              )}
            </div>

            <div className="text-small text-muted-on-light">
              <p>
                {copy.enquiry.directHeading}{" "}
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
            <h3 className="text-h4 text-text-on-light">{copy.enquiry.formHeading}</h3>
            <p className="mt-2 mb-6 text-small text-muted-on-light">
              {copy.enquiry.formNote}
            </p>
            <EnquiryForm
              copy={formCopy}
              endpoint={endpoint}
              toEmail={sponsorship.enquiryEmail}
              subject={copy.enquiry.formSubject}
              topicLabel={copy.enquiry.tierLabel}
              topicPlaceholder={copy.enquiry.tierPlaceholder}
              topicOptions={SPONSOR_TIERS.map((tier) => ({
                value: tier,
                label: TIER_LABEL[tier],
              }))}
              event="Sponsor CTA"
              messagePlaceholder={copy.enquiry.messagePlaceholder}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
