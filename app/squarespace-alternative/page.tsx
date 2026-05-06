import { SeoLandingPage, buildSeoMetadata } from "@/components/seo-landing-page";
import { seoPages } from "@/lib/seo-pages";

const page = seoPages["squarespace-alternative"];

export const metadata = buildSeoMetadata(page);

export default function SquarespaceAlternativePage() {
  return <SeoLandingPage page={page} />;
}
