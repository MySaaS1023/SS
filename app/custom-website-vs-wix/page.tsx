import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["custom-website-vs-wix"];

export const metadata = buildSeoMetadata(page);

export default function CustomWebsiteVsWixPage() {
  return <SeoLandingPage page={page} />;
}
