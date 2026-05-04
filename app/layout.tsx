import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.steadystartco.com"),
  title: "Steady Start | Custom Business Websites Without Monthly Fees",
  description:
    "Steady Start builds custom business websites without Wix, Shopify, or monthly platform fees.",
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://www.steadystartco.com",
  },
  openGraph: {
    title: "Steady Start | Custom Business Websites Without Monthly Fees",
    description:
      "Steady Start builds custom business websites without Wix, Shopify, or monthly platform fees.",
    url: "https://www.steadystartco.com",
    siteName: "Steady Start",
    type: "website",
    images: [
      {
        url: "https://www.steadystartco.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Steady Start custom business websites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steady Start | Custom Business Websites Without Monthly Fees",
    description:
      "Steady Start builds custom business websites without Wix, Shopify, or monthly platform fees.",
    images: ["https://www.steadystartco.com/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="text-[var(--foreground)] antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
