import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "The Car",
  description:
    "A technical breakdown of our Formula Student car: chassis, powertrain, aero, suspension and electronics.",
  alternates: { canonical: "/the-car" },
  openGraph: {
    title: "The Car",
    description:
      "A technical breakdown of our Formula Student car: chassis, powertrain, aero, suspension and electronics.",
    url: "/the-car",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Engineering"}
      title={"The 2027 car, system by system"}
      lead={
        "Monocoque, powertrain, aerodynamics, suspension and electronics — the design decisions, the numbers behind them, and the ones we would take back."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
