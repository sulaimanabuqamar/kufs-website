/**
 * Placeholder interpolation for editable copy.
 *
 * Copy in `content/copy/*.json` carries `{token}` placeholders where a value
 * comes from data rather than from the editor:
 *
 *   "Every tier is open for the {year} season."
 *   "KUFS is {headcount} students across {subteams} subteams."
 *
 * WHY NOT JUST SPLIT THE SENTENCE
 *
 * Because the number moves. Concatenating `"Every tier is open for the "` +
 * year + `" season."` in JSX means an editor can only ever change the two
 * halves around a hole they cannot move — and the first person who wants to
 * write "The {year} season is open at every tier" cannot. A placeholder keeps
 * the whole sentence in one editable field, in whatever order the language
 * needs.
 *
 * DELIBERATELY UNFORGIVING
 *
 * An unknown `{token}` throws rather than rendering literally. A visitor
 * seeing `{headcout}` on the page is worse than a build that failed, and the
 * error names the token and the string so an editor can find it. The panel
 * lists the available tokens in the help text under each field that has them.
 *
 * This module is zero-dependency and free of `server-only`, so client
 * components (the countdown, the enquiry form) can use it too.
 */

/** Values a placeholder can be filled with. */
export type CopyValues = Record<string, string | number>;

const TOKEN = /\{(\w+)\}/g;

/**
 * Replaces every `{token}` in `template` with the matching value.
 *
 * @throws if the template references a token that was not supplied.
 */
export function fill(template: string, values: CopyValues = {}): string {
  return template.replace(TOKEN, (match, token: string) => {
    if (!(token in values)) {
      throw new Error(
        `Unknown placeholder ${match} in copy string:\n  "${template}"\n\n` +
          `Available here: ${Object.keys(values).join(", ") || "(none)"}.\n` +
          `Placeholders are filled by the component that renders the string — ` +
          `if you need a new one, it has to be added there as well as in the text.`,
      );
    }
    return String(values[token]);
  });
}

/**
 * Splits a template into literal text and the tokens between it, so a caller
 * can render a token as something other than a string.
 *
 * This exists for one recurring shape: a sentence with a link in the middle of
 * it. "Someone will reply {window}, from {email}. If you have not heard..." —
 * the email has to be a mailto link, and the alternative to this is cutting the
 * sentence into `successBefore` and `successAfter` fields with a hole between
 * them that an editor cannot move or reorder. That is exactly the trap `fill`
 * was written to avoid, so it is avoided here too.
 *
 * Returns segments in order; a token segment is `{ token: "email" }`.
 */
export function segments(template: string): (string | { token: string })[] {
  const out: (string | { token: string })[] = [];
  let last = 0;
  for (const match of template.matchAll(TOKEN)) {
    if (match.index > last) out.push(template.slice(last, match.index));
    out.push({ token: match[1] });
    last = match.index + match[0].length;
  }
  if (last < template.length) out.push(template.slice(last));
  return out;
}

/**
 * The tokens a string uses. Used by `pnpm check:copy` to verify that every
 * placeholder an editor can type is one the component actually supplies.
 */
export function tokensIn(template: string): string[] {
  return [...template.matchAll(TOKEN)].map((match) => match[1]);
}
