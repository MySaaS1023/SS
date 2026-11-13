import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";
import "./board.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteRuntime } from "@/components/site-runtime";
import { PublicSiteChrome } from "@/components/public-site-chrome";
import { SiteSurface } from "@/components/site-surface";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Steady Start LLC | Websites & Business Setup",
  description: "Custom websites, business setup, integrations, and practical digital solutions from Steady Start LLC.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="text-[var(--foreground)] antialiased">
        <div className="relative flex min-h-screen flex-col">
          <PublicSiteChrome>
            <SiteHeader />
          </PublicSiteChrome>
          <SiteRuntime />
          <SiteSurface>{children}</SiteSurface>
          <PublicSiteChrome>
            <SiteFooter />
          </PublicSiteChrome>
        </div>
      </body>
    </html>
  );
}
