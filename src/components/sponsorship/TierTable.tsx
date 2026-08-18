import { BENEFIT_ROWS, type SponsorshipTier } from "@/lib/schemas";
import { TIER_LABEL } from "@/lib/tiers";
import { cn } from "@/lib/cn";

/**
 * The sponsorship tier comparison.
 *
 * Rendered as a real <table> with proper scope attributes, not a grid of divs.
 * A sponsor evaluating this will read across a row ("what do I lose by
 * dropping to Silver?"), and that is exactly the navigation a screen reader
 * gets from a correctly marked-up table and nothing else.
 *
 * Two presentations, one data source:
 *   - below `lg`, a stacked card per tier (a 6-column table on a phone is
 *     unusable, and horizontal scroll hides the thing being compared)
 *   - `lg` and up, the full matrix
 *
 * Lives on a light section: sponsor-facing tables read better on light, and it
 * is where Racing Red is allowed to carry emphasis.
 */

function BenefitValue({ value }: { value: string | false }) {
  if (value === false) {
    return (
      <>
        <span aria-hidden className="text-muted-on-light/50">
          —
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span>{value}</span>;
}

function Amount({ amount }: { amount: string | null }) {
  if (amount) return <>{amount}</>;
  return (
    <>
      <abbr
        title="To be confirmed — the team is still setting this figure"
        className="no-underline"
      >
        TBC
      </abbr>
    </>
  );
}

export function TierTable({ tiers }: { tiers: SponsorshipTier[] }) {
  return (
    <>
      {/* ---- Stacked cards: below lg ---- */}
      <div className="flex flex-col gap-6 lg:hidden">
        {tiers.map((tier) => (
          <article
            key={tier.tier}
            className="rounded-lg border border-border-light bg-surface-light p-6"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-h3 text-text-on-light">{tier.name}</h3>
              <p className="tabular text-h4 text-accent-on-light">
                <Amount amount={tier.amount} />
              </p>
            </header>
            <p className="mt-3 text-small text-muted-on-light">{tier.summary}</p>
            {tier.slots ? (
              <p className="mt-2 text-caption font-semibold uppercase tracking-wider text-accent-on-light">
                {tier.slots} {tier.slots === 1 ? "place" : "places"} available
              </p>
            ) : null}

            <dl className="mt-5 flex flex-col gap-3 border-t border-border-light pt-5">
              {BENEFIT_ROWS.map((row) => (
                <div key={row.key} className="grid grid-cols-[1fr_1.4fr] gap-3">
                  <dt className="text-caption font-semibold uppercase tracking-wide text-muted-on-light">
                    {row.label}
                  </dt>
                  <dd className="text-small text-text-on-light">
                    <BenefitValue value={tier.benefits[row.key]} />
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      {/* ---- Full matrix: lg and up ---- */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse text-left align-top">
          <caption className="sr-only">
            Sponsorship tiers compared across seven benefits. Amounts marked TBC have not
            been set yet.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[13rem] p-4 align-bottom">
                <span className="sr-only">Benefit</span>
              </th>
              {tiers.map((tier) => (
                <th
                  key={tier.tier}
                  scope="col"
                  className="border-b-2 border-accent-on-light p-4 align-bottom"
                >
                  <span className="block text-caption font-semibold uppercase tracking-widest text-accent-on-light">
                    {TIER_LABEL[tier.tier]}
                  </span>
                  <span className="mt-1 block text-h4 text-text-on-light">
                    {tier.name}
                  </span>
                  <span className="tabular mt-1 block text-small font-semibold text-muted-on-light">
                    <Amount amount={tier.amount} />
                  </span>
                  {tier.slots ? (
                    <span className="mt-1 block text-caption text-muted-on-light">
                      {tier.slots} {tier.slots === 1 ? "place" : "places"}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="p-4 align-top text-small text-muted-on-light">
                What it is for
              </th>
              {tiers.map((tier) => (
                <td
                  key={tier.tier}
                  className="p-4 align-top text-small text-text-on-light"
                >
                  {tier.summary}
                </td>
              ))}
            </tr>
            {BENEFIT_ROWS.map((row, index) => (
              <tr key={row.key} className={cn(index % 2 === 0 && "bg-surface-light")}>
                <th
                  scope="row"
                  className="p-4 align-top text-caption font-semibold uppercase tracking-wide text-muted-on-light"
                >
                  {row.label}
                </th>
                {tiers.map((tier) => (
                  <td
                    key={tier.tier}
                    className="p-4 align-top text-small text-text-on-light"
                  >
                    <BenefitValue value={tier.benefits[row.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
