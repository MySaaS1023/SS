export type PortfolioCategory = "service" | "product";

export type PortfolioSlide = {
  id: string;
  pageLabel: string;
  category: PortfolioCategory;
  imageSrc: string;
  imageAlt: string;
};

export const serviceBusinessSlides: PortfolioSlide[] = [
  {
    id: "service-homepage",
    pageLabel: "Homepage",
    category: "service",
    imageSrc: "/portfolio/apex-homepage-hero.png",
    imageAlt: "Service business website homepage screenshot",
  },
  {
    id: "service-introduction",
    pageLabel: "Homepage Intro",
    category: "service",
    imageSrc: "/portfolio/apex-homepage-introduction.png",
    imageAlt: "Service business website introduction section screenshot",
  },
  {
    id: "service-services",
    pageLabel: "Services",
    category: "service",
    imageSrc: "/portfolio/apex-services-section.png",
    imageAlt: "Service business website services section screenshot",
  },
  {
    id: "service-trust",
    pageLabel: "Trust Section",
    category: "service",
    imageSrc: "/portfolio/apex-trust-section.png",
    imageAlt: "Service business website trust section screenshot",
  },
  {
    id: "service-recent-work",
    pageLabel: "Recent Work",
    category: "service",
    imageSrc: "/portfolio/apex-recent-work.png",
    imageAlt: "Service business website recent work screenshot",
  },
  {
    id: "service-cta-footer",
    pageLabel: "CTA and Footer",
    category: "service",
    imageSrc: "/portfolio/apex-cta-footer.png",
    imageAlt: "Service business website call to action and footer screenshot",
  },
  {
    id: "service-full-services",
    pageLabel: "Services Page",
    category: "service",
    imageSrc: "/portfolio/apex-full-services-page.png",
    imageAlt: "Service business website full services page screenshot",
  },
  {
    id: "service-about",
    pageLabel: "About Page",
    category: "service",
    imageSrc: "/portfolio/apex-full-about-page.png",
    imageAlt: "Service business website about page screenshot",
  },
  {
    id: "service-contact",
    pageLabel: "Contact Page",
    category: "service",
    imageSrc: "/portfolio/apex-full-contact-page.png",
    imageAlt: "Service business website contact page screenshot",
  },
];

export const ecommerceSlides: PortfolioSlide[] = [
  {
    id: "ecommerce-homepage",
    pageLabel: "Homepage",
    category: "product",
    imageSrc: "/portfolio/mmark-homepage.png",
    imageAlt: "E-commerce website homepage screenshot",
  },
  {
    id: "ecommerce-shop",
    pageLabel: "Shop",
    category: "product",
    imageSrc: "/portfolio/mmark-shop-page.png",
    imageAlt: "E-commerce website shop page screenshot",
  },
  {
    id: "ecommerce-contact",
    pageLabel: "Contact",
    category: "product",
    imageSrc: "/portfolio/mmark-contact-page.png",
    imageAlt: "E-commerce website contact page screenshot",
  },
  {
    id: "ecommerce-cart",
    pageLabel: "Cart",
    category: "product",
    imageSrc: "/portfolio/mmark-cart-page.png",
    imageAlt: "E-commerce website cart page screenshot",
  },
];
