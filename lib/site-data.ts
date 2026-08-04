export type ServiceKey =
  | "business-setup"
  | "custom-website-bundle"
  | "custom-website-plus-bundle"
  | "complete-business-launch";

export type ServiceOption = {
  title: string;
  features: string[];
};

export type ServiceOffering = {
  key: ServiceKey;
  name: string;
  price: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  options?: ServiceOption[];
  featured?: boolean;
  ctaLabel: string;
  href: string;
};

export const siteName = "Steady Start";
export const siteTagline =
  "Business setup, custom websites, and advanced web solutions for entrepreneurs who want a stronger launch.";
export const supportEmail = "support@steadystartco.com";
export const footerDescription =
  "Steady Start helps entrepreneurs with business setup, custom websites, and advanced web solutions designed to make launching easier.";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const serviceOfferings: ServiceOffering[] = [
  {
    key: "business-setup",
    name: "Business Setup",
    price: "Custom Quote",
    subtitle: "Pricing varies by state requirements and business needs.",
    features: [
      "EIN setup assistance",
      "Domain setup",
      "Business phone setup",
      "Business address setup",
      "Business bank account guidance",
      "DUNS registration guidance",
    ],
    ctaLabel: "Request Quote",
    href: "/contact",
  },
  {
    key: "custom-website-bundle",
    name: "Custom Website Bundle",
    price: "$319",
    subtitle: "Professional Website Design & Setup",
    features: [
      "Up to 8 Professionally Designed Pages",
      "Custom Website Design & Layout",
      "Branded Color Theme",
      "Booking Calendar or Shopping Cart Setup",
      "Essential Business Integrations",
      "Mobile-Optimized for All Devices",
      "Basic SEO Setup",
    ],
    ctaLabel: "Get Started",
    href: "/get-started?package=custom-website-bundle",
  },
  {
    key: "custom-website-plus-bundle",
    name: "Custom Website+ Bundle",
    price: "$599",
    features: [
      "Backend development",
      "Database setup",
      "Payment integration",
      "Admin portals",
      "Client portals",
      "Patient portals",
      "API integrations",
      "SEO optimization",
      "AI workflows",
      "Automation and bots",
    ],
    ctaLabel: "Get Started",
    href: "/get-started?package=custom-website-plus-bundle",
  },
  {
    key: "complete-business-launch",
    name: "Complete Business Launch Packages",
    price: "Custom Quote",
    description:
      "Bundle your business setup with a website solution for a complete launch experience.",
    options: [
      {
        title: "Business Setup + Basic Website",
        features: ["Business Setup", "Custom Website Bundle"],
      },
      {
        title: "Business Setup + Website+",
        features: ["Business Setup", "Custom Website+ Bundle"],
      },
    ],
    featured: true,
    ctaLabel: "Request Quote",
    href: "/contact",
  },
];

export const whyChooseItems = [
  {
    title: "Affordable Solutions",
    description:
      "Helping entrepreneurs launch without agency-level pricing.",
  },
  {
    title: "Beginner Friendly",
    description: "Simple guidance every step of the way.",
  },
  {
    title: "Built For Growth",
    description: "Start small and expand as your business grows.",
  },
  {
    title: "Real Support",
    description: "Personalized assistance and communication.",
  },
];

export const processSteps = [
  {
    title: "Share your launch goals",
    description:
      "Tell Steady Start what kind of business you are building, what support you need, and where you feel stuck.",
  },
  {
    title: "Get the right solution",
    description:
      "We help map the best path for your business setup, website needs, or advanced functionality based on your launch stage.",
  },
  {
    title: "Move forward with support",
    description:
      "Launch with clearer direction, stronger systems, and a professional online presence built around real business needs.",
  },
];
