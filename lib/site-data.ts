export type PackageName = "Starter" | "Business Site" | "Premium";
export type PackageKey = "starter" | "business" | "premium";

export type PricingPackage = {
  key: PackageKey;
  name: PackageName;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export const siteName = "Steady Start";
export const siteTagline =
  "Custom websites built for your business — without the DIY headache.";
export const supportEmail = "support@steadystartco.com";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const pricingPackages: PricingPackage[] = [
  {
    key: "starter",
    name: "Starter",
    price: "$120",
    description:
      "A simple company outlook site with front end build and payment setup.",
    features: [
      "front end build",
      "payment integration",
      "simple company presence",
      "clean layout",
      "no backend",
    ],
  },
  {
    key: "business",
    name: "Business Site",
    price: "$200",
    description:
      "A stronger business website for service or product-based businesses.",
    features: [
      "front end build",
      "payment integration",
      "service or product structure",
      "integrations or booking functionality",
      "no backend",
    ],
    featured: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: "$420",
    description:
      "A full website build with front end, payment, integrations, and backend support.",
    features: [
      "everything in Starter",
      "everything in Business Site",
      "backend included",
      "complete setup",
    ],
  },
];

export const valueProps = [
  {
    title: "Done-for-you build",
    description:
      "You stay focused on your business while Steady Start handles the structure, design, and setup.",
  },
  {
    title: "Built around your business",
    description:
      "Every site is shaped around your offer, your customer journey, and the pages you actually need.",
  },
  {
    title: "Launch-ready setup",
    description:
      "From payment flow to key integrations, your website is prepared for a confident launch instead of a half-finished draft.",
  },
];

export const processSteps = [
  "Choose your package",
  "Fill out your project form",
  "Share your business details",
  "We build your website",
];
