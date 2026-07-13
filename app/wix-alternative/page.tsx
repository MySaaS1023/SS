import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["wix-alternative"];

export const metadata = buildSeoMetadata(page);

export default function WixAlternativePage() {
  return <SeoLandingPage page={page} />;
}
