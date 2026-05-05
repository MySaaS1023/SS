export type PackageName =
  | "Starter / Service Package"
  | "Business Package"
  | "Premium Package";
export type PackageKey = "starter" | "business" | "premium";

export type PricingPackage = {
  key: PackageKey;
  name: PackageName;
  shortName: "Starter" | "Business" | "Premium";
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
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
    name: "Starter / Service Package",
    shortName: "Starter",
    price: "$120",
    description: "A clean launch package for businesses that want a strong first website.",
    features: [
      "Front end build",
      "Payment Integration Setup with Stripe",
      "Professional company presence",
      "Service or product setup",
    ],
  },
  {
    key: "business",
    name: "Business Package",
    shortName: "Business",
    price: "$200",
    description: "A stronger website build with more setup support for growing businesses.",
    features: [
      "Everything in Service Package",
      "Mockup services or products (image/content) setup",
      "Integrations or booking functionality",
      "Domain setup or deployment link",
    ],
  },
  {
    key: "premium",
    name: "Premium Package",
    shortName: "Premium",
    price: "$420",
    description: "A more complete build for businesses that want the full setup handled.",
    features: [
      "Advanced website build",
      "Full web design",
      "Backend system setup (portal control)",
      "Marketing ready (SEO and launch necessities)",
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

export const processSteps = [
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
