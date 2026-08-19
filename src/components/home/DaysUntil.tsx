"use client";

import { useEffect, useState } from "react";

/**
 * "Days until <date>", computed on the client after mount.
 *
 * Same reasoning as CountdownClock: `Date.now()` differs between the build
 * machine and the visitor's browser. Computing this during render would either
 * produce a hydration mismatch or — worse on a statically prerendered page —
 * bake a number that silently goes stale until the next deploy, so a sponsor
 * reads "329 days" three months after it stopped being true.
 *
 * So the server renders an em-dash placeholder of the same width and the real
 * figure arrives a frame later. No layout shift, and the number is always
 * right.
 */
const DAY = 24 * 60 * 60 * 1000;

export function DaysUntil({ targetIso }: { targetIso: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.parse(targetIso);
    if (Number.isNaN(target)) return;

    const update = () => setDays(Math.max(0, Math.ceil((target - Date.now()) / DAY)));
    update();
    // Re-check hourly so a tab left open overnight does not show yesterday.
    const interval = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return (
    <span className="tabular">
      {days === null ? <span aria-hidden>—</span> : days}
      <span className="sr-only">
        {days === null ? "Calculating days remaining" : `${days} days remaining`}
      </span>
    </span>
  );
}
