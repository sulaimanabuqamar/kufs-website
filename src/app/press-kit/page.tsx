import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Press Kit",
  description:
    "Downloadable logos, photography and team information for press and media enquiries.",
  alternates: { canonical: "/press-kit" },
  openGraph: {
    title: "Press Kit",
    description:
      "Downloadable logos, photography and team information for press and media enquiries.",
    url: "/press-kit",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Media"}
      title={"Logos, imagery and team facts"}
      lead={
        "High-resolution car photography, the team logo in every format, a one-page fact sheet and our media contact."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
