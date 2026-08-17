/**
 * Minimal class-name joiner.
 *
 * Deliberately not `clsx`/`tailwind-merge`: this codebase composes classes by
 * variant lookup rather than by overriding, so conflict resolution is never
 * needed and the dependency would not earn its bytes.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
