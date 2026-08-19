import type { Metadata } from "next";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { formspreeEndpoint } from "@/lib/env";

const TITLE = "Contact";
const DESCRIPTION =
  "How to reach Khalifa University Formula Student — sponsorship, joining the team, press and general enquiries, with the right address for each.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/contact" },
};

/**
 * Contact.
 *
 * Built around an enquiry-type router rather than a single inbox. A student
 * asking about joining and a company asking about title sponsorship need
 * different people, and making the visitor guess is how enquiries get lost —
 * or worse, how a sponsorship email sits unread in a general inbox for a week.
 *
 * Every route is also printed as a plain mailto, so the page is useful even if
 * the form is unavailable and even if JavaScript never runs.
 */

type Route = {
  value: string;
  label: string;
  email: string;
  blurb: string;
  responseTime: string;
};

export default function ContactPage() {
  const endpoint = formspreeEndpoint();

  const routes: Route[] = [
    {
      value: "sponsorship",
      label: "Sponsorship and partnerships",
      email: site.sponsorshipEmail,
      blurb:
        "Cash, materials, machining, software or logistics. Our partnerships lead answers these.",
      responseTime: "within two working days",
    },
    {
      value: "joining",
      label: "Joining the team",
      email: site.contactEmail,
      blurb:
        "Open roles across every subteam, engineering and business. No prior experience expected.",
      responseTime: "within a week during term",
    },
    {
      value: "press",
      label: "Press and media",
      email: site.contactEmail,
      blurb:
        "Interviews, imagery, and the team fact sheet. Tell us your deadline and we will work to it.",
      responseTime: "within two working days",
    },
    {
      value: "general",
      label: "Something else",
      email: site.contactEmail,
      blurb: "Questions about the car, the competition, or working with the university.",
      responseTime: "within a week",
    },
  ];

  return (
    <>
      {/* ---------- Header ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">Get in touch</p>
            <h1 className="text-h1 text-text">Talk to us</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">
              Sponsorship, recruitment, press, or a question about the car. Pick the right
              route below and the person who can actually answer will reply.
            </p>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">Where to find us</h2>
            <dl className="flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  The team
                </dt>
                <dd className="text-body text-text">{site.longName}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Based at
                </dt>
                {/* TODO(contact): confirm the campus and building the team
                    workshop is in before launch. */}
                <dd className="text-body text-text">
                  {site.university}
                  <br />
                  Abu Dhabi, United Arab Emirates
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  General enquiries
                </dt>
                <dd className="text-body">
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {site.contactEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  Follow the build
                </dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-1">
                  {site.socials.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-small text-accent underline-offset-4 hover:underline"
                    >
                      {social.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      {/* ---------- Routes ---------- */}
      <Section labelledBy="routes-heading" className="border-b border-border">
        <SectionHeading
          id="routes-heading"
          eyebrow="Enquiry types"
          title="Who answers what"
          lead="Writing to the right address is the fastest way to get a reply. All four are monitored by a person on the team."
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {routes.map((route) => (
            <li
              key={route.value}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
            >
              <h3 className="text-h4 text-text">{route.label}</h3>
              <p className="text-small text-text-muted">{route.blurb}</p>
              <p className="mt-auto pt-3">
                <a
                  href={`mailto:${route.email}?subject=${encodeURIComponent(
                    `${route.label} — KUFS`,
                  )}`}
                  className="text-small font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {route.email}
                </a>
              </p>
              <p className="text-caption text-text-muted">
                Typically answered {route.responseTime}.
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Form ---------- */}
      <Section id="message" tone="light" labelledBy="message-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              id="message-heading"
              tone="light"
              eyebrow="Or just write"
              title="Send us a message"
              lead="If you are not sure which route fits, use this and we will pass it to the right person."
            />
            <div className="rounded-lg border-2 border-border-light bg-surface-light p-6">
              <h3 className="text-h4 text-text-on-light">Sponsorship enquiries</h3>
              <p className="mt-2 text-small text-muted-on-light">
                If you are here to discuss a partnership, the{" "}
                <a
                  href="/become-a-sponsor"
                  className="font-semibold text-accent-on-light underline underline-offset-2"
                >
                  Become a Sponsor
                </a>{" "}
                page has the tiers, the deliverables and a dedicated form — it will get
                you a more useful first reply.
              </p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border-light bg-surface-light p-6 sm:p-8">
            <h3 className="text-h4 text-text-on-light">Message the team</h3>
            <p className="mt-2 mb-6 text-small text-muted-on-light">
              All fields are required. We will route it to the right person.
            </p>
            <EnquiryForm
              endpoint={endpoint}
              toEmail={site.contactEmail}
              subject="Website enquiry — KUFS"
              topicLabel="Enquiry type"
              topicPlaceholder="Choose an enquiry type"
              topicRequired
              showOrganisation={false}
              topicOptions={routes.map((r) => ({ value: r.value, label: r.label }))}
              event="Join CTA"
              responseTime="within two working days"
              messagePlaceholder="What you would like to know."
            />
          </div>
        </div>
      </Section>
    </>
  );
}
