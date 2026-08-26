import type { Metadata } from "next";
import Image from "next/image";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getCopy, getNav, getSponsorsByTier, TIER_LABEL } from "@/lib/content";
import { fill } from "@/lib/copy";
import site from "@/content/site";
import type { Sponsor, SponsorTier } from "@/lib/schemas";
import { cn } from "@/lib/cn";

const { title, description } = getCopy("sponsors").meta;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sponsors" },
  openGraph: { title, description, url: "/sponsors" },
};

/** Title and Gold get a large card each; everything below shares a compact row. */
const FEATURED: readonly SponsorTier[] = ["tier1", "tier2"];

/**
 * Grid columns chosen from the number of items in the tier.
 *
 * A fixed `lg:grid-cols-3` is right for a mature sponsor list and wrong for a
 * real one. Early in a season a tier holds one partner, and a third-width card
 * stranded against two-thirds of empty space reads as a broken layout — or
 * worse, as a team nobody backs. One item fills the row, two split it, three or
 * more use the full grid.
 *
 * This is the normal case, not an edge case: every team starts a season here.
 */
function tierGrid(count: number, size: "featured" | "compact"): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  return size === "featured" ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
}

export default function SponsorsPage() {
  const copy = getCopy("sponsors");
  const nav = getNav();
  const groups = getSponsorsByTier();
  const featured = groups.filter((g) => FEATURED.includes(g.tier));
  const supporting = groups.filter(
    (g) => !FEATURED.includes(g.tier) && g.tier !== "inkind",
  );
  const inKind = groups.find((g) => g.tier === "inkind");
  const totalSponsors = groups.reduce((n, g) => n + g.sponsors.length, 0);
  const hasSponsors = totalSponsors > 0;

  return (
    <>
      {/* Copy left, proof right. The right column is the sponsor count by
          tier — the single most useful thing a prospective partner can see
          here, and it makes the header carry information rather than air. */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">{copy.header.eyebrow}</p>
            <h1 className="text-h1 text-text">{copy.header.title}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{copy.header.lead}</p>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-lg border border-border bg-surface p-7">
            <h2 className="text-h4 text-text">{copy.header.asideHeading}</h2>
            <dl className="flex flex-col gap-3 border-t border-border pt-5">
              {groups.map((group) => (
                <div
                  key={group.tier}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt className="text-small text-text-muted">{TIER_LABEL[group.tier]}</dt>
                  <dd className="tabular text-h4 text-accent">{group.sponsors.length}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
                <dt className="text-small font-semibold text-text">
                  {copy.header.totalLabel}
                </dt>
                <dd className="tabular text-h3 text-accent">{totalSponsors}</dd>
              </div>
            </dl>
            <p className="text-caption text-text-muted">
              {fill(copy.header.asideNote, { year: site.competition.year })}
            </p>
          </aside>
        </div>
      </Section>

      {/* Sponsor logos live on a light ground: they are designed for white, and
          greyscaling or inverting a partner's mark is not ours to do. */}
      <Section tone="light" labelledBy="partners-heading">
        <SectionHeading
          id="partners-heading"
          tone="light"
          eyebrow={site.straplines[1]}
          title={copy.partners.title}
        />

        {!hasSponsors ? (
          /* Honest empty state. "Be the first" is a genuinely strong ask for a
             founding season — much stronger than a page of invented logos. */
          <div className="mt-12 rounded-lg border-2 border-dashed border-border-light bg-surface-light p-10">
            <h3 className="text-h3 text-text-on-light">{copy.partners.emptyTitle}</h3>
            <p className="mt-4 max-w-[62ch] text-body text-muted-on-light">
              {copy.partners.emptyBody}
            </p>
            <Button href={nav.cta.sponsor.href} variant="onLight" className="mt-6">
              {copy.partners.emptyCta}
            </Button>
          </div>
        ) : null}

        <div className="mt-12 flex flex-col gap-16">
          {featured.map((group) => (
            <div key={group.tier}>
              <TierHeading tier={group.tier} />
              <ul
                className={cn(
                  "mt-6 grid gap-6",
                  tierGrid(group.sponsors.length, "featured"),
                )}
              >
                {group.sponsors.map((sponsor) => (
                  <FeaturedCard
                    key={sponsor.name}
                    sponsor={sponsor}
                    solo={group.sponsors.length === 1}
                    sinceLabel={copy.partners.partnerSince}
                    visitLabel={copy.partners.visitLabel}
                  />
                ))}
              </ul>
            </div>
          ))}

          {supporting.map((group) => (
            <div key={group.tier}>
              <TierHeading tier={group.tier} />
              <ul
                className={cn(
                  "mt-6 grid gap-5",
                  tierGrid(group.sponsors.length, "compact"),
                )}
              >
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
                {copy.partners.inKindNote}
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
              {fill(copy.cta.title, { year: site.competition.year })}
            </h2>
            <p className="max-w-[56ch] text-body text-text-muted">{copy.cta.body}</p>
          </div>
          <Button href={nav.cta.sponsor.href} size="lg" className="shrink-0">
            {nav.cta.sponsor.label}
          </Button>
        </div>
      </Section>
    </>
  );
}

/** Tier label. No speed stripe: the motif is reserved for page headers and
 *  section headings, and repeating it under all five tiers turned the site's
 *  signature into wallpaper. A hairline rule does the separating job. */
function TierHeading({ tier }: { tier: SponsorTier }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border-light pb-3">
      <h2 className="text-h3 text-text-on-light">{TIER_LABEL[tier]}</h2>
    </div>
  );
}

function FeaturedCard({
  sponsor,
  solo = false,
  sinceLabel,
  visitLabel,
}: {
  sponsor: Sponsor;
  solo?: boolean;
  sinceLabel: string;
  visitLabel: string;
}) {
  return (
    <li
      className={cn(
        "gap-5 rounded-lg border border-border-light bg-surface-light p-7",
        // A lone card spans the row, so it lays out horizontally — logo beside
        // copy — rather than becoming a very wide box with a small mark adrift
        // at the top of it.
        solo ? "flex flex-col md:flex-row md:items-center md:gap-10" : "flex flex-col",
      )}
    >
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn("inline-flex self-start rounded-sm", solo && "md:shrink-0")}
      >
        <Image
          src={sponsor.logo.src}
          alt={sponsor.name}
          width={sponsor.logo.width}
          height={sponsor.logo.height}
          sizes="(min-width: 768px) 260px, 200px"
          className={cn("w-auto", solo ? "h-16 md:h-20" : "h-14")}
        />
      </a>
      <div className="flex flex-col gap-5">
        {sponsor.blurb ? (
          <p className="text-small text-muted-on-light">{sponsor.blurb}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
          {sponsor.since ? (
            <p className="text-caption text-muted-on-light">
              {sinceLabel} {sponsor.since}
            </p>
          ) : null}
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-caption font-semibold text-accent-on-light underline-offset-4 hover:underline"
          >
            {fill(visitLabel, { name: sponsor.name })} <span aria-hidden>↗</span>
          </a>
        </div>
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
