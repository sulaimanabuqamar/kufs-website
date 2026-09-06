/**
 * Email address obfuscation, for addresses published on every page.
 *
 * WHY THIS EXISTS
 *
 * The contact address on this site is currently a personal Gmail account (see
 * the note in README.md — it is interim and must be replaced with a team
 * address before public launch). It appears in the footer of every page, on
 * /contact, on /join and on /become-a-sponsor. Address-harvesting bots crawl
 * for exactly that: a literal `mailto:` in the HTML, or anything matching an
 * email regex in the page source.
 *
 * THE TECHNIQUE: HTML NUMERIC CHARACTER REFERENCES
 *
 * Every character of both the `mailto:` href and the visible link text is
 * emitted as a numeric character reference — `&#115;&#117;&#108;...` — so the
 * page source contains no `@`, no `mailto:`, and nothing an email regex
 * matches.
 *
 * It was chosen over the alternatives because it is the only one that holds
 * all four of the properties this needs at once:
 *
 *   - WORKS WITHOUT JAVASCRIPT. Character references are resolved by the HTML
 *     parser, before scripts run and before the DOM exists. The link is a
 *     real, clickable `mailto:` with JS disabled. Every JS-assembled scheme
 *     ("write the address from three variables on DOMContentLoaded") fails
 *     here, which rules most of them out.
 *
 *   - ANNOUNCED CORRECTLY BY ASSISTIVE TECHNOLOGY. Because the parser decodes
 *     the references, the DOM a screen reader walks holds the ordinary text
 *     "sulaiman.abuqamar@gmail.com" — byte-identical to writing it out. There
 *     is nothing for the accessibility tree to get wrong. This is what rules
 *     out the two most commonly suggested tricks: reversing the string and
 *     flipping it back with `direction: rtl` announces it backwards, and
 *     putting the address in a CSS `content:` property announces it
 *     inconsistently or not at all, because generated content is not reliably
 *     exposed and is not selectable or copyable.
 *
 *   - REAL ADDRESS FOR THE HUMAN. It selects, copies and pastes as itself.
 *
 *   - DEFEATS A NAIVE HARVESTER. Which is the honest limit of the claim: a
 *     scraper that runs the HTML through a real parser, or simply decodes
 *     character references before matching, still gets the address. Nothing
 *     rendered on a public page can prevent that. This stops the regex-over-
 *     raw-HTML crawlers that make up the bulk of harvesting traffic, and it
 *     costs nothing to do. It is not a substitute for replacing the address
 *     with a team one behind a form.
 */

/** Matches the addresses we are prepared to put through `dangerouslySetInnerHTML`. */
const SAFE_ADDRESS = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Every character as a decimal HTML numeric character reference.
 *
 * Applied to the whole string, including `mailto:` and the `@` — a partial
 * encoding that leaves `@` or the domain intact still matches an email regex,
 * which defeats the point.
 */
export function entityEncode(value: string): string {
  return Array.from(value)
    .map((char) => `&#${char.codePointAt(0)};`)
    .join("");
}

/**
 * Decode the above, for the one place that needs the address as a real string
 * at runtime: the enquiry form's `mailto:` fallback, which assembles a URL in
 * JavaScript. That path only runs on a click with JS enabled, so it cannot be
 * the thing that carries the no-JS guarantee — the visible link does that.
 */
export function entityDecode(value: string): string {
  return value.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

/**
 * The complete `<a>` element for an email address, as an HTML string.
 *
 * Returned as HTML rather than as JSX because React escapes text and attribute
 * values when it serialises — `href={"&#109;..."}` would render as the literal
 * characters `&amp;#109;` and produce a broken link. The character references
 * have to reach the HTML output intact, so this is emitted through
 * `dangerouslySetInnerHTML` by the component in
 * src/components/ui/ObfuscatedEmail.tsx.
 *
 * That is safe here, and is kept safe by construction: the address is
 * validated against `SAFE_ADDRESS` and throws otherwise, `className` is
 * restricted to the characters a class attribute holds, and `subject` is fully
 * entity-encoded like the rest. No input to this function can close the
 * attribute or open a tag.
 */
export function mailtoAnchorHtml({
  email,
  className,
  subject,
  label,
}: {
  email: string;
  className?: string;
  /** Optional `?subject=` for the composed message. */
  subject?: string;
  /**
   * Link text, when the link reads as words rather than as the address —
   * "Email us about joining" on /join, "Request the prospectus" on
   * /become-a-sponsor. Omit and the (encoded) address becomes the text.
   *
   * The address is still encoded in the href either way, which is the half a
   * harvester actually reads.
   */
  label?: string;
}): string {
  if (!SAFE_ADDRESS.test(email)) {
    throw new Error(
      `\n\nRefusing to render "${email}" as an obfuscated email link.\n` +
        `It is not a plain address, and this value is emitted as raw HTML.\n` +
        `See src/lib/obfuscateEmail.ts.\n`,
    );
  }
  if (className && /[<>"'&]/.test(className)) {
    throw new Error(`\n\nUnsafe className passed to mailtoAnchorHtml: ${className}\n`);
  }

  const target = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;

  const classAttr = className ? ` class="${className}"` : "";
  // A worded label comes from an editable copy file, so it is escaped rather
  // than trusted. The address, when it is the text, is encoded instead.
  const text = label === undefined ? entityEncode(email) : escapeHtml(label);

  return `<a href="${entityEncode(target)}"${classAttr}>${text}</a>`;
}

/** Text-node escaping for the one string here that is words rather than an address. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
