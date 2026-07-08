export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  href: string;
  featured?: boolean;
};

export const siteName = "Steady Start";
export const siteTagline =
  "Build your website with AI, customize it your way, and publish when you are ready.";
export const supportEmail = "support@steadystartco.com";
export const footerDescription =
  "Steady Start is a simple AI website-building platform for entrepreneurs who want to create, customize, and publish a professional website faster.";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export const processSteps = [
  {
    title: "Create your account",
    description: "Sign up so your website setup can be saved to your private builder workspace.",
  },
  {
    title: "Choose template or AI-generated site",
    description: "Start from a clean template or let AI create the first version of your website.",
  },
  {
    title: "Customize your website",
    description: "Edit your pages, copy, colors, branding, forms, and sections before publishing.",
  },
  {
    title: "Publish when ready",
    description: "Launch your mobile-friendly website when everything looks right.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$19/mo",
    description: "For simple websites that need to get online quickly.",
    features: [
      "AI website starter",
      "Template customization",
      "Mobile-friendly pages",
      "Contact form",
      "Basic publishing tools",
    ],
    ctaLabel: "Build Your Website",
    href: "/start-free",
  },
  {
    name: "Pro",
    price: "$39/mo",
    description: "For growing businesses that want more control and AI help.",
    features: [
      "Everything in Starter",
      "AI copy generation",
      "Brand colors and fonts",
      "SEO page basics",
      "More pages and sections",
      "Priority publishing tools",
    ],
    ctaLabel: "Start Pro",
    href: "/start-free",
    featured: true,
  },
  {
    name: "Business",
    price: "$79/mo",
    description: "For businesses that need a stronger website foundation.",
    features: [
      "Everything in Pro",
      "Advanced page setup",
      "Custom domain support",
      "Team-ready workspace",
      "Enhanced forms",
      "Launch support options",
    ],
    ctaLabel: "Start Business",
    href: "/start-free",
  },
];
