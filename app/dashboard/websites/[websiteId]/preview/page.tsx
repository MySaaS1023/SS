import { WebsitePreview } from "@/components/builder/website-preview";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type PreviewWebsitePageProps = {
  params: Promise<{
    websiteId: string;
  }>;
};

export default async function PreviewWebsitePage({ params }: PreviewWebsitePageProps) {
  const { websiteId } = await params;

  return (
    <DashboardShell activeSection="websites">
      <section className="mx-auto max-w-7xl">
        <WebsitePreview websiteId={websiteId} />
      </section>
    </DashboardShell>
  );
}
