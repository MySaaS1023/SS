import { publicPageMetadata } from "@/lib/seo";
import { PageContainer } from "@/components/page-container";
import { ConnectContent } from "@/components/connect/connect-content";
import { getSocialSettings } from "@/lib/social-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = publicPageMetadata("/connect");

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
