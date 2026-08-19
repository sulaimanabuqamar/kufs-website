import type { Metadata } from "next";

import { KufsLogo } from "@/components/brand/KufsLogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section, SectionHeading } from "@/components/ui/Section";

const TITLE = "Press Kit";
const DESCRIPTION =
  "Downloadable logos, photography and team information for press and media enquiries.";

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
  return (
    <>
      <PageHeader
        eyebrow={"Media"}
        title={"Logos, imagery and team facts"}
        lead={
          "High-resolution car photography, the KUFS logo in every format, a one-page fact sheet and our media contact."
        }
        comingSoon={
          "Approved photography and a fact sheet covering the team, the car and our competition history. The logo lockups below are already final — email us for anything else and we will send it directly."
        }
      />

      <Section labelledBy="lockups-heading" className="border-t border-border">
        <SectionHeading
          id="lockups-heading"
          eyebrow="Brand"
          title="Logo lockups"
          lead="Pick by background. The full-colour marks are for normal use; the single-colour marks are for small sizes and one-colour printing."
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7">
            <KufsLogo on="dark" width={260} />
            <p className="mt-auto text-caption text-text-muted">
              Full colour, dark backgrounds. The default.
            </p>
          </li>
          <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7">
            <KufsLogo on="dark" withTagline width={260} />
            <p className="mt-auto text-caption text-text-muted">
              Full colour with the tagline, dark backgrounds.
            </p>
          </li>
          <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7">
            {/* Single-colour lockup — the variant to use at small sizes. */}
            <KufsLogo on="dark" variant="mono" width={260} />
            <p className="mt-auto text-caption text-text-muted">
              Single colour with the red streak, for small sizes and one-colour print.
            </p>
          </li>
          <li className="flex flex-col gap-4 rounded-lg border border-border-light bg-bg-light p-7">
            <KufsLogo on="light" width={260} />
            <p className="mt-auto text-caption text-muted-on-light">
              Full colour with the tagline, white and off-white backgrounds.
            </p>
          </li>
        </ul>

        <p className="mt-8 max-w-[62ch] text-small text-text-muted">
          Clear space: keep at least the height of the &ldquo;K&rdquo; free on all sides.
          Never place the light-background lockup on navy — the &ldquo;KU&rdquo;
          disappears. For anything else, or for vector originals, email us.
        </p>
      </Section>
    </>
  );
}
