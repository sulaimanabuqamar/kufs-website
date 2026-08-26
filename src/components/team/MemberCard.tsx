import Image from "next/image";

import { getCopy, roleLine } from "@/lib/content";
import type { TeamMember } from "@/lib/schemas";

/**
 * A roster card.
 *
 * TWO LAYOUTS, because nobody has a headshot yet and 24 empty portrait boxes
 * is not a roster — it is a wall of placeholders.
 *
 *   with a photo   portrait card, image above the details
 *   without one    compact card, monogram chip beside the details
 *
 * The compact form reads as a deliberate choice rather than as something
 * missing, and it keeps a 24-person roster to a sensible page length. As soon
 * as a member's `photo` is filled in, their card upgrades on its own.
 *
 * PRIVACY: the only fields rendered are name, roles, year and major. Student
 * IDs and contact numbers exist in the team's internal roster and must never
 * reach this repository — the schema has no field that could carry one.
 */

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MemberCard({ member }: { member: TeamMember }) {
  const details = (
    <>
      <h5 className="text-h4 text-text">{member.name}</h5>
      <p className="text-small text-accent">{roleLine(member)}</p>
      <p className="text-caption text-text-muted">{member.major}</p>
      <p className="text-caption text-text-muted">{member.year}</p>
      {member.linkedin ? (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-caption font-semibold text-accent underline-offset-4 hover:underline"
        >
          {getCopy("common").ui.linkedinLabel} <span aria-hidden>↗</span>
          <span className="sr-only">, {member.name}</span>
        </a>
      ) : null}
    </>
  );

  if (!member.photo) {
    return (
      <li className="flex items-start gap-4 rounded-lg border border-border bg-surface p-5">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-raised font-display text-h3 italic text-accent"
        >
          {initials(member.name)}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">{details}</span>
      </li>
    );
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Image
        src={member.photo.src}
        alt={member.photo.alt}
        width={member.photo.width}
        height={member.photo.height}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/5] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-0.5 p-5">{details}</div>
    </li>
  );
}
