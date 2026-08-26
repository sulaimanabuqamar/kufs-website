/**
 * The competition acronyms, defined.
 *
 * The milestone descriptions are full of DCS, SES, ESF, EDR and IAD, because
 * that is what the deliverables are actually called. A sponsor or a
 * prospective member will not know any of them, and a timeline nobody can read
 * is worse than no timeline.
 *
 * Definitions are taken verbatim from page 2 of the team's own project
 * timeline document, so the site and the internal plan cannot drift apart.
 */

export function Glossary({
  terms,
}: {
  terms: readonly { abbr: string; term: string; definition: string }[];
}) {
  return (
    <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
      {terms.map((entry) => (
        <div key={entry.abbr} className="flex flex-col gap-1">
          <dt className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-h4 text-accent">{entry.abbr}</span>
            <span className="text-small font-semibold text-text">{entry.term}</span>
          </dt>
          <dd className="text-small text-text-muted">{entry.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
