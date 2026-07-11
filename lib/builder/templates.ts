import type { WebsiteContent, WebsiteTheme } from "@/lib/builder/types";

export type WebsiteTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  theme: WebsiteTheme;
  content: WebsiteContent;
};

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: "service-business",
    name: "Service Business",
    category: "Services",
    description: "A clean local service website with service highlights and contact CTA.",
    theme: {
      primaryColor: "#1473FF",
      secondaryColor: "#0F172A",
      fontFamily: "Inter",
    },
    content: {
      navigation: [
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact" },
      ],
      pages: [
        {
          id: "home",
          title: "Home",
          slug: "home",
          heading: "Reliable service when you need it most.",
          body: "Show customers what you do, where you work, and why they can trust your team.",
          buttonLabel: "Request Service",
          buttonLink: "/contact",
        },
        {
          id: "services",
          title: "Services",
          slug: "services",
          heading: "Services built around your needs.",
          body: "List your main services, explain what is included, and help customers choose the right next step.",
          buttonLabel: "Get a Quote",
          buttonLink: "/contact",
        },
        {
          id: "contact",
          title: "Contact",
          slug: "contact",
          heading: "Ready to get started?",
          body: "Invite visitors to call, email, or submit a request so you can follow up quickly.",
          buttonLabel: "Contact Us",
          buttonLink: "mailto:hello@example.com",
        },
      ],
    },
  },
  {
    id: "product-store",
    name: "Product Store",
    category: "Products",
    description: "A storefront-style layout for products, collections, and shopping CTAs.",
    theme: {
      primaryColor: "#22C55E",
      secondaryColor: "#111827",
      fontFamily: "Inter",
    },
    content: {
      navigation: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "About", href: "/about" },
      ],
      pages: [
        {
          id: "home",
          title: "Home",
          slug: "home",
          heading: "Products your customers will love.",
          body: "Introduce your brand, feature best-selling products, and guide shoppers toward your collection.",
          buttonLabel: "Shop Now",
          buttonLink: "/shop",
        },
        {
          id: "shop",
          title: "Shop",
          slug: "shop",
          heading: "Explore the collection.",
          body: "Showcase featured products, categories, and reasons customers should buy from your brand.",
          buttonLabel: "View Products",
          buttonLink: "/shop",
        },
        {
          id: "about",
          title: "About",
          slug: "about",
          heading: "Made with purpose.",
          body: "Share your story, values, process, and what makes your products different.",
          buttonLabel: "Learn More",
          buttonLink: "/about",
        },
      ],
    },
  },
  {
    id: "consultant",
    name: "Consultant",
    category: "Consulting",
    description: "A polished expert website for consultants, coaches, and advisors.",
    theme: {
      primaryColor: "#8B5CF6",
      secondaryColor: "#111827",
      fontFamily: "Inter",
    },
    content: {
      navigation: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Book", href: "/book" },
      ],
      pages: [
        {
          id: "home",
          title: "Home",
          slug: "home",
          heading: "Expert guidance for your next move.",
          body: "Position your consulting offer, explain the transformation you provide, and invite prospects to book a call.",
          buttonLabel: "Book a Call",
          buttonLink: "/book",
        },
        {
          id: "about",
          title: "About",
          slug: "about",
          heading: "Strategy with clarity.",
          body: "Share your background, process, and why clients trust your expertise.",
          buttonLabel: "Work With Me",
          buttonLink: "/book",
        },
        {
          id: "book",
          title: "Book",
          slug: "book",
          heading: "Let us talk about your goals.",
          body: "Give prospects a simple next step to schedule a consultation or request more information.",
          buttonLabel: "Schedule Now",
          buttonLink: "mailto:hello@example.com",
        },
      ],
    },
  },
];

export function getWebsiteTemplate(templateId: string) {
  return websiteTemplates.find((template) => template.id === templateId);
}
