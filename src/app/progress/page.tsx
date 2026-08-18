import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

const TITLE = "Progress";
const DESCRIPTION =
  "The KUFS season timeline: design freeze, manufacture, assembly, shakedown and competition.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/progress" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/progress" },
};

/** Routed, metadata-complete, and not yet built out. See README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Season"}
      title={"The build, against the schedule"}
      lead={
        "We publish our milestone dates in advance and then report against them. That includes the ones that slip, because a sponsor deserves the real picture."
      }
      comingSoon={
        "The full season timeline with progress against each milestone, photographs from the workshop, and short written updates when something moves. The next three milestones are already on the home page."
      }
    />
  );
}
