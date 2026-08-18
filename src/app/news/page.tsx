import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

const TITLE = "News";
const DESCRIPTION =
  "Build updates, competition reports and technical write-ups from Khalifa University Formula Student.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/news" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/news" },
};

/** Routed, metadata-complete, and not yet built out. See README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Updates"}
      title={"From the workshop and the paddock"}
      lead={
        "Build updates, event reports and post-mortems, written by the people who did the work."
      }
      comingSoon={
        "Individual article pages with the full write-ups. The three most recent posts are summarised on the home page; this index and the article routes land in the next milestone."
      }
    />
  );
}
