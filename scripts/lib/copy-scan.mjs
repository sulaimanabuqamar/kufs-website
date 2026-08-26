/**
 * Finds user-visible string literals in TSX/TS source.
 *
 * Shared by `pnpm check:copy` (which fails the build when new hardcoded copy
 * appears) and by the one-off inventory that produced content/copy/*.json.
 *
 * WHY AN AST AND NOT A REGEX
 *
 * The question "is this string visible to a reader" is a question about where
 * the string sits in the syntax, not about what it looks like. `"Become a
 * sponsor"` is copy as JSX text and is copy as a `title=` prop, but the
 * identical string is not copy inside `className`, `href` or a `data-` value.
 * A regex cannot tell those apart; the TypeScript compiler already can, and it
 * is a dependency of this repo, so this walks its AST.
 *
 * THE HEURISTIC
 *
 * A string is reported when it is:
 *   - JSX text between tags, or a string in a JSX expression child, or
 *   - a string literal passed to a prop named in COPY_PROPS, or
 *   - a string in `export const metadata` / `generateMetadata`.
 *
 * ...and it is not:
 *   - in a file matching an allowlisted path,
 *   - on a prop named in STRUCTURAL_PROPS,
 *   - inside a `// copy-ok` annotated statement,
 *   - shorter than MIN_LENGTH with no whitespace (that catches "px", "—",
 *     ":", arrows and separators, which are typography rather than words).
 *
 * The bias is deliberate: report anything arguable and let the allowlist say
 * no explicitly. A false positive costs one line in an allowlist; a false
 * negative is a string an editor cannot reach and nobody notices for a year.
 */

import { readFileSync } from "node:fs";

import ts from "typescript";

/* -------------------------------------------------------------------------
   What counts
   ------------------------------------------------------------------------- */

/** Props whose string values are read by a human. */
export const COPY_PROPS = new Set([
  "title",
  "label",
  "eyebrow",
  "lead",
  "description",
  "note",
  "placeholder",
  "heading",
  "summary",
  "body",
  "text",
  "cta",
  "ctaLabel",
  "caption",
  "legend",
  "hint",
  "error",
  "success",
  "answer",
  "question",
  "alt",
  "siteName",
]);

/**
 * Props whose string values are machinery, not words.
 *
 * `alt` is deliberately NOT here — alt text is editorial and is now editable.
 * `aria-label` is: where it exists on this site it duplicates adjacent visible
 * text or names an icon control, and both are structural decisions rather than
 * copy an editor should be rewording independently of what it labels.
 */
export const STRUCTURAL_PROPS = new Set([
  "className",
  "class",
  "href",
  "src",
  "id",
  "key",
  "name",
  "type",
  "rel",
  "target",
  "role",
  "sizes",
  "dateTime",
  "htmlFor",
  "as",
  "variant",
  "size",
  "tone",
  "mode",
  "on",
  "labelledBy",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-hidden",
  "aria-live",
  "autoComplete",
  "inputMode",
  "method",
  "action",
  "encType",
  "property",
  "content",
  "charSet",
  "crossOrigin",
  "loading",
  "fetchPriority",
  "decoding",
  "style",
  "width",
  "height",
  "fill",
  "color",
  "font",
  "format",
  "path",
  "slug",
  "value",
  "defaultValue",
  "pattern",
]);

/** Below this, with no space in it, a string is punctuation or a unit. */
const MIN_LENGTH = 3;

/**
 * Rejects strings that are code wearing a string's clothes.
 *
 * Tailwind class maps, CSS selectors, transforms and enum values all live in
 * string literals and all reach this scan. The discriminator is deliberately
 * conservative — it only says "code" when it is sure — because the cost of a
 * false positive is one allowlist line and the cost of a false negative is a
 * string no editor can reach.
 */
function looksLikeCode(text) {
  const trimmed = text.trim();

  // Punctuation that never appears in a sentence but is everywhere in a
  // selector, a class list, a URL or a CSS function.
  if (/[[\]{}()<>:;=#/\\@*|]/.test(trimmed)) return true;

  // A single lowercase token, hyphenated or not: an enum value, a class, a
  // slug, a key. Real one-word copy is capitalised ("Sponsors", "Apply").
  if (/^[a-z0-9-]+$/.test(trimmed)) return true;

  // Every token is a lowercase hyphenated utility: "h-11 px-5 text-body".
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 1 && tokens.every((t) => /^[a-z0-9]+(-[a-z0-9.]+)+$/.test(t))) {
    return true;
  }

  return false;
}

/** Opt-out marker for a string that is genuinely developer-owned. */
const OPT_OUT = /\bcopy-ok\b/;

/* -------------------------------------------------------------------------
   Scan
   ------------------------------------------------------------------------- */

function isWordy(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Pure punctuation, arrows, separators, entities.
  if (!/[A-Za-z]/.test(trimmed)) return false;
  if (trimmed.length < MIN_LENGTH && !/\s/.test(trimmed)) return false;
  if (looksLikeCode(trimmed)) return false;
  return true;
}

/** Walks up to find whether the node sits under a `copy-ok` comment. */
function hasOptOut(node, fullText) {
  for (let current = node; current; current = current.parent) {
    const ranges = ts.getLeadingCommentRanges(fullText, current.getFullStart());
    if (ranges) {
      for (const range of ranges) {
        if (OPT_OUT.test(fullText.slice(range.pos, range.end))) return true;
      }
    }
    // Only look a few levels up; a `copy-ok` on a whole file would be a lie.
    if (ts.isStatement(current)) break;
  }
  return false;
}

/** The prop name a string literal is being passed to, if any. */
function enclosingPropName(node) {
  const parent = node.parent;
  if (!parent) return null;

  // <X prop="value" />
  if (ts.isJsxAttribute(parent)) return parent.name.getText();
  // <X prop={"value"} /> and <X prop={cond ? "a" : "b"} />
  if (ts.isJsxExpression(parent) && parent.parent && ts.isJsxAttribute(parent.parent)) {
    return parent.parent.name.getText();
  }
  // { title: "value" } — an object literal property, e.g. metadata or a
  // hand-rolled content array inside a component.
  if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.getText();
  }
  // Ternaries and template heads inside a prop.
  if (
    ts.isConditionalExpression(parent) ||
    ts.isBinaryExpression(parent) ||
    ts.isParenthesizedExpression(parent)
  ) {
    return enclosingPropName(parent);
  }
  return null;
}

/**
 * Scans one file.
 *
 * @returns {{ line: number, kind: string, prop: string|null, text: string }[]}
 */
export function scanFile(file) {
  const source = readFileSync(file, "utf8");
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found = [];

  const record = (node, kind, prop, text) => {
    if (!isWordy(text)) return;
    if (hasOptOut(node, source)) return;
    const { line } = ast.getLineAndCharacterOfPosition(node.getStart());
    found.push({ line: line + 1, kind, prop, text: text.trim().replace(/\s+/g, " ") });
  };

  const visit = (node) => {
    // Text sitting directly between JSX tags.
    if (ts.isJsxText(node)) {
      record(node, "jsx-text", null, node.text);
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const prop = enclosingPropName(node);

      if (prop && STRUCTURAL_PROPS.has(prop)) {
        // Machinery. Not copy.
      } else if (prop && COPY_PROPS.has(prop)) {
        record(node, "prop", prop, node.text);
      } else if (
        node.parent &&
        ts.isJsxExpression(node.parent) &&
        node.parent.parent &&
        !ts.isJsxAttribute(node.parent.parent)
      ) {
        // {"literal"} used as a child.
        record(node, "jsx-child", null, node.text);
      } else if (prop) {
        // An unrecognised prop or object key carrying a wordy string. Reported
        // rather than ignored — this is where new copy shows up first.
        record(node, "unknown-prop", prop, node.text);
      } else if (ts.isArrayLiteralExpression(node.parent ?? {})) {
        // A bare array of strings, e.g. a list of bullet points.
        record(node, "array-item", null, node.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(ast);
  return found;
}
