import { IntakeForm } from "@/components/intake-form";
import { PageContainer } from "@/components/page-container";
import { ServiceKey } from "@/lib/site-data";

type GetStartedPageProps = {
  searchParams?: Promise<{ package?: string }>;
};

const validPackages: ServiceKey[] = [
  "business-setup",
  "custom-website-bundle",
  "custom-website-plus-bundle",
  "complete-business-launch",
];

export default async function GetStartedPage({
  searchParams,
}: GetStartedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const packageParam = params?.package;
  const selectedPackage = validPackages.includes(packageParam as ServiceKey)
    ? (packageParam as ServiceKey)
    : undefined;

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <IntakeForm selectedPackage={selectedPackage} />
      </PageContainer>
    </section>
  );
}
