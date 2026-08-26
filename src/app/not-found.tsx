import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: getCopy("not-found").meta.title,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const copy = getCopy("not-found");

  return (
    <Section>
      <div className="flex max-w-[52ch] flex-col gap-5">
        <p className="text-eyebrow uppercase text-accent">404</p>
        <h1 className="text-h1 text-text">{copy.title}</h1>
        <p className="text-lead text-text-muted">{copy.body}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/">{copy.homeLink}</Button>
          <Button href="/contact" variant="secondary">
            {copy.contactLink}
          </Button>
        </div>
      </div>
    </Section>
  );
}
