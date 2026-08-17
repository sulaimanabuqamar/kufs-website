import { Button } from "@/components/ui/Button";
import { Section, Eyebrow } from "@/components/ui/Section";
import { CTA } from "@/lib/nav";
import type { ReactNode } from "react";

/**
 * Header for an inner page: the single <h1>, an eyebrow and a lead.
 *
 * `stubNote` marks a page that is routed and metadata-complete but not yet
 * built out. It is written as a plain statement of what is coming rather than
 * filler — a visitor who lands here from search should still learn something
 * and still have somewhere to go.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  stubNote,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  stubNote?: string;
  children?: ReactNode;
}) {
  return (
    <Section>
      <div className="flex max-w-[62ch] flex-col gap-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-h1 text-text">{title}</h1>
        <p className="text-lead text-text-muted">{lead}</p>

        {stubNote ? (
          <div className="mt-4 rounded-lg border border-border bg-surface p-6">
            <p className="text-small text-text-muted">{stubNote}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button href={CTA.sponsor.href} size="sm">
                {CTA.sponsor.label}
              </Button>
              <Button href={CTA.join.href} size="sm" variant="secondary">
                {CTA.join.label}
              </Button>
            </div>
          </div>
        ) : null}

        {children}
      </div>
    </Section>
  );
}
