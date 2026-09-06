import { fill } from "@/lib/copy";
import type { NewsletterIssue } from "@/lib/schemas";

/**
 * Shared formatting for newsletter issues.
 *
 * Kept out of the page components because the index, the issue page, the RSS
 * feed and the metadata all name an issue, and four slightly different
 * spellings of "Issue 3 — October 2026" is exactly the kind of drift nobody
 * notices until a sponsor forwards one.
 *
 * Free of `server-only` and of Zod so it stays importable from anywhere.
 */

/** "October 2026". UTC so the month never shifts with the reader's timezone. */
export const MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** The first of the issue's month, as a UTC date. */
export function issueDate(issue: Pick<NewsletterIssue, "year" | "month">): Date {
  return new Date(Date.UTC(issue.year, issue.month - 1, 1));
}

/** "October 2026". */
export function issueMonth(issue: Pick<NewsletterIssue, "year" | "month">): string {
  return MONTH_YEAR.format(issueDate(issue));
}

/**
 * "Issue 3 — October 2026".
 *
 * `issueLabel` is the editable "Issue {issue}" string from
 * content/copy/newsletter.json, passed in rather than read here so this module
 * stays free of the server-only content loader.
 */
export function issueTitle(
  issue: Pick<NewsletterIssue, "issue" | "year" | "month">,
  issueLabel: string,
): string {
  return `${fill(issueLabel, { issue: issue.issue })} — ${issueMonth(issue)}`;
}
