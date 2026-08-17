import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section>
      <div className="flex max-w-[52ch] flex-col gap-5">
        <p className="text-eyebrow uppercase text-accent">404</p>
        <h1 className="text-h1 text-text">That page has gone missing</h1>
        <p className="text-lead text-text-muted">
          It may have moved, or it may not be built yet — we are adding to this site
          through the season. The car, the team and the sponsorship pack are all still
          where you would expect.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/">Back to the home page</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
      </div>
    </Section>
  );
}
