import type { Metadata } from "next";
import { serviceOfferings, supportEmail } from "@/lib/site-data";

export const SITE_URL = "https://www.steadystartco.com";
const socialImage = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "Steady Start custom business websites",
};

export function buildPageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  const url = new URL(path, SITE_URL).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Steady Start LLC",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}

export function buildNoIndexMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: null },
    robots: { index: false, follow: false, noarchive: true },
    openGraph: null,
    twitter: null,
  };
}

export const publicPageSeo = {
  "/": {
    title: "Small Business Websites & Digital Setup | Steady Start LLC",
    description:
      "Custom websites, online booking and payment integrations, AI automation, and business launch support for small businesses from Steady Start LLC.",
  },
  "/about": {
    title: "About Steady Start | Digital Solutions for Growing Businesses",
    description:
      "Meet Steady Start LLC, a U.S.-based web development company creating custom websites, business tools, integrations, and practical digital solutions.",
  },
  "/pricing": {
    title: "Website Packages & Business Setup Pricing | Steady Start LLC",
    description:
      "Compare Steady Start website packages: Standard at $319 and Premium at $599. Request a custom quote for Business Setup or a Complete Business Launch.",
  },
  "/contact": {
    title: "Contact Steady Start | Let's Talk About Your Project",
    description:
      "Discuss website design for Mesa, Arizona small businesses, digital setup, booking and payment integrations, or AI automation with Steady Start LLC.",
  },
  "/referral-partners": {
    title: "Referral Partner Program | Steady Start LLC",
    description:
      "Explore the Steady Start Referral Partner Program. Refer businesses and earn $100 for each eligible customer who purchases a qualifying service.",
  },
  "/connect": {
    title: "Reviews & Social Links | Connect With Steady Start LLC",
    description:
      "Connect with Steady Start LLC through our official social links and available review options. Follow along for business tips, website inspiration, and updates.",
  },
  "/quick-links": {
    title: "Website Guides & Launch Resources | Steady Start LLC",
    description:
      "Explore Steady Start website comparison guides and launch resources, compare custom websites with common builders, and find your next step.",
  },
  "/privacy": {
    title: "Privacy Policy | Steady Start LLC",
    description:
      "Read how Steady Start handles information shared through inquiries, project requests, payments, and business services.",
  },
  "/terms": {
    title: "Terms of Service | Steady Start LLC",
    description:
      "Review Steady Start service terms covering project scope, client responsibilities, payments, approvals, and business support.",
  },
  "/disclaimer": {
    title: "Service Disclaimer | Steady Start LLC",
    description:
      "Read the Steady Start disclaimer about general business information, third-party services, project results, and professional guidance.",
  },
  "/referral-partners/terms": {
    title: "Referral Partner Terms | Steady Start LLC",
    description:
      "Review Steady Start Referral Partner Program terms, including eligibility, qualifying referrals, commissions, and program responsibilities.",
  },
} as const;

export function publicPageMetadata(path: keyof typeof publicPageSeo): Metadata {
  const page = publicPageSeo[path];
  return buildPageMetadata(path, page.title, page.description);
}

export function organizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Steady Start LLC",
    url: SITE_URL,
    email: supportEmail,
    logo: `${SITE_URL}/brand/steady-start-browser-lockup-original.png`,
  };
}

export function servicesStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": serviceOfferings.map((service) => {
      const amount = /^\$(\d+(?:\.\d+)?)$/.exec(service.price)?.[1];
      return {
        "@type": "Service",
        "@id": `${SITE_URL}/pricing#${service.key}`,
        name: service.name,
        description:
          service.description ?? service.subtitle ?? service.features?.join(". "),
        url: `${SITE_URL}/pricing`,
        provider: { "@id": `${SITE_URL}/#organization` },
        ...(amount
          ? {
              offers: {
                "@type": "Offer",
                price: amount,
                priceCurrency: "USD",
                url: `${SITE_URL}/pricing`,
              },
            }
          : {}),
      };
    }),
  };
}

// Escaping '<' prevents future content from closing an inline script element.
export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
