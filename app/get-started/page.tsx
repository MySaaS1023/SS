import { buildNoIndexMetadata } from "@/lib/seo";
import { IntakeForm } from "@/components/intake-form";
import { PageContainer } from "@/components/page-container";
import { resolveServiceKey } from "@/lib/site-data";
import { getWebsiteDesign } from "@/lib/explore-designs";

export const metadata = buildNoIndexMetadata("Start Your Project | Steady Start LLC", "Share your business goals and project requirements through the existing Steady Start guided intake.");


type GetStartedPageProps = {
  searchParams?: Promise<{
    service?: string;
    package?: string;
    design?: string | string[];
  }>;
};

export default async function GetStartedPage({
  searchParams,
}: GetStartedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedPackage = resolveServiceKey(params?.service ?? params?.package);
  const selectedDesign =
    typeof params?.design === "string" && params.design.length <= 80
      ? getWebsiteDesign(params.design)
      : undefined;

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <IntakeForm
          selectedPackage={selectedPackage}
          initialValues={
            selectedDesign
              ? {
                  extraNotes: `Selected website design: ${selectedDesign.name}. Please customize this design for my business.`,
                }
              : undefined
          }
        />
      </PageContainer>
    </section>
  );
}
