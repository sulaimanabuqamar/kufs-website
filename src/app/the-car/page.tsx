import type { Metadata } from "next";
import Image from "next/image";

import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import site from "@/content/site";
import { getCar } from "@/lib/content";
import { CTA } from "@/lib/nav";
import { SPEC_ROWS } from "@/lib/schemas";

const TITLE = "The Car";
const DESCRIPTION =
  "The KUFS Formula Student car, system by system: chassis, aerodynamics, powertrain, suspension and electronics, with the numbers behind each.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/the-car" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/the-car" },
};

const STATUS_LABEL: Record<string, string> = {
  concept: "In concept",
  "in-build": "In build",
  testing: "In testing",
  competing: "Competing",
  retired: "Retired",
};

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
export default function TheCarPage() {
  const car = getCar();
  const specified = SPEC_ROWS.filter((row) => car.spec[row.key] !== null).length;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section className="border-b border-border">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="flex max-w-[58ch] flex-col gap-5">
            <p className="text-eyebrow uppercase text-accent">
              {car.year} · {STATUS_LABEL[car.status] ?? car.status}
            </p>
            <h1 className="text-h1 text-text">{car.name}</h1>
            <SpeedStripe variant="accent" />
            <p className="text-lead text-text-muted">{car.positioning}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="/progress" size="lg">
                Follow the build
              </Button>
              <Button href={CTA.sponsor.href} variant="secondary" size="lg">
                {CTA.sponsor.label}
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
              Placeholder render. Photography of the built car follows shakedown.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Spec ---------- */}
      <Section labelledBy="spec-heading" className="border-b border-border">
        <SectionHeading
          id="spec-heading"
          eyebrow="Specification"
          title="The numbers"
          lead={`${specified} of ${SPEC_ROWS.length} figures confirmed. Everything still being measured is marked TBC rather than estimated — this page is read by design judges.`}
        />

        <div className="mt-12 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Specification of the {car.name}. Values marked TBC have not been measured
              yet.
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
                          title="To be confirmed — not measured yet"
                          className="text-text-muted no-underline"
                        >
                          TBC
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
          eyebrow="Systems"
          title="How it is put together"
          lead="Five subteams, five briefs. Each of these is owned by students who defend it at competition."
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
                    Photography and CAD renders of the {system.name.toLowerCase()} package
                    are added as the build progresses.
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
          eyebrow="Gallery"
          title="The car in the workshop"
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
              No photographs yet. The {car.name} is{" "}
              {STATUS_LABEL[car.status]?.toLowerCase() ?? car.status}, and this gallery
              fills up through manufacture, assembly and shakedown. The build updates are
              on the progress page in the meantime.
            </p>
            <Button href="/progress" variant="secondary" size="sm">
              See the build progress
            </Button>
          </div>
        )}
      </Section>
    </>
  );
}
