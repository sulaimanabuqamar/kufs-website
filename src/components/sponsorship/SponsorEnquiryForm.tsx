"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SPONSOR_TIERS, TIER_LABEL, type SponsorTier } from "@/lib/tiers";
import { track } from "@/lib/analytics";

/**
 * Sponsorship enquiry form.
 *
 * NO BACKEND. The brief was explicit about not adding one, and adding a
 * third-party form service without asking would put prospective-sponsor
 * contact details through a processor nobody has approved.
 *
 * So this composes a mailto: link from the fields and hands off to the
 * visitor's mail client. That is a genuinely poor experience — it fails on
 * webmail-only users and silently does nothing if no mail client is
 * configured — which is why the address is also printed in full underneath, so
 * there is always a path that works.
 *
 * TODO(forms): replace with a real endpoint. The shape below is deliberately
 * a plain POST-able payload, so wiring it to a route handler or to whichever
 * form service the university approves is a change to `onSubmit` and nothing
 * else. Ask before choosing a provider — this collects business contact data.
 */

const FIELD =
  "w-full rounded-md border-2 border-border-light bg-surface-light px-3 py-2.5 " +
  "text-body text-text-on-light placeholder:text-muted-on-light/70 " +
  "focus-visible:border-accent-on-light";

const LABEL = "text-caption font-semibold uppercase tracking-wide text-muted-on-light";

export function SponsorEnquiryForm({ to }: { to: string }) {
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<SponsorTier | "">("");
  const [message, setMessage] = useState("");

  const mailto = useMemo(() => {
    const subject = organisation
      ? `Sponsorship enquiry — ${organisation}`
      : "Sponsorship enquiry";

    const body = [
      `Name: ${name || "—"}`,
      `Organisation: ${organisation || "—"}`,
      `Email: ${email || "—"}`,
      `Tier of interest: ${tier ? TIER_LABEL[tier] : "Not sure yet"}`,
      "",
      message || "",
    ].join("\n");

    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [to, name, organisation, email, tier, message]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        track("Sponsor CTA", { source: "enquiry-form", tier: tier || "unspecified" });
        window.location.href = mailto;
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="enq-name" className={LABEL}>
            Your name
          </label>
          <input
            id="enq-name"
            name="name"
            required
            autoComplete="name"
            className={FIELD}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="enq-org" className={LABEL}>
            Organisation
          </label>
          <input
            id="enq-org"
            name="organisation"
            required
            autoComplete="organization"
            className={FIELD}
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="enq-email" className={LABEL}>
            Email
          </label>
          <input
            id="enq-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="enq-tier" className={LABEL}>
            Tier of interest
          </label>
          <select
            id="enq-tier"
            name="tier"
            className={FIELD}
            value={tier}
            onChange={(e) => setTier(e.target.value as SponsorTier | "")}
          >
            <option value="">Not sure yet — advise me</option>
            {SPONSOR_TIERS.map((t) => (
              <option key={t} value={t}>
                {TIER_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="enq-message" className={LABEL}>
          Message
        </label>
        <textarea
          id="enq-message"
          name="message"
          rows={5}
          required
          className={FIELD}
          placeholder="What you are interested in, and anything you would want from a partnership."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" variant="onLight" size="lg">
          Send enquiry
        </Button>
        <p className="text-caption text-muted-on-light">
          This opens your email app with the message prefilled. If that does not work,
          write to{" "}
          <a
            href={`mailto:${to}`}
            className="font-semibold text-accent-on-light underline underline-offset-2"
          >
            {to}
          </a>
          .
        </p>
      </div>
    </form>
  );
}
