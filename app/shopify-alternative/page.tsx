import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["shopify-alternative"];

export const metadata = buildSeoMetadata(page);

export default function ShopifyAlternativePage() {
  return <SeoLandingPage page={page} />;
}
