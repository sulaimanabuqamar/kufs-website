import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

const TITLE = "Press Kit";
const DESCRIPTION =
  "Downloadable logos, photography and team information for press and media enquiries.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/press-kit" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/press-kit" },
};

/** Routed, metadata-complete, and not yet built out. See README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Media"}
      title={"Logos, imagery and team facts"}
      lead={
        "High-resolution car photography, the KUFS logo in every format, a one-page fact sheet and our media contact."
      }
      comingSoon={
        "Downloadable brand assets, approved photography, and a fact sheet covering the team, the car and our competition history. Until it is here, email us and we will send whatever you need directly."
      }
    />
  );
}
