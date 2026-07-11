import { WebsiteEditor } from "@/components/builder/website-editor";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type EditWebsitePageProps = {
  params: Promise<{
    websiteId: string;
  }>;
};

export default async function EditWebsitePage({ params }: EditWebsitePageProps) {
  const { websiteId } = await params;

  return (
    <DashboardShell activeSection="websites">
      <section className="mx-auto max-w-7xl">
        <WebsiteEditor websiteId={websiteId} />
      </section>
    </DashboardShell>
  );
}
