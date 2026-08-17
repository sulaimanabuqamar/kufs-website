"use client";

import { useEffect, useState } from "react";

/**
 * The ticking half of the countdown.
 *
 * HYDRATION SAFETY
 * `Date.now()` differs between the build machine and the visitor's browser, so
 * rendering a live figure on the server guarantees a mismatch. Instead the
 * first render — server and client alike — emits a stable placeholder, and
 * the clock only starts in an effect after mount. The markup, the labels and
 * the layout are all present from the first byte; only the digits arrive a
 * frame later, so there is no layout shift when they do.
 *
 * POST-EVENT
 * Counting into negative numbers is the classic failure here. Three states
 * instead: counting down, running (a five-day window from the start), and
 * finished.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/** How long after the start time we treat the event as in progress. */
const EVENT_DURATION = 5 * DAY;

type Remaining = { days: number; hours: number; minutes: number; seconds: number };
type Phase =
  | { kind: "pending" }
  | { kind: "counting"; remaining: Remaining }
  | { kind: "running" }
  | { kind: "finished" };

function phaseFor(targetMs: number, nowMs: number): Phase {
  const delta = targetMs - nowMs;

  if (delta <= 0) {
    return nowMs < targetMs + EVENT_DURATION ? { kind: "running" } : { kind: "finished" };
  }

  return {
    kind: "counting",
    remaining: {
      days: Math.floor(delta / DAY),
      hours: Math.floor((delta % DAY) / HOUR),
      minutes: Math.floor((delta % HOUR) / MINUTE),
      seconds: Math.floor((delta % MINUTE) / 1000),
    },
  };
}

export function CountdownClock({
  targetIso,
  eventName,
}: {
  targetIso: string;
  eventName: string;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "pending" });

  useEffect(() => {
    const targetMs = Date.parse(targetIso);
    if (Number.isNaN(targetMs)) return;

    const update = () => setPhase(phaseFor(targetMs, Date.now()));
    update();

    // Aligned to the wall clock rather than to mount time, so the seconds
    // digit changes when the visitor's clock says it should.
    let interval: ReturnType<typeof setInterval>;
    const align = setTimeout(
      () => {
        update();
        interval = setInterval(update, 1000);
      },
      1000 - (Date.now() % 1000),
    );

    return () => {
      clearTimeout(align);
      clearInterval(interval);
    };
  }, [targetIso]);

  if (phase.kind === "running") {
    return (
      <Message
        headline="Happening now"
        detail={`${eventName} is under way at Silverstone. Follow the team for live updates from the paddock.`}
      />
    );
  }

  if (phase.kind === "finished") {
    return (
      <Message
        headline="That's a wrap"
        detail={`${eventName} is done. Our full write-up — what worked, what didn't, and what changes for next season — is in the news.`}
      />
    );
  }

  const remaining = phase.kind === "counting" ? phase.remaining : null;

  return (
    <div>
      {/* The digits are decorative for assistive tech: a per-second live
          region would be unusable. The summary below carries the meaning. */}
      <ol aria-hidden className="flex flex-wrap items-end gap-x-4 gap-y-6 sm:gap-x-8">
        <Unit value={remaining?.days} label="Days" pad={2} />
        <Separator />
        <Unit value={remaining?.hours} label="Hours" pad={2} />
        <Separator />
        <Unit value={remaining?.minutes} label="Minutes" pad={2} />
        <Separator />
        <Unit value={remaining?.seconds} label="Seconds" pad={2} />
      </ol>

      <p className="sr-only">
        {remaining
          ? `${remaining.days} days, ${remaining.hours} hours and ${remaining.minutes} minutes until ${eventName}.`
          : `Loading the countdown to ${eventName}.`}
      </p>
    </div>
  );
}

function Unit({
  value,
  label,
  pad,
}: {
  value: number | undefined;
  label: string;
  pad: number;
}) {
  // Em dashes, not zeros: a placeholder must not read as a real value.
  const display =
    value === undefined ? "—".repeat(pad) : String(value).padStart(pad, "0");

  return (
    <li className="flex min-w-[3.5ch] flex-col">
      <span className="tabular text-h1 leading-none text-text">{display}</span>
      <span className="mt-2 text-caption uppercase tracking-[0.18em] text-text-muted">
        {label}
      </span>
    </li>
  );
}

function Separator() {
  return (
    <li
      className="hidden pb-8 text-h2 leading-none text-border-strong sm:block"
      aria-hidden
    >
      :
    </li>
  );
}

function Message({ headline, detail }: { headline: string; detail: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-h2 text-text">{headline}</p>
      <p className="max-w-[52ch] text-lead text-text-muted">{detail}</p>
    </div>
  );
}
