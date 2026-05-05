export type PackageName = "Starter" | "Business" | "Premium";
export type PackageKey = "starter" | "business" | "premium";

export type PricingPackage = {
  key: PackageKey;
  name: PackageName;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export const siteName = "Steady Start";
export const siteTagline =
  "Custom websites and launch support for entrepreneurs who want it done for them.";
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
    description: "A clean starter build for businesses that need a professional first launch.",
    features: ["Front-end build", "Clean company presence", "Payment-ready setup"],
  },
  {
    key: "business",
    name: "Business",
    price: "$200",
    description: "A stronger business website with more structure and launch support included.",
    features: [
      "Service or product structure",
      "Booking or integration setup",
      "Google ads tag setup",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "$420",
    description: "A more complete build for businesses that want the full launch handled.",
    features: [
      "Advanced website build",
      "Backend setup",
      "Full integration + live launch",
      "Marketing setup",
    ],
    featured: true,
  },
];

export const valueProps = [
  {
    title: "Custom-built",
    description:
      "Your site is built around your actual business, not forced into a generic template.",
  },
  {
    title: "No learning curve",
    description:
      "You do not need to learn a platform, install plugins, or manage a builder to get online.",
  },
  {
    title: "Faster than DIY",
    description:
      "A focused done-for-you process gets you moving sooner than trying to piece everything together alone.",
  },
  {
    title: "Built for real businesses",
    description:
      "Designed for founders who need a site that looks credible, works cleanly, and helps them launch with confidence.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Tell us your business",
    description:
      "Share what you do, what you offer, and what you want your website to help you accomplish.",
  },
  {
    title: "We build your site",
    description:
      "Steady Start handles the design, structure, setup, and technical details for the launch.",
  },
  {
    title: "You launch ready",
    description:
      "Go live with a polished website that is built to present your business clearly from day one.",
  },
];
