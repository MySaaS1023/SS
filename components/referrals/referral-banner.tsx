"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ReferralBanner({
  referralCode,
  partnerName,
}: {
  referralCode: string;
  partnerName: string;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const storageKey = `steady-start-referral-banner-dismissed:${referralCode}`;
  useEffect(() => {
    setVisible(window.sessionStorage.getItem(storageKey) !== "yes");
  }, [storageKey]);
  if (
    !visible ||
    pathname.startsWith("/partner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/get-started/")
  )
    return null;
  return (
    <aside className="border-b border-[#3b82f6]/30 bg-[#0f2244] px-4 py-4 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            You were referred by {partnerName}
          </p>
          <p className="mt-1 text-sm text-[#bfdbfe]">
            Welcome to Steady Start. Explore our services and find the right
            solution for your business.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/pricing"
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold"
          >
            View Services
          </Link>
          <Link
            href="/get-started"
            className="rounded-lg bg-[#3b82f6] px-3 py-2 text-sm font-semibold"
          >
            Get Started
          </Link>
          <button
            type="button"
            aria-label="Dismiss referral welcome"
            onClick={() => {
              window.sessionStorage.setItem(storageKey, "yes");
              setVisible(false);
            }}
            className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
}

export function ReferralBannerLoader() {
  const pathname = usePathname();
  const [referral, setReferral] = useState<{
    referralCode: string;
    partnerName: string;
  } | null>(null);
  useEffect(() => {
    fetch("/api/referral-attribution/banner")
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => setReferral(value?.partnerName ? value : null))
      .catch(() => setReferral(null));
  }, []);
  useEffect(() => {
    if (pathname === "/pricing" || pathname === "/get-started") {
      void fetch("/api/referral-attribution/activity", {
        method: "POST",
        keepalive: true,
      });
    }
  }, [pathname]);
  return referral ? <ReferralBanner {...referral} /> : null;
}
