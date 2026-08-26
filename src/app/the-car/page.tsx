import type { Metadata } from "next";
import Image from "next/image";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getCar, getCopy, getNav } from "@/lib/content";
import { fill } from "@/lib/copy";
import { SPEC_ROWS } from "@/lib/schemas";

const { title: TITLE, description: DESCRIPTION } = getCopy("the-car").meta;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/the-car" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/the-car" },
};

/**
 * Fixed dates that belong to the build plan, not to the copy.
 *
 * They are here rather than in content/copy because they are the same dates
 * content/milestones.json commits to — an editor moving first drive in a
 * sentence without moving the milestone would put the site at odds with
 * itself. Change these when the schedule changes, in both places.
 */
const FREEZE_DATE = "30 October 2026";
const FIRST_DRIVE_DATE = "31 March 2027";

/**
 * The car page.
 *
 * PER-SEASON BY DESIGN. The car is read from content/cars/<year>.json using
 * site.competition.year — next season is a new JSON file plus one number in
 * site.ts, not a rewrite of this page. Last season's file stays on disk, so an
 * archive route can be added later without recovering anything.
 *
 * Every unmeasured spec renders as TBC. This is the page actual engineers will
 * read, including the judges at competition, and a figure that turns out to be
 * a guess costs more credibility than an admitted gap.
 */
/**
 * The car's status values use a hyphen ("in-build"); Tina field names cannot.
 * One map, in one place, rather than reshaping either side to suit the other.
 */
const STATUS_KEY = {
  concept: "concept",
  "in-build": "inBuild",
  testing: "testing",
  competing: "competing",
  retired: "retired",
} as const;

export default function TheCarPage() {
  const copy = getCopy("the-car");
  const nav = getNav();
  const car = getCar();
  const specified = SPEC_ROWS.filter((row) => car.spec[row.key] !== null).length;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">
              {car.year} · {copy.statusLabels[STATUS_KEY[car.status]]}
            </p>
            <h1 className="text-h1 text-text">{car.name}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{car.positioning}</p>
            {/* The single most important technical fact about the programme,
                and the site said it nowhere before. */}
            <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.header.architectureLabel}
                </dt>
                <dd className="text-h4 text-accent">{site.vehicle.architecture}</dd>
              </div>
              <div>
                <dt className="text-caption uppercase tracking-wider text-text-muted">
                  {copy.header.targetMassLabel}
                </dt>
                <dd className="tabular text-h4 text-accent">{site.vehicle.targetMass}</dd>
              </div>
            </dl>

            <p className="text-small text-text-muted">{site.vehicle.note}</p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="/progress" size="lg">
                {copy.header.buildLink}
              </Button>
              <Button href={nav.cta.sponsor.href} variant="secondary" size="lg">
                {nav.cta.sponsor.label}
              </Button>
            </div>
          </div>

          {/* The hero render doubles as the car's portrait. It is the same
              asset the home page animation is baked from, so the two can never
              show different cars. */}
          <div className="self-start overflow-hidden rounded-lg border border-border bg-surface">
            <Image
              src={site.hero.poster.src}
              alt={site.hero.poster.alt}
              width={site.hero.poster.width}
              height={site.hero.poster.height}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-auto w-full"
              priority
            />
            <p className="border-t border-border px-5 py-3 text-caption text-text-muted">
              {/* Honest label. This is a render of a stand-in model, not the car. */}
              {fill(copy.header.posterCaption, { firstDrive: FIRST_DRIVE_DATE })}
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Spec ---------- */}
      <Section labelledBy="spec-heading" className="border-b border-border">
        <SectionHeading
          id="spec-heading"
          eyebrow={copy.spec.eyebrow}
          title={copy.spec.title}
          lead={fill(copy.spec.lead, {
            specified,
            total: SPEC_ROWS.length,
            freezeDate: FREEZE_DATE,
          })}
        />

        <div className="mt-12 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              {fill(copy.spec.tableCaption, { name: car.name })}
            </caption>
            <tbody>
              {SPEC_ROWS.map((row, index) => {
                const value = car.spec[row.key];
                return (
                  <tr
                    key={row.key}
                    className={index % 2 === 0 ? "bg-surface/60" : undefined}
                  >
                    <th
                      scope="row"
                      className="w-[16rem] p-4 align-top text-caption font-semibold uppercase tracking-wide text-text-muted"
                    >
                      {row.label}
                    </th>
                    <td className="tabular p-4 align-top text-body text-text">
                      {value ?? (
                        <abbr
                          title={copy.spec.tbcTooltip}
                          className="text-text-muted no-underline"
                        >
                          {copy.spec.tbcLabel}
                        </abbr>
                      )}
                      {value && row.unit ? null : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------- Subsystems ---------- */}
      <Section labelledBy="systems-heading" className="border-b border-border">
        <SectionHeading
          id="systems-heading"
          eyebrow={copy.subsystems.eyebrow}
          title={copy.subsystems.title}
          lead={copy.subsystems.lead}
        />

        <div className="mt-12 flex flex-col gap-12">
          {car.subsystems.map((system, index) => (
            <article
              key={system.name}
              className="grid gap-6 border-t border-border pt-10 lg:grid-cols-[1fr_1fr] lg:gap-12"
            >
              <div className="flex flex-col gap-4">
                <p className="text-eyebrow uppercase text-accent">
                  {String(index + 1).padStart(2, "0")} · {system.name}
                </p>
                <h3 className="text-h3 text-text">{system.headline}</h3>
                <p className="text-body text-text-muted">{system.body}</p>
              </div>

              {system.image ? (
                <Image
                  src={system.image.src}
                  alt={system.image.alt}
                  width={system.image.width}
                  height={system.image.height}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="h-auto w-full rounded-lg border border-border"
                />
              ) : (
                /* Empty state, not a broken image. Says what belongs here. */
                <div className="flex min-h-[12rem] items-center justify-center rounded-lg border border-dashed border-border bg-surface/40 p-8">
                  <p className="max-w-[34ch] text-center text-small text-text-muted">
                    {fill(copy.subsystems.noImageNote, {
                      system: system.name.toLowerCase(),
                    })}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </Section>

      {/* ---------- Gallery ---------- */}
      <Section labelledBy="gallery-heading">
        <SectionHeading
          id="gallery-heading"
          eyebrow={copy.gallery.eyebrow}
          title={copy.gallery.title}
        />

        {car.gallery.length > 0 ? (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {car.gallery.map((image) => (
              <li
                key={image.src}
                className="overflow-hidden rounded-lg border border-border bg-surface"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 flex flex-col items-start gap-4 rounded-lg border border-dashed border-border bg-surface/40 p-8">
            <p className="max-w-[56ch] text-body text-text-muted">
              {fill(copy.gallery.emptyBody, {
                name: car.name,
                status: copy.statusLabels[STATUS_KEY[car.status]].toLowerCase(),
              })}
            </p>
            <Button href="/progress" variant="secondary" size="sm">
              {copy.gallery.emptyCta}
            </Button>
          </div>
        )}
      </Section>
    </>
  );
}
