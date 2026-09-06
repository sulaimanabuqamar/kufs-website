import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/Button";
import { mailtoAnchorHtml } from "@/lib/obfuscateEmail";

/**
 * An email address rendered as a working `mailto:` link that a naive
 * address harvester cannot read.
 *
 * Use this ANYWHERE an address is shown. There should be no plain
 * `<a href={`mailto:${...}`}>` left on the site; scripts/check-brand-rules.mjs
 * fails the build if one comes back.
 *
 * The whole technique, the alternatives it was chosen over and the honest
 * limit of what it protects against are documented in src/lib/obfuscateEmail.ts.
 *
 * It renders no wrapper element — just the anchor — so it drops into a
 * sentence, a `<dd>` or a list item without changing the layout. `<span>` is
 * the carrier because `dangerouslySetInnerHTML` needs a host element, and a
 * span is inline and semantically invisible.
 *
 * Accessibility: there is deliberately no `aria-label`. The decoded link text
 * IS the address, so a screen reader already announces it correctly, and an
 * aria-label would have to hold the address in plain text — putting back in
 * the HTML the exact string the encoding exists to keep out.
 */
export function ObfuscatedEmail({
  email,
  className,
  subject,
}: {
  email: string;
  /** Applied to the anchor itself. */
  className?: string;
  /** Optional `?subject=` for the composed message. */
  subject?: string;
}) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: mailtoAnchorHtml({ email, className, subject }),
      }}
    />
  );
}

/**
 * The same link, styled as a `<Button>`, for the two calls to action whose
 * label is words rather than the address itself.
 *
 * It cannot be a `<Button href=...>`: React escapes attribute values when it
 * serialises, so the character references would reach the browser as the
 * literal text `&amp;#109;` and the link would not work. It takes its classes
 * from `buttonClasses()` — the same function `<Button>` uses — so the two
 * cannot drift apart visually.
 *
 * `inline-flex` is on the anchor, so the carrier span is given `contents` and
 * disappears from the box tree rather than becoming an inline wrapper that
 * would break the button's alignment inside a flex row.
 */
export function ObfuscatedEmailButton({
  email,
  label,
  subject,
  variant,
  size,
  className,
}: {
  email: string;
  /** The words on the button. */
  label: string;
  subject?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <span
      className="contents"
      dangerouslySetInnerHTML={{
        __html: mailtoAnchorHtml({
          email,
          subject,
          label,
          className: buttonClasses({ variant, size, className }),
        }),
      }}
    />
  );
}
