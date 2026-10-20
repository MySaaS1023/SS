"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { ReferralBannerLoader } from "@/components/referrals/referral-banner";
import { isHandoffScreen } from "@/lib/handoff/privacy";

export function SiteRuntime() {
  const pathname = usePathname();
  if (isHandoffScreen(pathname)) return null;
  return (
    <>
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
      <ReferralBannerLoader />
    </>
  );
}
