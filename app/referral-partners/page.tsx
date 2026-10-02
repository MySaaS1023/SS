import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Referral Partners | Steady Start",
  description:
    "Refer businesses to Steady Start and earn $100 for every eligible customer who purchases a qualifying service.",
};

const benefits = [
  "$100 per eligible customer",
  "No website-building experience required",
  "A personal referral link",
  "Referral and commission tracking",
  "A simple Partner Portal",
  "Steady Start handles the customer after referral",
];

export default function ReferralPartnersPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <PageContainer>
          <div className="glass-card mx-auto max-w-5xl px-6 py-12 text-center sm:px-12 sm:py-16">
            <p className="section-kicker">Referral Partners</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Become a Steady Start Referral Partner
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Refer businesses to Steady Start and earn $100 for every eligible
              customer who purchases a qualifying service.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/referral-partners/apply"
                className={`${primaryButtonClass} force-white-btn`}
              >
                Become a Referral Partner
              </Link>
              <Link href="/partner/login" className={secondaryButtonClass}>
                Partner Login
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16 sm:pb-20">
        <PageContainer>
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="section-kicker">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Three simple steps
              </h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                [
                  "1",
                  "Refer a Business",
                  "Share your personal referral link or submit a referral through your Partner Portal.",
                ],
                [
                  "2",
                  "We Take It From There",
                  "Steady Start handles the consultation, service selection, customer communication, and sale.",
                ],
                [
                  "3",
                  "Earn $100",
                  "When your eligible referral becomes a paying customer and their qualifying payment is confirmed, you earn a $100 referral commission.",
                ],
              ].map(([number, title, body]) => (
                <div key={number} className="glass-card p-6">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-sm font-bold text-white">
                    {number}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs leading-6 text-[var(--muted)]">
              Referral commissions are subject to Steady Start&apos;s Referral
              Partner Terms and eligibility requirements.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-20">
        <PageContainer>
          <div className="glass-card mx-auto max-w-5xl p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="section-kicker">Why join</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  A clear, simple referral program
                </h2>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                  >
                    ✓ {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
