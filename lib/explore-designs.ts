export const designCategories = [
  { id: "all", label: "All Designs" },
  { id: "service", label: "Service Businesses" },
  { id: "store", label: "Online Stores" },
  { id: "creator", label: "Creators & Vlogging" },
  { id: "creative", label: "Personal & Creative" },
  { id: "professional", label: "Professional Businesses" },
  { id: "food", label: "Restaurants & Food" },
  { id: "wellness", label: "Health & Wellness" },
] as const;

export type DesignCategory = (typeof designCategories)[number]["id"];
export type SampleSocialPlatform =
  | "Facebook"
  | "Instagram"
  | "Pinterest"
  | "YouTube"
  | "TikTok"
  | "LinkedIn"
  | "Behance";
export type WebsiteDesign = {
  id: string;
  name: string;
  category: Exclude<DesignCategory, "all">;
  description: string;
  headline: string;
  eyebrow: string;
  cta: string;
  brand: string;
  socialPlatforms: SampleSocialPlatform[];
  imageSrc?: string;
  imageAlt?: string;
  features: string[];
};

export const websiteDesigns: WebsiteDesign[] = [
  {
    id: "home-services",
    name: "Home Services",
    category: "service",
    description:
      "A trustworthy home for repairs, services, and quote requests.",
    headline: "Good work. A home you love.",
    eyebrow: "YOUR LOCAL HOME SPECIALISTS",
    cta: "Request a quote",
    brand: "HOMESTEAD",
    imageSrc: "/templates/about-home-services.webp",
    imageAlt:
      "Modern home at dusk with warm windows and a landscaped front garden",
    socialPlatforms: ["Facebook", "Instagram"],
    features: ["Our services", "Meet the team", "Get in touch"],
  },
  {
    id: "landscaping",
    name: "Landscaping",
    category: "service",
    description:
      "An outdoor-inspired design for beautiful spaces and local services.",
    headline: "Make room for a greener life.",
    eyebrow: "LANDSCAPE DESIGN & CARE",
    cta: "Plan your garden",
    brand: "GREENFIELD",
    imageSrc: "/templates/explore-landscaping.webp",
    imageAlt:
      "A lush landscaped garden with a stone pathway and sculpted greenery",
    socialPlatforms: ["Facebook", "Instagram"],
    features: ["Garden design", "Seasonal care", "Request an estimate"],
  },
  {
    id: "online-store",
    name: "Online Store",
    category: "store",
    description:
      "A considered storefront with product, collection, and cart concepts.",
    headline: "Everyday pieces. Thoughtfully chosen.",
    eyebrow: "THE EVERYDAY COLLECTION",
    cta: "Explore the collection",
    brand: "FORM & FOLD",
    imageSrc: "/templates/about-store.webp",
    imageAlt: "A plain ivory T-shirt with neatly folded neutral clothing",
    socialPlatforms: ["Instagram", "Facebook", "Pinterest"],
    features: ["New arrivals", "Shop collections", "Your cart"],
  },
  {
    id: "creator-vlogging",
    name: "Creator & Vlogging",
    category: "creator",
    description:
      "A home for your videos, stories, collaborations, and community.",
    headline: "New stories. New perspectives.",
    eyebrow: "CREATE. SHARE. CONNECT.",
    cta: "Watch the latest",
    brand: "THE EVERYDAY EDIT",
    socialPlatforms: ["YouTube", "TikTok", "Instagram", "Facebook"],
    features: ["Latest videos", "Behind the scenes", "Work with me"],
  },
  {
    id: "restaurant-food",
    name: "Restaurant & Food",
    category: "food",
    description:
      "An inviting menu, reservation, and ordering concept for food businesses.",
    headline: "Gather around something good.",
    eyebrow: "FRESH INGREDIENTS. GOOD COMPANY.",
    cta: "View the menu",
    brand: "TABLE & THYME",
    imageSrc: "/templates/explore-restaurant.webp",
    imageAlt:
      "A plated pasta dish with fresh basil in a warm restaurant setting",
    socialPlatforms: ["Instagram", "Facebook"],
    features: ["Seasonal menu", "Book a table", "Order concept"],
  },
  {
    id: "professional-business",
    name: "Professional Business",
    category: "professional",
    description:
      "A confident presence for consultants, agencies, and professional teams.",
    headline: "Clarity for your next chapter.",
    eyebrow: "IDEAS INTO MOMENTUM",
    cta: "Start a conversation",
    brand: "NORTHLINE",
    imageSrc: "/templates/about-corporate.webp",
    imageAlt: "Contemporary glass office towers against a blue sky",
    socialPlatforms: ["LinkedIn", "Facebook"],
    features: ["Our expertise", "Our approach", "Contact the team"],
  },
  {
    id: "personal-creative",
    name: "Personal & Creative",
    category: "creative",
    description:
      "An expressive portfolio for photographers, artists, and independent creatives.",
    headline: "A different way of seeing.",
    eyebrow: "SELECTED WORK & IDEAS",
    cta: "Explore the work",
    brand: "STUDIO / FRAME",
    socialPlatforms: ["Instagram", "LinkedIn", "Behance"],
    features: ["Selected projects", "About the studio", "Let's collaborate"],
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    category: "wellness",
    description:
      "A calm, welcoming starting point for fitness, spa, and wellness services.",
    headline: "A little space to feel your best.",
    eyebrow: "MOVE. REST. RECONNECT.",
    cta: "Explore our sessions",
    brand: "STILL & STRONG",
    socialPlatforms: ["Instagram", "Facebook"],
    features: ["Our sessions", "Meet your guide", "Booking concept"],
  },
];

export function getWebsiteDesign(id: unknown): WebsiteDesign | undefined {
  return typeof id === "string"
    ? websiteDesigns.find((design) => design.id === id)
    : undefined;
}

export function filterWebsiteDesigns(
  category: DesignCategory,
): WebsiteDesign[] {
  return category === "all"
    ? websiteDesigns
    : websiteDesigns.filter((design) => design.category === category);
}

export function designInquiryHref(id: string): string {
  const design = getWebsiteDesign(id);
  return design
    ? `/get-started?design=${encodeURIComponent(design.id)}`
    : "/get-started";
}

export function nextClientIndex(
  current: number,
  direction: number,
  count: number,
): number {
  return count > 0 ? (((current + direction) % count) + count) % count : 0;
}

export function shouldAutoplayClientSlider(state: {
  reducedMotion: boolean;
  paused: boolean;
  hovered: boolean;
  focused: boolean;
}): boolean {
  return (
    !state.reducedMotion && !state.paused && !state.hovered && !state.focused
  );
}
