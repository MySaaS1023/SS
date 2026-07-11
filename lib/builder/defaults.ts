import type { WebsiteContent, WebsiteTheme } from "@/lib/builder/types";
import { slugify } from "@/lib/builder/utils";

export const defaultWebsiteTheme: WebsiteTheme = {
  primaryColor: "#1473FF",
  secondaryColor: "#0F172A",
  fontFamily: "Inter",
};

export function createBlankWebsiteContent(websiteName: string): WebsiteContent {
  const name = websiteName.trim() || "My Website";
  const pages = ["Home"];

  return {
    navigation: pages.map((page) => ({
      label: page,
      href: page === "Home" ? "/" : `/${slugify(page)}`,
    })),
    pages: [
      {
        id: "home",
        title: "Home",
        slug: "home",
        heading: `${name} starts here.`,
        body: "Use this page to introduce your business, explain what you offer, and guide visitors toward the next step.",
        buttonLabel: "Contact Us",
        buttonLink: "/contact",
      },
    ],
  };
}
