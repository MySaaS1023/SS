import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { OceanHero, OceanEmblem } from "@/components/ocean-brand";
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
    <div className="public-ocean-page board-referral-page">
      <OceanHero
        eyebrow="Referral Partners"
        title="Become a Steady Start Referral Partner"
        description="Refer businesses to Steady Start and earn $100 for every eligible customer who purchases a qualifying service."
      >
        <div className="ocean-hero-actions">
          <Link
            href="/referral-partners/apply"
            className={`${primaryButtonClass} force-white-btn`}
          >
            Become a Referral Partner <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/partner/login"
            className={`${secondaryButtonClass} brand-outline`}
          >
            Partner Login
          </Link>
        </div>
      </OceanHero>
      <section className="ocean-content">
        <PageContainer>
          <h2 className="board-section-title">How It Works</h2>
          <div className="board-referral-steps">
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
              <div key={number} className="ocean-card">
                <span className="board-step-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="board-eligibility-note">
            Referral commissions are subject to Steady Start&apos;s Referral
            Partner Terms and eligibility requirements.
          </p>
          <div className="board-referral-benefits">
            <div>
              <OceanEmblem />
              <h2>A clear, simple referral program</h2>
            </div>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
