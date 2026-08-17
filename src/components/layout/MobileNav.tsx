"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/layout/Wordmark";
import { CTA, PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";

/**
 * Mobile navigation drawer.
 *
 * - focus is trapped while open and restored to the trigger on close
 * - Escape closes it (handled inside useFocusTrap)
 * - a route change closes it, so tapping a link never leaves it hanging open
 * - background scroll is locked while open
 *
 * The panel is always in the DOM but `hidden` when closed, so the browser's
 * find-in-page and the accessibility tree both stay honest.
 */
export function MobileNav({ teamName }: { teamName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useFocusTrap(panelRef, open, close);
  useScrollLock(open);

  // Close on navigation. Runs on pathname change only — not on mount.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong text-text"
      >
        <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="size-5">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </svg>
      </button>

      {/* Scrim. Decorative — Escape and the close button are the real controls. */}
      <div
        aria-hidden
        onClick={close}
        hidden={!open}
        className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        className="fixed inset-y-0 right-0 z-50 flex w-[min(21rem,88vw)] flex-col border-l border-border bg-surface shadow-[var(--shadow-raised)]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Wordmark name={teamName} />
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 items-center justify-center rounded-md text-text-muted hover:text-text"
          >
            <span className="sr-only">Close menu</span>
            <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="size-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="flex flex-col gap-1">
            {PRIMARY_NAV.map((item) => {
              const current = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className="flex flex-col gap-0.5 rounded-md px-3 py-3 hover:bg-surface-raised aria-[current=page]:text-accent"
                  >
                    <span className="text-h4 text-text">{item.label}</span>
                    {item.description ? (
                      <span className="text-caption text-text-muted">
                        {item.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <hr className="my-6 border-border" />

          <ul className="flex flex-col gap-1">
            {SECONDARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block rounded-md px-3 py-2.5 text-small text-text-muted hover:text-text aria-[current=page]:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-5">
          <Button href={CTA.join.href} size="md" className="w-full">
            {CTA.join.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
