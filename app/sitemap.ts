import type { MetadataRoute } from "next";

const baseUrl = "https://www.steadystartco.com";

const routes = [
  "",
  "/pricing",
  "/start-free",
  "/login",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
