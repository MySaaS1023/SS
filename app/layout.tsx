import type { Metadata } from "next";
import { ReactNode } from "react";
import Script from "next/script";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.steadystartco.com"),
  title: "Steady Start | AI-Powered Business Platform for Entrepreneurs",
  description:
    "Steady Start is building an AI-powered business platform where entrepreneurs can launch, build, manage, and grow service or product businesses from one place.",
  icons: {
    icon: "/favicon-v4.png",
    shortcut: "/favicon-v4.png",
    apple: "/favicon-v4.png",
  },
  alternates: {
    canonical: "https://www.steadystartco.com",
  },
  openGraph: {
    title: "Steady Start | AI-Powered Business Platform for Entrepreneurs",
    description:
      "Steady Start is building an AI-powered business platform where entrepreneurs can launch, build, manage, and grow service or product businesses from one place.",
    url: "https://www.steadystartco.com",
    siteName: "Steady Start",
    type: "website",
    images: [
      {
        url: "https://www.steadystartco.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Steady Start AI-powered business platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steady Start | AI-Powered Business Platform for Entrepreneurs",
    description:
      "Steady Start is building an AI-powered business platform where entrepreneurs can launch, build, manage, and grow service or product businesses from one place.",
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
