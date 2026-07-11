import type { AiWebsiteInput, WebsiteContent, WebsiteTheme } from "@/lib/builder/types";
import { slugify } from "@/lib/builder/utils";

function parsePages(pagesNeeded: string) {
  const parsed = pagesNeeded
    .split(/,|\n/)
    .map((page) => page.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : ["Home", "About", "Services", "Contact"];
}

export function generateWebsiteContent(input: AiWebsiteInput): {
  content: WebsiteContent;
  theme: WebsiteTheme;
} {
  const pages = parsePages(input.pagesNeeded);
  const cta = input.mainCallToAction || "Get Started";
  const brandName = input.businessName || input.websiteName;
  const description =
    input.businessDescription ||
    `${brandName} helps customers with ${input.productsOrServices || "high-quality solutions"}.`;

  const content: WebsiteContent = {
    navigation: pages.map((page, index) => ({
      label: page,
      href: index === 0 ? "/" : `/${slugify(page)}`,
    })),
    pages: pages.map((page, index) => {
      const slug = index === 0 ? "home" : slugify(page);
      const isHome = index === 0;

      return {
        id: slug,
        title: page,
        slug,
        heading: isHome
          ? `${brandName} built for ${input.targetAudience || "your customers"}.`
          : `${page} for ${brandName}`,
        body: isHome
          ? `${description} This ${input.preferredStyle || "modern"} website introduces your business, highlights ${input.productsOrServices || "your offers"}, and guides visitors to take action.`
          : `Use this page to explain your ${page.toLowerCase()} details, build trust, and help visitors understand what to do next.`,
        buttonLabel: cta,
        buttonLink: input.contactEmail ? `mailto:${input.contactEmail}` : "/contact",
      };
    }),
  };

  return {
    content,
    theme: {
      primaryColor: input.primaryColor || "#1473FF",
      secondaryColor: input.secondaryColor || "#0F172A",
      fontFamily: "Inter",
    },
  };
}
