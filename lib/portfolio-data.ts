export type PortfolioCategory = "service" | "product";

export type PortfolioSlide = {
  id: string;
  projectName: string;
  pageLabel: string;
  businessType: string;
  category: PortfolioCategory;
  description: string;
  services: string[];
  imageSrc: string;
  imageAlt: string;
};

const apexDescription =
  "A conversion-focused landscaping and home repair website with service pages, project gallery, contact form, strong CTAs, and an AI assistant.";

const apexServices = [
  "Custom Website Design",
  "Mobile Responsive Development",
  "Service Pages",
  "Contact/Estimate Flow",
  "AI Assistant Integration",
];

const mmarkDescription =
  "A clean apparel storefront for oversized graphic T-shirts with product browsing, cart, contact page, and admin access.";

const mmarkServices = [
  "Ecommerce Website",
  "Product Pages",
  "Shopping Cart",
  "Contact Form",
  "Admin Portal",
];

export const portfolioSlides: PortfolioSlide[] = [
  {
    id: "apex-homepage-hero",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Homepage Hero",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-homepage-hero.png",
    imageAlt: "Apex Landscaping and Home Repair homepage hero screenshot",
  },
  {
    id: "apex-homepage-introduction",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Homepage Introduction",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-homepage-introduction.png",
    imageAlt: "Apex Landscaping and Home Repair homepage introduction screenshot",
  },
  {
    id: "apex-services-section",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Services Section",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-services-section.png",
    imageAlt: "Apex Landscaping and Home Repair services section screenshot",
  },
  {
    id: "apex-trust-section",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Trust Section",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-trust-section.png",
    imageAlt: "Apex Landscaping and Home Repair trust section screenshot",
  },
  {
    id: "apex-recent-work",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Recent Work Section",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-recent-work.png",
    imageAlt: "Apex Landscaping and Home Repair recent work screenshot",
  },
  {
    id: "apex-cta-footer",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "CTA and Footer",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-cta-footer.png",
    imageAlt: "Apex Landscaping and Home Repair call to action and footer screenshot",
  },
  {
    id: "apex-full-services-page",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Full Services Page",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-full-services-page.png",
    imageAlt: "Apex Landscaping and Home Repair full services page screenshot",
  },
  {
    id: "apex-full-about-page",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Full About Page",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-full-about-page.png",
    imageAlt: "Apex Landscaping and Home Repair full about page screenshot",
  },
  {
    id: "apex-full-contact-page",
    projectName: "Apex Landscaping & Home Repair LLC",
    pageLabel: "Full Contact Page",
    businessType: "Local Service Business",
    category: "service",
    description: apexDescription,
    services: apexServices,
    imageSrc: "/portfolio/apex-full-contact-page.png",
    imageAlt: "Apex Landscaping and Home Repair full contact page screenshot",
  },
  {
    id: "mmark-homepage",
    projectName: "MM.Ark Press T Shirts",
    pageLabel: "Homepage",
    businessType: "Product-Based Business",
    category: "product",
    description: mmarkDescription,
    services: mmarkServices,
    imageSrc: "/portfolio/mmark-homepage.png",
    imageAlt: "MM.Ark Press T Shirts homepage screenshot",
  },
  {
    id: "mmark-shop-page",
    projectName: "MM.Ark Press T Shirts",
    pageLabel: "Shop Page",
    businessType: "Product-Based Business",
    category: "product",
    description: mmarkDescription,
    services: mmarkServices,
    imageSrc: "/portfolio/mmark-shop-page.png",
    imageAlt: "MM.Ark Press T Shirts shop page screenshot",
  },
  {
    id: "mmark-contact-page",
    projectName: "MM.Ark Press T Shirts",
    pageLabel: "Contact Page",
    businessType: "Product-Based Business",
    category: "product",
    description: mmarkDescription,
    services: mmarkServices,
    imageSrc: "/portfolio/mmark-contact-page.png",
    imageAlt: "MM.Ark Press T Shirts contact page screenshot",
  },
  {
    id: "mmark-cart-page",
    projectName: "MM.Ark Press T Shirts",
    pageLabel: "Cart Page",
    businessType: "Product-Based Business",
    category: "product",
    description: mmarkDescription,
    services: mmarkServices,
    imageSrc: "/portfolio/mmark-cart-page.png",
    imageAlt: "MM.Ark Press T Shirts cart page screenshot",
  },
  {
    id: "mmark-admin-login",
    projectName: "MM.Ark Press T Shirts",
    pageLabel: "Admin Login",
    businessType: "Product-Based Business",
    category: "product",
    description: mmarkDescription,
    services: mmarkServices,
    imageSrc: "/portfolio/mmark-admin-login.png",
    imageAlt: "MM.Ark Press T Shirts admin login screenshot",
  },
];
