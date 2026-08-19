"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { track, type TrackedEvent } from "@/lib/analytics";

/**
 * The site's only form. Used by /become-a-sponsor and /contact.
 *
 * SUBMISSION
 * POSTs JSON to a Formspree endpoint from NEXT_PUBLIC_FORMSPREE_ENDPOINT. If
 * that variable is unset — local development, or a deploy where nobody has
 * configured it — the form degrades to the previous `mailto:` behaviour rather
 * than rendering a form that silently swallows enquiries. A sponsorship
 * enquiry going nowhere is the worst failure this site can have.
 *
 * The contact address is printed in full next to the form on every path,
 * including success and error, so there is always a route that works.
 *
 * VALIDATION
 * Hand-rolled rather than native. Native validation announces through a
 * transient browser bubble that screen readers handle inconsistently and that
 * vanishes on blur. Instead: `noValidate`, per-field messages wired with
 * `aria-describedby` and `aria-invalid`, and a polite live region that
 * announces a summary. Focus moves to the first invalid field on submit.
 *
 * SPAM
 * A honeypot field, visually hidden and `tabIndex={-1}`, ignored by humans and
 * filled by bots. No CAPTCHA: it is an accessibility tax and a conversion tax
 * on the highest-value page on the site.
 */

export type EnquiryField = "name" | "organisation" | "email" | "topic" | "message";

export type EnquiryFormProps = {
  /** Formspree endpoint. null => mailto fallback. */
  endpoint: string | null;
  /** Where enquiries go. Shown to the user and used by the fallback. */
  toEmail: string;
  /** Subject line prefix for the email / Formspree subject. */
  subject: string;
  /** Label for the select. */
  topicLabel: string;
  topicOptions: readonly { value: string; label: string }[];
  /** Placeholder shown as the unselected option. */
  topicPlaceholder: string;
  /** Whether the select must be answered. */
  topicRequired?: boolean;
  /** Ask for an organisation (sponsors) or not (students, press). */
  showOrganisation?: boolean;
  /** How quickly we promise to reply, in prose. */
  responseTime?: string;
  /** Analytics goal fired on a successful send. */
  event?: TrackedEvent;
  /** Light sections use the light palette; the form adapts. */
  tone?: "light" | "dark";
  messagePlaceholder?: string;
};

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<EnquiryField, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EnquiryForm({
  endpoint,
  toEmail,
  subject,
  topicLabel,
  topicOptions,
  topicPlaceholder,
  topicRequired = false,
  showOrganisation = true,
  responseTime = "within two working days",
  event = "Sponsor CTA",
  tone = "light",
  messagePlaceholder,
}: EnquiryFormProps) {
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState({
    name: "",
    organisation: "",
    email: "",
    topic: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const light = tone === "light";

  const field = cn(
    "w-full rounded-md border-2 px-3 py-2.5 text-body",
    light
      ? "border-border-light bg-surface-light text-text-on-light placeholder:text-muted-on-light/70"
      : "border-border-strong bg-surface text-text placeholder:text-text-muted/70",
  );
  const fieldInvalid = light ? "border-accent-on-light" : "border-accent";
  const label = cn(
    "text-caption font-semibold uppercase tracking-wide",
    light ? "text-muted-on-light" : "text-text-muted",
  );
  const errorText = cn(
    "text-caption font-semibold",
    light ? "text-accent-on-light" : "text-accent",
  );
  const muted = light ? "text-muted-on-light" : "text-text-muted";
  const linkClass = cn(
    "font-semibold underline underline-offset-2",
    light ? "text-accent-on-light" : "text-accent",
  );

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a field's error as soon as the user starts fixing it — keeping a
    // stale error next to text someone is actively correcting is hostile.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  function validate(): Errors {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Tell us your name.";
    if (showOrganisation && !values.organisation.trim()) {
      next.organisation = "Tell us which organisation you are writing from.";
    }
    if (!values.email.trim()) next.email = "We need an email address to reply to.";
    else if (!EMAIL.test(values.email.trim())) {
      next.email = "That does not look like an email address.";
    }
    if (topicRequired && !values.topic)
      next.topic = `Choose a ${topicLabel.toLowerCase()}.`;
    if (!values.message.trim()) next.message = "Add a message, even a short one.";
    return next;
  }

  function mailtoHref(): string {
    const topic =
      topicOptions.find((o) => o.value === values.topic)?.label ?? "Not specified";
    const body = [
      `Name: ${values.name || "—"}`,
      showOrganisation ? `Organisation: ${values.organisation || "—"}` : null,
      `Email: ${values.email || "—"}`,
      `${topicLabel}: ${topic}`,
      "",
      values.message || "",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot: a real person never fills this.
    const form = formRef.current;
    if (form && (form.elements.namedItem("company_website") as HTMLInputElement)?.value) {
      // Pretend it worked. Telling a bot it failed just invites a retry.
      setStatus("success");
      return;
    }

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      form?.querySelector<HTMLElement>(`#${CSS.escape(`${ids}-${first}`)}`)?.focus();
      return;
    }

    // No endpoint configured: hand off to the mail client instead of pretending.
    if (!endpoint) {
      track(event, { source: "mailto-fallback" });
      window.location.href = mailtoHref();
      return;
    }

    setStatus("submitting");
    setErrorDetail(null);

    try {
      const topic =
        topicOptions.find((o) => o.value === values.topic)?.label ?? "Not specified";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          name: values.name,
          ...(showOrganisation ? { organisation: values.organisation } : {}),
          email: values.email,
          [topicLabel]: topic,
          message: values.message,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.errors?.[0]?.message ??
            `The form service returned ${response.status}.`,
        );
      }

      track(event, { source: "formspree", topic: values.topic || "unspecified" });
      setStatus("success");
    } catch (cause) {
      // Values are deliberately NOT cleared: losing a paragraph someone just
      // typed because our form service was down is unforgivable.
      setStatus("error");
      setErrorDetail(cause instanceof Error ? cause.message : "Something went wrong.");
    }
  }

  /* ---------------------------------------------------------------- success */
  if (status === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col gap-4 rounded-lg border-2 p-7",
          light ? "border-accent-on-light bg-surface-light" : "border-accent bg-surface",
        )}
      >
        <h3 className={cn("text-h4", light ? "text-text-on-light" : "text-text")}>
          Thank you — that has reached us.
        </h3>
        <p className={cn("text-small", muted)}>
          Someone from the team will reply {responseTime}, from{" "}
          <a href={`mailto:${toEmail}`} className={linkClass}>
            {toEmail}
          </a>
          . If you have not heard from us by then, write to that address directly and it
          will get chased.
        </p>
        <Button
          variant={light ? "onLightSecondary" : "secondary"}
          size="sm"
          className="self-start"
          onClick={() => {
            setValues({ name: "", organisation: "", email: "", topic: "", message: "" });
            setStatus("idle");
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  const describedBy = (key: EnquiryField) =>
    errors[key] ? `${ids}-${key}-error` : undefined;

  const inputProps = (key: EnquiryField) => ({
    id: `${ids}-${key}`,
    name: key,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": describedBy(key),
    className: cn(field, errors[key] && fieldInvalid),
  });

  // A plain render function, not a component. Declaring a component inside
  // render gives it a new identity every pass, so React remounts it and any
  // state it held is lost — harmless here today, a bug the moment someone adds
  // a transition to it.
  const fieldError = (name: EnquiryField) =>
    errors[name] ? (
      <p id={`${ids}-${name}-error`} className={errorText}>
        {errors[name]}
      </p>
    ) : null;

  /* ------------------------------------------------------------------ form */
  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* Announces validation and submission outcomes without stealing focus. */}
      <p aria-live="polite" className="sr-only">
        {status === "submitting"
          ? "Sending your message."
          : Object.keys(errors).length > 0
            ? `${Object.keys(errors).length} field${Object.keys(errors).length === 1 ? "" : "s"} need attention.`
            : ""}
      </p>

      {/* Honeypot. Hidden from sight and from assistive tech, not from bots. */}
      <div aria-hidden className="sr-only-focusable absolute h-px w-px overflow-hidden">
        <label htmlFor={`${ids}-company_website`}>Company website</label>
        <input
          id={`${ids}-company_website`}
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={cn("grid gap-5", showOrganisation && "sm:grid-cols-2")}>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${ids}-name`} className={label}>
            Your name
          </label>
          <input
            {...inputProps("name")}
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
          />
          {fieldError("name")}
        </div>

        {showOrganisation ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${ids}-organisation`} className={label}>
              Organisation
            </label>
            <input
              {...inputProps("organisation")}
              autoComplete="organization"
              value={values.organisation}
              onChange={(e) => set("organisation")(e.target.value)}
            />
            {fieldError("organisation")}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${ids}-email`} className={label}>
            Email
          </label>
          <input
            {...inputProps("email")}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
          />
          {fieldError("email")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${ids}-topic`} className={label}>
            {topicLabel}
          </label>
          <select
            {...inputProps("topic")}
            value={values.topic}
            onChange={(e) => set("topic")(e.target.value)}
          >
            <option value="">{topicPlaceholder}</option>
            {topicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError("topic")}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-message`} className={label}>
          Message
        </label>
        <textarea
          {...inputProps("message")}
          rows={5}
          placeholder={messagePlaceholder}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
        />
        {fieldError("message")}
      </div>

      {status === "error" ? (
        <div
          role="alert"
          className={cn(
            "flex flex-col gap-2 rounded-md border-2 p-4",
            light ? "border-accent-on-light" : "border-accent",
          )}
        >
          <p
            className={cn(
              "text-small font-semibold",
              light ? "text-text-on-light" : "text-text",
            )}
          >
            That did not send.
          </p>
          <p className={cn("text-caption", muted)}>
            {errorDetail} Nothing you typed has been lost — press send again, or email{" "}
            <a href={`mailto:${toEmail}`} className={linkClass}>
              {toEmail}
            </a>{" "}
            directly.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant={light ? "onLight" : "primary"}
          size="lg"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>
        <p className={cn("text-caption", muted)}>
          {endpoint ? (
            <>
              We reply {responseTime}. You can also write to{" "}
              <a href={`mailto:${toEmail}`} className={linkClass}>
                {toEmail}
              </a>
              .
            </>
          ) : (
            <>
              This opens your email app with the message prefilled. If that does not work,
              write to{" "}
              <a href={`mailto:${toEmail}`} className={linkClass}>
                {toEmail}
              </a>
              .
            </>
          )}
        </p>
      </div>
    </form>
  );
}
