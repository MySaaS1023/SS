import type { MetadataRoute } from "next";
import { publicPageSeo, SITE_URL } from "@/lib/seo";
import { seoPages } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  // Explicit public allowlist excludes account, customer-token and conversion
  // URLs. Omit lastModified until a real content modification date is available.
  const paths = [
    ...Object.keys(publicPageSeo),
    ...Object.values(seoPages).map((page) => `/${page.slug}`),
  ];
  return paths.map((path) => ({ url: new URL(path, SITE_URL).href }));
}
