import type { Metadata } from "next";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { SponsorEnquiryForm } from "@/components/sponsorship/SponsorEnquiryForm";
import { TierTable } from "@/components/sponsorship/TierTable";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getTiers } from "@/lib/content";

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

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section className="border-b border-border">
        <div className="flex max-w-[64ch] flex-col gap-6">
          <p className="text-eyebrow uppercase text-accent">Partnership</p>
          <h1 className="text-h1 text-text">Put your name on a car that finishes</h1>
          <SpeedStripe variant="accent" />
          <p className="text-lead text-text-muted">
            {site.longName} designs, manufactures and races a single-seat car against the
            best university teams in the world. Partnering with us buys engineering
            visibility, a graduate pipeline that has already been tested against a
            deadline, and a team that reports back in writing at the end of every season.
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
      </Section>

      {/* ---------- Why sponsor us ---------- */}
      <Section labelledBy="why-heading" className="border-b border-border">
        <SectionHeading
          id="why-heading"
          eyebrow="Why KUFS"
          title="What a partnership actually buys"
          lead="Four things, and we would rather be specific about them than promise exposure."
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
                  {/* Numbers we have not confirmed render as TBC. Inventing a
                      reach figure for a sponsor deck is how teams lose sponsors. */}
                  {reason.stat.value ?? (
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
          lead="Every tier is compared on the same seven things. Amounts are being set by the team and are marked TBC until then — talk to us and we will tell you where you would sit."
        />
        <div className="mt-12">
          <TierTable tiers={tiers} />
        </div>

        <p className="mt-8 text-caption text-muted-on-light">
          Tiers and benefits are editable in{" "}
          <code className="font-mono">content/tiers.json</code>.
        </p>
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
                title: "Machining and fabrication",
                body: "Five-axis work on uprights, hubs and suspension components. Welding and inspection sign-off.",
              },
              {
                title: "Materials",
                body: "Carbon fibre, aluminium stock, fasteners, adhesives, tooling board.",
              },
              {
                title: "Composites",
                body: "Autoclave time, layup facilities, laminate engineering support.",
              },
              {
                title: "Software licences",
                body: "CAD, CFD, FEA, data acquisition and simulation tooling.",
              },
              {
                title: "Logistics",
                body: "Freight to Silverstone and back — one of our largest fixed costs.",
              },
              {
                title: "Expertise",
                body: "Design review attendance, mentoring, or a day of an engineer's time.",
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
            <SponsorEnquiryForm to={sponsorship.enquiryEmail} />
          </div>
        </div>
      </Section>
    </>
  );
}
