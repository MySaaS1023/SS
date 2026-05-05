import { IntakeForm } from "@/components/intake-form";
import { PageContainer } from "@/components/page-container";
import { PackageKey } from "@/lib/site-data";

type GetStartedPageProps = {
  searchParams?: Promise<{ package?: string }>;
};

const validPackages: PackageKey[] = ["starter", "business", "premium"];

export default async function GetStartedPage({
  searchParams,
}: GetStartedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const packageParam = params?.package;
  const selectedPackage = validPackages.includes(packageParam as PackageKey)
    ? (packageParam as PackageKey)
    : undefined;

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <IntakeForm selectedPackage={selectedPackage} />
      </PageContainer>
    </section>
  );
}
