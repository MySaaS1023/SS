import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteRuntime } from "@/components/site-runtime";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.steadystartco.com"),
  title: "Steady Start | Business Setup, Custom Websites, and Launch Support",
  description:
    "Steady Start helps entrepreneurs with business setup, custom websites, and advanced web solutions designed to make launching easier.",
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://www.steadystartco.com",
  },
  openGraph: {
    title: "Steady Start | Business Setup, Custom Websites, and Launch Support",
    description:
      "Steady Start helps entrepreneurs with business setup, custom websites, and advanced web solutions designed to make launching easier.",
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
    title: "Steady Start | Business Setup, Custom Websites, and Launch Support",
    description:
      "Steady Start helps entrepreneurs with business setup, custom websites, and advanced web solutions designed to make launching easier.",
    images: ["https://www.steadystartco.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="text-[var(--foreground)] antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <SiteRuntime />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
