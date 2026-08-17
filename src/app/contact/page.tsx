import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach the team for sponsorship, recruitment, press and general enquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact",
    description:
      "How to reach the team for sponsorship, recruitment, press and general enquiries.",
    url: "/contact",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Get in touch"}
      title={"Talk to us"}
      lead={
        "Sponsorship, recruitment, press, or a question about the car — the right person will answer, usually within two working days."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
