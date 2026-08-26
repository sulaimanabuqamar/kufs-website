import Link from "next/link";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Section } from "@/components/ui/Section";
import { getCopy, getNav } from "@/lib/content";
import type { ReactNode } from "react";

/**
 * Header for an inner page: the single <h1>, an eyebrow, the speed stripe and
 * a lead.
 *
 * LAYOUT: two columns at lg, copy left and a panel right — never a lone
 * left-hand measure against empty navy.
 *
 * The alternative was centring the column. It was rejected because the home
 * hero already sets a left-copy / right-visual composition, and centring every
 * inner page would read as a different site; because a centred long measure on
 * a dark ground reads as a blog rather than a team site; and because on the
 * commercial pages the right-hand slot is genuinely useful — enquiry steps on
 * /become-a-sponsor, partner counts on /sponsors, recruitment facts on /join.
 * Filling it with something load-bearing is a better answer than removing the
 * space. Applied consistently across every inner page header.
 *
 * `comingSoon` marks a page that is routed and metadata-complete but not yet
 * built out, and supplies that right-hand panel. It is deliberately not a blank
 * page: someone landing here from search or from a sponsor deck should still
 * learn what will be here and have live routes to go to instead.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  comingSoon,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** What this page will contain, in a sentence. Renders the coming-soon card. */
  comingSoon?: string;
  children?: ReactNode;
}) {
  const nav = getNav();
  const copy = getCopy("common");

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex max-w-[58ch] flex-col gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-h1 text-text">{title}</h1>
          <SpeedStripe variant="accent" />
          <p className="text-lead text-text-muted">{lead}</p>
          {children}
        </div>

        {comingSoon ? (
          <aside className="self-start rounded-lg border border-border bg-surface p-7">
            <p className="text-caption font-semibold uppercase tracking-widest text-accent">
              {copy.comingSoon.badge}
            </p>
            <p className="mt-3 text-body text-text-muted">{comingSoon}</p>
            <p className="mt-3 text-small text-text-muted">{copy.comingSoon.body}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={nav.cta.sponsor.href} size="md">
                {nav.cta.sponsor.label}
              </Button>
              <Button href={nav.cta.join.href} size="md" variant="secondary">
                {nav.cta.join.label}
              </Button>
            </div>
            <p className="mt-5 text-small">
              <Link
                href="/"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                {copy.comingSoon.backLink}
              </Link>
            </p>
          </aside>
        ) : null}
      </div>
    </Section>
  );
}
