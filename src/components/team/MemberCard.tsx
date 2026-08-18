import Image from "next/image";

import type { TeamMember } from "@/lib/schemas";

/**
 * A roster card.
 *
 * `photo` is required by the schema, but the file behind it may not exist yet —
 * a new member joins and their headshot is taken three weeks later. Rather than
 * ship a broken image, pass `hasPhoto={false}` and the card falls back to a
 * branded initials avatar on KUFS Navy.
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

export function MemberCard({
  member,
  hasPhoto = true,
}: {
  member: TeamMember;
  hasPhoto?: boolean;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      {hasPhoto ? (
        <Image
          src={member.photo.src}
          alt={member.photo.alt}
          width={member.photo.width}
          height={member.photo.height}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/5] w-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex aspect-[4/5] w-full items-center justify-center bg-surface-raised"
        >
          <span className="font-display text-display italic text-accent">
            {initials(member.name)}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h4 className="text-h4 text-text">{member.name}</h4>
        <p className="text-small text-accent">{member.role}</p>
        <p className="mt-auto pt-3 text-caption text-text-muted">
          {typeof member.year === "number" ? `Year ${member.year}` : member.year}
        </p>
        {member.linkedin ? (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption font-semibold text-accent underline-offset-4 hover:underline"
          >
            LinkedIn <span aria-hidden>↗</span>
            <span className="sr-only">, {member.name}</span>
          </a>
        ) : null}
      </div>
    </li>
  );
}
