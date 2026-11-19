export type ExploreClient = {
  id: string;
  name: string;
  url: string;
  description: string;
  imageSrc: string | null;
  imageAlt: string;
  screenshotSource: string;
};

export const exploreClients: ExploreClient[] = [
  {
    id: "grubel",
    name: "Grubel Property Services",
    url: "https://grubelps.com",
    description:
      "A professional online presence for a property services business.",
    imageSrc: null,
    imageAlt: "Grubel Property Services homepage",
    screenshotSource:
      "Original homepage screenshot required; no substitute artwork used.",
  },
  {
    id: "apex",
    name: "Apex Landscaping & Home Repair LLC",
    url: "https://apexlhservices.com",
    description: "A service-focused website for landscaping and home repair.",
    imageSrc: "/portfolio/about-apex-homepage.webp",
    imageAlt:
      "Actual Apex Landscaping & Home Repair LLC homepage showing its landscaping and home repair services",
    screenshotSource:
      "Existing approved project screenshot: public/portfolio/apex-homepage-hero.png, optimized as public/portfolio/about-apex-homepage.webp.",
  },
  {
    id: "reliable-climate",
    name: "Reliable Climate Control Solutions",
    url: "https://rccsnm.com",
    description:
      "A clear, customer-focused website for a climate control business.",
    imageSrc: null,
    imageAlt: "Reliable Climate Control Solutions homepage",
    screenshotSource:
      "Original homepage screenshot required; no substitute artwork used.",
  },
];
