import type { Metadata } from "next";
import Image from "next/image";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getSponsorsByTier, TIER_LABEL } from "@/lib/content";
import { CTA } from "@/lib/nav";
import site from "@/content/site";
import type { Sponsor, SponsorTier } from "@/lib/schemas";
import { cn } from "@/lib/cn";

const TITLE = "Our Sponsors";
const DESCRIPTION =
  "The companies and organisations backing Khalifa University Formula Student, and what each of them contributes to the car.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sponsors" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/sponsors" },
};

/** Title and Gold get a large card each; everything below shares a compact row. */
const FEATURED: readonly SponsorTier[] = ["title", "gold"];

export default function SponsorsPage() {
  const groups = getSponsorsByTier();
  const featured = groups.filter((g) => FEATURED.includes(g.tier));
  const supporting = groups.filter(
    (g) => !FEATURED.includes(g.tier) && g.tier !== "inkind",
  );
  const inKind = groups.find((g) => g.tier === "inkind");

  return (
    <>
      <Section className="border-b border-border">
        <div className="flex max-w-[60ch] flex-col gap-5">
          <p className="text-eyebrow uppercase text-accent">Partners</p>
          <h1 className="text-h1 text-text">The companies behind the car</h1>
          <SpeedStripe variant="accent" />
          <p className="text-lead text-text-muted">
            Every component on this car exists because somebody backed it. These are the
            organisations that did, and what each of them contributes.
          </p>
        </div>
      </Section>

      {/* Sponsor logos live on a light ground: they are designed for white, and
          greyscaling or inverting a partner's mark is not ours to do. */}
      <Section tone="light" labelledBy="partners-heading">
        <SectionHeading
          id="partners-heading"
          tone="light"
          eyebrow={site.straplines[1]}
          title="Our partners"
        />

        <div className="mt-12 flex flex-col gap-16">
          {featured.map((group) => (
            <div key={group.tier}>
              <TierHeading tier={group.tier} />
              <ul className="mt-6 grid gap-6 md:grid-cols-2">
                {group.sponsors.map((sponsor) => (
                  <FeaturedCard key={sponsor.name} sponsor={sponsor} />
                ))}
              </ul>
            </div>
          ))}

          {supporting.map((group) => (
            <div key={group.tier}>
              <TierHeading tier={group.tier} />
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.sponsors.map((sponsor) => (
                  <CompactCard key={sponsor.name} sponsor={sponsor} />
                ))}
              </ul>
            </div>
          ))}

          {inKind ? (
            <div>
              <TierHeading tier="inkind" />
              <p className="mt-3 max-w-[60ch] text-small text-muted-on-light">
                Partners who contribute parts, materials, machining or expertise rather
                than cash. Valued at market rate and placed at the equivalent tier.
              </p>
              <ul className="mt-6 flex flex-col divide-y divide-border-light border-y border-border-light">
                {inKind.sponsors.map((sponsor) => (
                  <li
                    key={sponsor.name}
                    className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:gap-8"
                  >
                    <a
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex shrink-0 rounded-sm sm:w-48"
                    >
                      <Image
                        src={sponsor.logo.src}
                        alt={sponsor.name}
                        width={sponsor.logo.width}
                        height={sponsor.logo.height}
                        sizes="192px"
                        className="h-8 w-auto"
                      />
                    </a>
                    <p className="text-small text-muted-on-light">
                      {sponsor.contribution ?? sponsor.blurb}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Closing CTA */}
      <Section labelledBy="sponsors-cta-heading" tight>
        <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-surface p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="flex flex-col gap-3">
            <h2 id="sponsors-cta-heading" className="text-h3 text-text">
              Your logo could be on the 2027 car
            </h2>
            <SpeedStripe variant="underline" />
            <p className="max-w-[56ch] text-body text-text-muted">
              Cash, materials, machining time or expertise. We will tell you exactly what
              each tier gets you and send a written report at the end of the season.
            </p>
          </div>
          <Button href={CTA.sponsor.href} size="lg" className="shrink-0">
            {CTA.sponsor.label}
          </Button>
        </div>
      </Section>
    </>
  );
}

function TierHeading({ tier }: { tier: SponsorTier }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-h3 text-text-on-light">{TIER_LABEL[tier]}</h2>
      <SpeedStripe variant="underline" />
    </div>
  );
}

function FeaturedCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <li className="flex flex-col gap-5 rounded-lg border border-border-light bg-surface-light p-7">
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex self-start rounded-sm"
      >
        <Image
          src={sponsor.logo.src}
          alt={sponsor.name}
          width={sponsor.logo.width}
          height={sponsor.logo.height}
          sizes="(min-width: 768px) 260px, 200px"
          className="h-14 w-auto"
        />
      </a>
      {sponsor.blurb ? (
        <p className="text-small text-muted-on-light">{sponsor.blurb}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
        {sponsor.since ? (
          <p className="text-caption text-muted-on-light">
            Partner since {sponsor.since}
          </p>
        ) : null}
        <a
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-caption font-semibold text-accent-on-light underline-offset-4 hover:underline"
        >
          Visit {sponsor.name} <span aria-hidden>↗</span>
        </a>
      </div>
    </li>
  );
}

function CompactCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <li
      className={cn(
        "group flex flex-col gap-3 rounded-md border border-border-light bg-surface-light p-5",
        "transition-colors duration-[var(--duration-base)] hover:border-accent-on-light",
      )}
    >
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex self-start rounded-sm"
      >
        <Image
          src={sponsor.logo.src}
          alt={sponsor.name}
          width={sponsor.logo.width}
          height={sponsor.logo.height}
          sizes="180px"
          className="h-9 w-auto"
        />
      </a>
      {sponsor.contribution ? (
        <p className="text-caption text-muted-on-light">{sponsor.contribution}</p>
      ) : null}
    </li>
  );
}
