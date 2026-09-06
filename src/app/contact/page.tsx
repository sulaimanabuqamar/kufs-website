import type { Metadata } from "next";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ObfuscatedEmail } from "@/components/ui/ObfuscatedEmail";
import site from "@/content/site";
import { getCopy } from "@/lib/content";
import { formspreeEndpoint } from "@/lib/env";
import { entityEncode } from "@/lib/obfuscateEmail";

const { title: TITLE, description: DESCRIPTION } = getCopy("contact").meta;

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
 * Every route is also printed as a real mailto link, so the page is useful
 * even if the form is unavailable and even if JavaScript never runs. The
 * addresses are entity-encoded against harvesting — see
 * src/lib/obfuscateEmail.ts — which is a rendering detail and changes neither
 * of those properties.
 */

type Route = {
  value: string;
  label: string;
  email: string;
  blurb: string;
  responseTime: string;
};

export default function ContactPage() {
  const copy = getCopy("contact");
  const endpoint = formspreeEndpoint();
  const formCopy = getCopy("common").form;

  // The words come from copy; the ADDRESS each route points at does not.
  // "Press and media" pointing at the sponsorship inbox is a routing mistake
  // an editor cannot see the consequences of, so that mapping stays here.
  const routeEmail: Record<(typeof copy.routes.items)[number]["key"], string> = {
    sponsorship: site.sponsorshipEmail,
    joining: site.contactEmail,
    press: site.contactEmail,
    general: site.contactEmail,
  };

  const routes: Route[] = copy.routes.items.map((item): Route => ({
    value: item.key,
    label: item.label,
    email: routeEmail[item.key],
    blurb: item.blurb,
    responseTime: item.responseTime,
  }));

  return (
    <>
      {/* ---------- Header ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">{copy.header.eyebrow}</p>
            <h1 className="text-h1 text-text">{copy.header.title}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{copy.header.lead}</p>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">{copy.location.heading}</h2>
            <dl className="flex flex-col gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.location.teamLabel}
                </dt>
                <dd className="text-body text-text">{site.longName}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.location.basedAtLabel}
                </dt>
                {/* BLOCKED ON THE TEAM: which campus and building the
                    workshop is in. Until it is confirmed this deliberately
                    shows only the university and the city, which are both
                    true — it does not name a building we are unsure of. */}
                <dd className="text-body text-text">
                  {site.university}
                  <br />
                  {copy.location.city}
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.location.generalLabel}
                </dt>
                <dd className="text-body">
                  <ObfuscatedEmail
                    email={site.contactEmail}
                    className="font-semibold text-accent underline-offset-4 hover:underline"
                  />
                </dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.location.followLabel}
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
          eyebrow={copy.routes.eyebrow}
          title={copy.routes.title}
          lead={copy.routes.lead ?? undefined}
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
                <ObfuscatedEmail
                  email={route.email}
                  subject={`${route.label} — KUFS`}
                  className="text-small font-semibold text-accent underline-offset-4 hover:underline"
                />
              </p>
              <p className="text-caption text-text-muted">
                {copy.routes.answeredLabel} {route.responseTime}.
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
              eyebrow={copy.form.eyebrow}
              title={copy.form.title}
              lead={copy.form.lead ?? undefined}
            />
            <div className="rounded-lg border-2 border-border-light bg-surface-light p-6">
              <h3 className="text-h4 text-text-on-light">{copy.sponsorNote.title}</h3>
              <p className="mt-2 text-small text-muted-on-light">
                {copy.sponsorNote.bodyBefore}{" "}
                <a
                  href="/become-a-sponsor"
                  className="font-semibold text-accent-on-light underline underline-offset-2"
                >
                  {copy.sponsorNote.linkLabel}
                </a>{" "}
                {copy.sponsorNote.bodyAfter}
              </p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border-light bg-surface-light p-6 sm:p-8">
            <h3 className="text-h4 text-text-on-light">{copy.form.heading}</h3>
            <p className="mt-2 mb-6 text-small text-muted-on-light">{copy.form.note}</p>
            <EnquiryForm
              copy={formCopy}
              endpoint={endpoint}
              toEmailEncoded={entityEncode(site.contactEmail)}
              subject={copy.form.subject}
              topicLabel={copy.form.topicLabel}
              topicPlaceholder={copy.form.topicPlaceholder}
              topicRequired
              showOrganisation={false}
              topicOptions={routes.map((r) => ({ value: r.value, label: r.label }))}
              event="Join CTA"
              responseTime={copy.responseTime}
              messagePlaceholder={copy.form.messagePlaceholder}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
