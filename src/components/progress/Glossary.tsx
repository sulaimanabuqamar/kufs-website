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
const TERMS = [
  {
    abbr: "DCS",
    term: "Design Concept Specification",
    definition:
      "Describes the overall design concept and explains how the proposed design will meet the project or competition requirements.",
  },
  {
    abbr: "HLPP",
    term: "High Level Project Plan",
    definition:
      "Provides an overview of the project schedule, major tasks, milestones, responsibilities and expected completion dates.",
  },
  {
    abbr: "SES",
    term: "Structural Equivalency Spreadsheet",
    definition:
      "Demonstrates through calculations that an alternative structural design provides equivalent strength and safety to the required standard.",
  },
  {
    abbr: "ESA",
    term: "Electrical System Advisor",
    definition:
      "A qualified advisor who provides technical guidance and helps ensure the vehicle's electrical systems are designed and operated safely.",
  },
  {
    abbr: "ESO",
    term: "Electrical System Officer",
    definition:
      "A team member responsible for overseeing electrical safety and ensuring proper procedures are followed when working on the vehicle.",
  },
  {
    abbr: "ESF",
    term: "Electrical System Form",
    definition:
      "Documents important details about the vehicle's electrical system, including components, connections, protection systems and safety features.",
  },
  {
    abbr: "EDR",
    term: "Engineering Design Report",
    definition:
      "Explains the engineering decisions, calculations, analysis, testing and reasoning used to develop the vehicle or system.",
  },
  {
    abbr: "DSS",
    term: "Design Specification Sheet",
    definition:
      "Summarises key technical specifications and design information about the vehicle in a standardised format.",
  },
  {
    abbr: "IAD",
    term: "Impact Attenuator Data",
    definition:
      "Provides calculations and test data showing that the impact attenuator can safely absorb energy during a collision, usually submitted as the Impact Attenuator Data Report.",
  },
] as const;

export function Glossary() {
  return (
    <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
      {TERMS.map((entry) => (
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
