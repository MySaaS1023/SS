export type ServiceKey =
  | "business-setup"
  | "standard-website"
  | "premium-website"
  | "complete-business-launch";

export type LaunchPackageOption =
  | "business-setup-standard-website"
  | "business-setup-premium-website"
  | "not-sure-yet";

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
  { href: "/referral-partners", label: "Referral Partners" },
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
    href: "/get-started?service=business-setup",
  },
  {
    key: "standard-website",
    name: "Standard Website Package",
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
    href: "/get-started?service=standard-website",
  },
  {
    key: "premium-website",
    name: "Premium Website Package",
    price: "$599",
    subtitle: "Everything You Need to Launch & Grow Your Business",
    features: [
      "Everything Included in the Standard Website Package",
      "Custom Backend Development",
      "Database Setup",
      "Client Portal",
      "API Integrations",
      "SEO Optimization",
      "Google Business Profile Setup",
      "AI Workflows",
      "Automation & Bots",
    ],
    ctaLabel: "Get Started",
    href: "/get-started?service=premium-website",
  },
  {
    key: "complete-business-launch",
    name: "Complete Business Launch Package",
    price: "Custom Quote",
    description:
      "Bundle your business setup with a website solution for a complete launch experience.",
    options: [
      {
        title: "Business Setup + Standard Website",
        features: ["Business Setup", "Standard Website Package"],
      },
      {
        title: "Business Setup + Premium Website",
        features: ["Business Setup", "Premium Website Package"],
      },
    ],
    featured: true,
    ctaLabel: "Request Quote",
    href: "/get-started?service=complete-business-launch",
  },
];

export const launchPackageOptions: Array<{
  key: LaunchPackageOption;
  label: string;
}> = [
  {
    key: "business-setup-standard-website",
    label: "Business Setup + Standard Website",
  },
  {
    key: "business-setup-premium-website",
    label: "Business Setup + Premium Website",
  },
  { key: "not-sure-yet", label: "Not Sure Yet" },
];

const legacyServiceAliases: Record<string, ServiceKey> = {
  "custom-website-bundle": "standard-website",
  "custom-website-plus-bundle": "premium-website",
  "Custom Website Bundle": "standard-website",
  "Complete Business Bundle": "premium-website",
  "Custom Website+ Bundle": "premium-website",
  "Complete Business Launch Packages": "complete-business-launch",
  "Standard Website Package": "standard-website",
  "Premium Website Package": "premium-website",
  "Complete Business Launch Package": "complete-business-launch",
  "Business Setup": "business-setup",
};

export function resolveServiceKey(value: string | null | undefined) {
  if (!value) return undefined;
  const alias = legacyServiceAliases[value] ?? value;
  return serviceOfferings.some((offering) => offering.key === alias)
    ? (alias as ServiceKey)
    : undefined;
}

export function serviceLabel(value: string) {
  const resolved = resolveServiceKey(value);
  return resolved
    ? serviceOfferings.find((offering) => offering.key === resolved)!.name
    : replaceLegacyServiceNames(value);
}

export function replaceLegacyServiceNames(value: string) {
  return value
    .replaceAll("Custom Website+ Bundle", "Premium Website Package")
    .replaceAll("Complete Business Bundle", "Premium Website Package")
    .replaceAll("Custom Website Bundle", "Standard Website Package")
    .replaceAll(
      "Complete Business Launch Packages",
      "Complete Business Launch Package",
    );
}

export const whyChooseItems = [
  {
    title: "Affordable Solutions",
    description: "Helping entrepreneurs launch without agency-level pricing.",
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
