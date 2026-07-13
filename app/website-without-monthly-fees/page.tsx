import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["website-without-monthly-fees"];

export const metadata = buildSeoMetadata(page);

export default function WebsiteWithoutMonthlyFeesPage() {
  return <SeoLandingPage page={page} />;
}
