"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Desktop nav link. Client-side only because it needs the current pathname to
 * set `aria-current="page"` — the underline is the visual half of the same
 * signal, so the state is never colour-alone.
 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        "relative inline-flex h-11 items-center rounded-sm px-3 text-small font-medium " +
        "transition-colors duration-[var(--duration-fast)] " +
        (current
          ? "text-text after:absolute after:inset-x-3 after:bottom-2.5 after:h-px after:bg-accent"
          : "text-text-muted hover:text-text")
      }
    >
      {children}
    </Link>
  );
}
