import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Our Sponsors",
  description:
    "The companies and organisations backing our Formula Student campaign, and what each of them contributes.",
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Our Sponsors",
    description:
      "The companies and organisations backing our Formula Student campaign, and what each of them contributes.",
    url: "/sponsors",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Partners"}
      title={"The companies behind the car"}
      lead={
        "Every partner, what they contribute, and what it bought us on track. Sponsorship of a Formula Student team is unusually legible: you can point at the part."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
