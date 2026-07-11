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
  "Business setup, custom websites, and launch support for entrepreneurs ready to start strong.";
export const supportEmail = "support@steadystartco.com";
export const footerDescription =
  "Steady Start helps entrepreneurs with business setup, custom websites, and launch support designed to make starting easier.";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/platform", label: "Platform" },
  { href: "/login", label: "Login" },
];

export const processSteps = [
  {
    title: "Book a consultation",
    description: "Tell us what you are launching and where you need support.",
  },
  {
    title: "Choose your solution",
    description: "We help match you with business setup, website design, or advanced web support.",
  },
  {
    title: "We build the foundation",
    description: "Your setup, website, branding, integrations, or launch assets are prepared with care.",
  },
  {
    title: "Launch with clarity",
    description: "You move forward with a professional presence and a clear next step.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Business Setup",
    price: "Custom Quote",
    description: "For entrepreneurs who need help organizing the foundation before launch.",
    features: [
      "EIN setup assistance",
      "Domain setup guidance",
      "Business phone setup",
      "Business address setup",
      "Business bank account guidance",
      "DUNS registration guidance",
      "Launch checklist",
    ],
    ctaLabel: "Request Quote",
    href: "/get-started",
  },
  {
    name: "Custom Website Bundle",
    price: "$319",
    description: "Front-end website build for a professional online presence.",
    features: [
      "Home, About, Services/Product pages",
      "Pricing, Contact, FAQ, Disclaimer pages",
      "Links page",
      "Booking or cart integration",
      "Mobile responsive design",
      "Launch-ready layout",
    ],
    ctaLabel: "Get Started",
    href: "/get-started",
    featured: true,
  },
  {
    name: "Custom Website+ Bundle",
    price: "$599",
    description: "Advanced website support for businesses that need more functionality.",
    features: [
      "Backend development",
      "Database setup",
      "Payment integration",
      "Admin or client portals",
      "API integrations",
      "SEO optimization",
      "Automation workflows",
    ],
    ctaLabel: "Request Quote",
    href: "/get-started",
  },
  {
    name: "Complete Launch Package",
    price: "Custom Quote",
    description: "Business setup plus a website solution for a guided launch experience.",
    features: [
      "Business setup support",
      "Custom Website Bundle or Website+",
      "Branding direction",
      "Launch strategy",
      "Integration planning",
      "Consultation support",
    ],
    ctaLabel: "Book a Consultation",
    href: "/get-started",
    featured: true,
  },
];
