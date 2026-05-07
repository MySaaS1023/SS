import type { Metadata } from "next";
import { ReactNode } from "react";
import Script from "next/script";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.steadystartco.com"),
  title: "Steady Start | Custom Websites Built For Business Owners",
  description:
    "We design, build, and launch professional websites for businesses that want to skip the DIY overwhelm and get online faster.",
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://www.steadystartco.com",
  },
  openGraph: {
    title: "Steady Start | Custom Websites Built For Business Owners",
    description:
      "We design, build, and launch professional websites for businesses that want to skip the DIY overwhelm and get online faster.",
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
    title: "Steady Start | Custom Websites Built For Business Owners",
    description:
      "We design, build, and launch professional websites for businesses that want to skip the DIY overwhelm and get online faster.",
    images: ["https://www.steadystartco.com/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GT-K5434SMD"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GT-K5434SMD');
            gtag('config', 'AW-18126099012');
          `}
        </Script>
      </head>
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
