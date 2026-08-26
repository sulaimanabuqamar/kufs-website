import type { Metadata } from "next";

import { KufsLogo } from "@/components/brand/KufsLogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getCopy } from "@/lib/content";

const { title: TITLE, description: DESCRIPTION } = getCopy("press-kit").meta;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/press-kit" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/press-kit" },
};

/**
 * Routed, and only partly built out. The logo lockups are here because they
 * are ready and because a journalist on a deadline needs them more than they
 * need the rest of the page. Photography and the fact sheet follow.
 */
export default function Page() {
  const copy = getCopy("press-kit");
  const logoAlt = getCopy("common").ui.logoAlt;

  return (
    <>
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        lead={copy.header.lead}
        comingSoon={copy.comingSoon}
      />

      <Section labelledBy="lockups-heading" className="border-t border-border">
        <SectionHeading
          id="lockups-heading"
          eyebrow={copy.lockups.eyebrow}
          title={copy.lockups.title}
          lead={copy.lockups.lead}
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7">
            <KufsLogo alt={logoAlt} on="dark" width={260} />
            <p className="mt-auto text-caption text-text-muted">
              {copy.lockups.captions[0]}
            </p>
          </li>
          <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7">
            <KufsLogo alt={logoAlt} on="dark" withTagline width={260} />
            <p className="mt-auto text-caption text-text-muted">
              {copy.lockups.captions[1]}
            </p>
          </li>
          <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7">
            {/* Single-colour lockup — the variant to use at small sizes. */}
            <KufsLogo alt={logoAlt} on="dark" variant="mono" width={260} />
            <p className="mt-auto text-caption text-text-muted">
              {copy.lockups.captions[2]}
            </p>
          </li>
          <li className="surface-light flex flex-col gap-4 rounded-lg border border-border-light bg-bg-light p-7">
            <KufsLogo alt={logoAlt} on="light" width={260} />
            <p className="mt-auto text-caption text-muted-on-light">
              {copy.lockups.captions[3]}
            </p>
          </li>
        </ul>

        <p className="mt-8 max-w-[62ch] text-small text-text-muted">
          {copy.lockups.clearSpaceNote}
        </p>
      </Section>
    </>
  );
}
