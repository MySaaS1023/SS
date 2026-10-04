import { IntakeForm } from "@/components/intake-form";
import { PageContainer } from "@/components/page-container";
import { resolveServiceKey } from "@/lib/site-data";

type GetStartedPageProps = {
  searchParams?: Promise<{ service?: string; package?: string }>;
};

export default async function GetStartedPage({
  searchParams,
}: GetStartedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedPackage = resolveServiceKey(params?.service ?? params?.package);

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <IntakeForm selectedPackage={selectedPackage} />
      </PageContainer>
    </section>
  );
}
