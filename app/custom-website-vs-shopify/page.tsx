import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["custom-website-vs-shopify"];

export const metadata = buildSeoMetadata(page);

export default function CustomWebsiteVsShopifyPage() {
  return <SeoLandingPage page={page} />;
}
