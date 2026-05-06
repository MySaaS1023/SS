import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["custom-website-vs-squarespace"];

export const metadata = buildSeoMetadata(page);

export default function CustomWebsiteVsSquarespacePage() {
  return <SeoLandingPage page={page} />;
}
