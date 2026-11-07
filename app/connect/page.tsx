import type { Metadata } from "next";
import { PageContainer } from "@/components/page-container";
import { ConnectContent } from "@/components/connect/connect-content";
import { getSocialSettings } from "@/lib/social-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Leave a Review & Connect With Us | Steady Start",
  description:
    "Share your experience on Google and follow Steady Start LLC for business tips, website inspiration, and updates.",
  alternates: { canonical: "https://www.steadystartco.com/connect" },
  openGraph: {
    title: "Leave a Review & Connect With Us | Steady Start",
    description:
      "Your feedback means a lot to us. Review and connect with Steady Start LLC.",
    url: "https://www.steadystartco.com/connect",
  },
};

export default async function ConnectPage() {
  const settings = await getSocialSettings();
  return (
    <section className="py-12 sm:py-20">
      <PageContainer>
        <ConnectContent settings={settings} />
      </PageContainer>
    </section>
  );
}
