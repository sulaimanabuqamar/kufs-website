import Link from "next/link";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Section } from "@/components/ui/Section";
import { CTA } from "@/lib/nav";
import type { ReactNode } from "react";

/**
 * Header for an inner page: the single <h1>, an eyebrow, the speed stripe and
 * a lead.
 *
 * `comingSoon` marks a page that is routed and metadata-complete but not yet
 * built out. It is deliberately not a blank page: someone landing here from
 * search or from a sponsor deck should still learn what will be here, when,
 * and have two live routes to go to instead.
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
  return (
    <Section>
      <div className="flex max-w-[62ch] flex-col gap-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-h1 text-text">{title}</h1>
        <SpeedStripe variant="accent" />
        <p className="text-lead text-text-muted">{lead}</p>

        {comingSoon ? (
          <div className="mt-6 rounded-lg border border-border bg-surface p-7">
            <p className="text-caption font-semibold uppercase tracking-widest text-accent">
              Coming soon
            </p>
            <p className="mt-3 text-body text-text-muted">{comingSoon}</p>
            <p className="mt-3 text-small text-text-muted">
              In the meantime, the fastest route in is a direct message or an email — we
              answer both.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={CTA.sponsor.href} size="md">
                {CTA.sponsor.label}
              </Button>
              <Button href={CTA.join.href} size="md" variant="secondary">
                {CTA.join.label}
              </Button>
            </div>
            <p className="mt-5 text-small">
              <Link
                href="/"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                ← Back to the home page
              </Link>
            </p>
          </div>
        ) : null}

        {children}
      </div>
    </Section>
  );
}
