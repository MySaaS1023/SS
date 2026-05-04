import type { MetadataRoute } from "next";

const baseUrl = "https://www.steadystartco.com";

const routes = [
  "",
  "/pricing",
  "/get-started",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/shopify-alternative",
  "/wix-alternative",
  "/squarespace-alternative",
  "/custom-website-vs-wix",
  "/website-without-monthly-fees",
  "/custom-website-vs-shopify",
  "/custom-website-vs-squarespace",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
