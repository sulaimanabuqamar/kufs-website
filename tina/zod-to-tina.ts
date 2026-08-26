import type { TinaField as TinaCmsField } from "tinacms";
import { z } from "zod";

/**
 * Compiles a Zod schema into TinaCMS fields.
 *
 * WHY GENERATE RATHER THAN HAND-WRITE
 *
 * Tina has its own schema format, and the brief's hard constraint is that Zod
 * stays the single source of truth. Two hand-maintained schemas over the same
 * eight content files will drift — not immediately, but the first time someone
 * adds a field to `src/lib/schemas.ts` and does not know `tina/config.ts`
 * exists. So the Tina fields are derived from the Zod schemas at config time,
 * through Zod 4's own `z.toJSONSchema()`. There is no second schema to update
 * and therefore nothing to keep in sync.
 *
 * THE SAFETY PROPERTY THAT MATTERS
 *
 * This compiler THROWS on any construct it does not recognise. It never
 * silently drops a field, and it never guesses. If someone adds a Zod type
 * this file has not been taught, `pnpm build` fails with the field path in the
 * message — which is the behaviour we want, because the alternative is an
 * editor quietly losing the ability to edit a field, or worse, Tina writing a
 * shape the Zod parse then rejects.
 *
 * WHAT TINA CANNOT EXPRESS, AND WHY THAT IS FINE
 *
 * Cross-field refinements — "each tier appears once", "each person appears
 * once", "at least one role" — have no equivalent in Tina's field model, and
 * neither does `.regex()` or `.max()`. Those stay enforced where they always
 * were: `parseOrThrow` runs during `pnpm build`, so a bad edit through Tina
 * fails CI and never reaches production. Tina's job here is to make the common
 * edit easy and correctly-shaped; Zod's job is to be right. That division is
 * deliberate, not a shortfall.
 */

/* -------------------------------------------------------------------------
   Types
   ------------------------------------------------------------------------- */

export type TinaField = {
  type: string;
  name: string;
  label?: string;
  description?: string;
  list?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
  fields?: TinaField[];
  templates?: { name: string; label: string; fields: TinaField[] }[];
  ui?: Record<string, unknown>;
};

/**
 * Per-field UI metadata, keyed by dotted path from the collection root.
 *
 * This is the ONLY hand-maintained part, and it is deliberately additive: it
 * carries labels, help text and widget choices — things a type cannot know —
 * and it can never add, remove or rename a field. `pnpm check:tina` fails if a
 * key here does not resolve to a real generated field, so a Zod rename shows
 * up as a failure rather than as help text silently disappearing.
 */
export type Overlay = Record<
  string,
  {
    label?: string;
    description?: string;
    /** Overrides the inferred Tina type — "image", "datetime", "textarea". */
    component?: "image" | "datetime" | "textarea" | "rich-text";
    /** For object lists: which child field labels the row in the editor. */
    itemField?: string;
    /** Hide from the editor entirely (computed or developer-only values). */
    hidden?: boolean;
  }
>;

type JsonSchema = {
  type?: string | string[];
  maxLength?: number;
  minLength?: number;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  const?: unknown;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  description?: string;
  default?: unknown;
  [key: string]: unknown;
};

/* -------------------------------------------------------------------------
   Union handling
   ------------------------------------------------------------------------- */

/**
 * `benefitValue` in schemas.ts is `string | false`: a tier benefit is either
 * excluded (false, which the table renders as an em dash) or described by a
 * string ("Yes", "Large", "2 per season"). Tina has no union type, so this is
 * the one shape that needs a codec.
 *
 * It renders as a plain text box. An empty box or the word "No" round-trips to
 * `false`; anything else is stored as the string it already was. The JSON on
 * disk keeps exactly the shape Zod expects — `ui.parse` and `ui.format`
 * translate at the edges rather than changing the data.
 */
const BENEFIT_CODEC = {
  matches: (node: JsonSchema) => {
    const branches = node.anyOf ?? [];
    if (branches.length < 2) return false;
    const booleans = branches.filter((b) => typeof b.const === "boolean");
    const strings = branches.filter((b) => b.type === "string" && b.const === undefined);
    return strings.length === 1 && booleans.length === branches.length - 1;
  },
  field: (name: string): TinaField => ({
    type: "string",
    name,
    ui: {
      // Tina stores what parse() returns and shows what format() returns.
      parse: (value: unknown) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        if (trimmed === "" || /^(no|false|—|-)$/i.test(trimmed)) return false;
        if (/^true$/i.test(trimmed)) return true;
        return trimmed;
      },
      format: (value: unknown) => {
        if (value === false) return "No";
        if (value === true) return "Yes";
        return typeof value === "string" ? value : "";
      },
    },
  }),
};

/**
 * A discriminated union of objects — `roles[]` in team.json, where an
 * Operations role and an Engineering role carry different title enums. Tina
 * models this natively with `templates`, so it maps cleanly.
 */
function discriminatedTemplates(
  branches: JsonSchema[],
): { discriminator: string; values: string[] } | null {
  if (branches.length < 2) return null;
  if (!branches.every((b) => b.type === "object" && b.properties)) return null;

  const first = branches[0].properties as Record<string, JsonSchema>;
  const candidates = Object.keys(first).filter(
    (key) => typeof first[key].const === "string",
  );

  for (const key of candidates) {
    const values = branches.map(
      (b) => (b.properties as Record<string, JsonSchema>)?.[key]?.const,
    );
    if (
      values.every((v) => typeof v === "string") &&
      new Set(values).size === branches.length
    ) {
      return { discriminator: key, values: values as string[] };
    }
  }
  return null;
}

/* -------------------------------------------------------------------------
   Compiler
   ------------------------------------------------------------------------- */

/** Turns "targetMass" / "aedToUsd" into "Target mass" / "Aed to usd". */
function humanise(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Strips the wrappers Zod emits for `.nullable()`, `.optional()`, `.default()`. */
function unwrap(node: JsonSchema): { node: JsonSchema; nullable: boolean } {
  let current = node;
  let nullable = false;

  // Zod renders `.nullable()` as anyOf: [T, {type: "null"}]. A bare `{}` branch
  // is a type with no JSON Schema equivalent (`unrepresentable: "any"`) — that
  // is the `z.date()` half of the news `date` field, which exists only because
  // gray-matter turns an unquoted YAML date into a Date. Neither branch tells
  // Tina anything, so both are dropped and the real branch is kept.
  for (;;) {
    const branches = current.anyOf ?? current.oneOf;
    if (!branches) break;
    const isNull = (b: JsonSchema) => b.type === "null";
    const isAny = (b: JsonSchema) => Object.keys(b).length === 0;
    const dropped = branches.filter((b) => isNull(b) || isAny(b));
    const rest = branches.filter((b) => !isNull(b) && !isAny(b));
    if (dropped.length === 0 || rest.length !== 1) break;
    if (branches.some(isNull)) nullable = true;
    current = { ...rest[0], description: current.description ?? rest[0].description };
  }

  // `.default()` and `z.union([isoDate, z.date()])` can produce an allOf of one.
  if (current.allOf?.length === 1) {
    current = { ...current.allOf[0], description: current.description };
  }
  return { node: current, nullable };
}

/**
 * Turns a Zod `.max()` into panel-side validation and visible help text.
 *
 * WITHOUT THIS THE LIMIT IS ONLY A BUILD FAILURE. An editor pastes a paragraph
 * into a heading, the panel accepts it, the save commits, and the deploy fails
 * several minutes later with a message they have to go and find in a Vercel
 * log. Enforcing it in the field turns that into a red line under the box
 * while they are still typing, which is the whole point of having a limit.
 *
 * Zod is still the authority — this is generated FROM the schema, so the two
 * cannot disagree, and CI remains the backstop for anything edited by hand.
 */
function lengthUi(max: number | undefined, existing: Record<string, unknown> = {}) {
  if (!max) return existing;
  return {
    ...existing,
    validate: (value: unknown) =>
      typeof value === "string" && value.length > max
        ? `${value.length} characters. The most that fits here is ${max} — anything longer wraps and pushes the rest of the page down.`
        : undefined,
  };
}

/** Appends the limit to the help text, so it is visible before it is hit. */
function withLimit(description: string | undefined, max: number | undefined) {
  if (!max) return description;
  const note = `Up to ${max} characters.`;
  return description ? `${description} ${note}` : note;
}

function fail(path: string, reason: string): never {
  throw new Error(
    `tina/zod-to-tina: cannot map ${path || "(root)"} — ${reason}.\n` +
      `  Teach tina/zod-to-tina.ts about this construct, or restate the Zod\n` +
      `  schema in a shape it already handles. It refuses to guess on purpose:\n` +
      `  a silently dropped field is a field an editor can no longer edit.`,
  );
}

function compileNode(
  node: JsonSchema,
  name: string,
  path: string,
  required: boolean,
  overlay: Overlay,
): TinaField | null {
  const ui = overlay[path] ?? {};
  if (ui.hidden) return null;

  const { node: inner, nullable } = unwrap(node);

  const max = typeof inner.maxLength === "number" ? inner.maxLength : undefined;

  const base: Partial<TinaField> = {
    name,
    label: ui.label ?? humanise(name),
    // A nullable field is how this codebase says "not known yet" — it renders
    // as TBC rather than as a hole. Editors need to be told that.
    description: withLimit(
      ui.description ??
        (nullable ? "Leave empty for TBC." : undefined) ??
        inner.description,
      max,
    ),
    required: required && !nullable ? true : undefined,
  };

  // Explicit widget override from the overlay, for shapes a JSON type cannot
  // imply — an image object, an ISO date string, a long-form text box.
  if (ui.component === "image") return { ...base, type: "image" } as TinaField;
  if (ui.component === "datetime") return { ...base, type: "datetime" } as TinaField;
  if (ui.component === "rich-text") return { ...base, type: "rich-text" } as TinaField;
  if (ui.component === "textarea") {
    return {
      ...base,
      type: "string",
      ui: lengthUi(max, { component: "textarea" }),
    } as TinaField;
  }

  // Enums.
  if (Array.isArray(inner.enum)) {
    return {
      ...base,
      type: "string",
      options: inner.enum.map((v) => ({ value: String(v), label: String(v) })),
    } as TinaField;
  }

  // Unions.
  if (inner.anyOf || inner.oneOf) {
    const branches = (inner.anyOf ?? inner.oneOf) as JsonSchema[];

    if (BENEFIT_CODEC.matches(inner)) {
      return { ...base, ...BENEFIT_CODEC.field(name) } as TinaField;
    }

    // A union of string literals is an enum written the long way.
    if (branches.every((b) => typeof b.const === "string")) {
      return {
        ...base,
        type: "string",
        options: branches.map((b) => ({
          value: String(b.const),
          label: String(b.const),
        })),
      } as TinaField;
    }

    // A union of identical primitive types collapses to that type — this is
    // `date: isoDate | z.date()`, both of which arrive as one field.
    const types = new Set(branches.map((b) => b.type));
    if (types.size === 1 && (types.has("string") || types.has("number"))) {
      return types.has("string")
        ? ({ ...base, type: "string", ui: lengthUi(max) } as TinaField)
        : ({ ...base, type: "number" } as TinaField);
    }

    const discriminated = discriminatedTemplates(branches);
    if (discriminated) {
      return {
        ...base,
        type: "object",
        templates: branches.map((branch, index) => {
          const value = discriminated.values[index];
          return {
            name: value.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase(),
            label: value,
            fields: compileObject(branch, `${path}.${value}`, overlay),
          };
        }),
      } as TinaField;
    }

    fail(path, `union of ${branches.map((b) => b.type ?? "?").join(" | ")}`);
  }

  // Arrays.
  if (inner.type === "array") {
    if (!inner.items) fail(path, "array with no item schema");
    const item = compileNode(inner.items, name, path, true, overlay);
    if (!item) fail(path, "array item was hidden by the overlay");
    return {
      ...base,
      ...item,
      label: base.label,
      description: base.description,
      list: true,
      required: undefined,
      ui: {
        ...(item.ui ?? {}),
        ...(ui.itemField
          ? {
              itemProps: (props: Record<string, unknown>) => ({
                label: String(props?.[ui.itemField as string] ?? ""),
              }),
            }
          : {}),
      },
    } as TinaField;
  }

  // Objects.
  if (inner.type === "object") {
    return {
      ...base,
      type: "object",
      fields: compileObject(inner, path, overlay),
    } as TinaField;
  }

  if (inner.type === "string") {
    return { ...base, type: "string", ui: lengthUi(max) } as TinaField;
  }
  if (inner.type === "number" || inner.type === "integer") {
    return { ...base, type: "number" } as TinaField;
  }
  if (inner.type === "boolean") return { ...base, type: "boolean" } as TinaField;

  fail(path, `unhandled JSON Schema node ${JSON.stringify(inner).slice(0, 120)}`);
}

function compileObject(node: JsonSchema, path: string, overlay: Overlay): TinaField[] {
  const properties = node.properties;
  if (!properties) fail(path, "object with no properties");

  const required = new Set(node.required ?? []);
  const fields: TinaField[] = [];

  for (const [key, child] of Object.entries(properties)) {
    const field = compileNode(
      child,
      key,
      path ? `${path}.${key}` : key,
      required.has(key),
      overlay,
    );
    if (field) fields.push(field);
  }

  if (fields.length === 0) fail(path, "every field was hidden — Tina needs at least one");
  return fields;
}

/**
 * Compiles a Zod object schema into a Tina field list.
 *
 * `unrepresentable: "any"` covers the one Zod type with no JSON Schema
 * equivalent — the `z.date()` branch of the news `date` field, which exists
 * only because gray-matter turns an unquoted YAML date into a Date. The
 * overlay pins that field to Tina's datetime widget.
 */
export function fieldsFromZod(schema: z.ZodType, overlay: Overlay = {}): TinaCmsField[] {
  const json = z.toJSONSchema(schema, {
    io: "input",
    unrepresentable: "any",
  }) as JsonSchema;

  const { node } = unwrap(json);
  const fields =
    node.type === "array"
      ? compileObject(
          node.items ?? fail("", "top-level array with no item schema"),
          "",
          overlay,
        )
      : compileObject(node, "", overlay);

  // Tina's own TinaField is a discriminated union of about twenty shapes, and
  // a compiler that builds fields at runtime cannot be statically proven to
  // land inside it. The cast is the one place that gap is acknowledged, and it
  // is checked rather than assumed: `pnpm check:tina` compiles every schema on
  // every CI run, and `tinacms build` rejects a malformed field outright.
  return fields as unknown as TinaCmsField[];
}

/** Flat list of every generated field path — used by `pnpm check:tina`. */
export function fieldPaths(fields: TinaField[], prefix = ""): string[] {
  const out: string[] = [];
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    out.push(path);
    if (field.fields) out.push(...fieldPaths(field.fields, path));
    for (const template of field.templates ?? []) {
      out.push(...fieldPaths(template.fields, `${path}.${template.label}`));
    }
  }
  return out;
}
