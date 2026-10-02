import { PageContainer } from "@/components/page-container";
import { REFERRAL_TERMS_VERSION } from "@/lib/referrals/config";

const sections = [
  [
    "Eligibility and qualifying referrals",
    "The program pays a $100 commission only for eligible new customers who make a qualifying purchase and whose payment is successfully confirmed. A submitted lead alone does not earn a commission. Existing customers, self-referrals, fraudulent referrals, and duplicate referrals are not eligible unless Steady Start determines otherwise in writing.",
  ],
  [
    "Attribution and duplicates",
    "The first valid eligible Referral Partner associated with a new customer generally owns the referral. Duplicate or disputed referrals may be held for review, and Steady Start may correct attribution based on its records.",
  ],
  [
    "Payment, refunds, and chargebacks",
    "Commissions require administrative approval. Failed, cancelled, fully refunded, charged-back, or fraudulent customer payments may cause a commission to be reversed or disputed. A previously paid commission will be flagged for review; Steady Start will not automatically withdraw funds from a partner.",
  ],
  [
    "Partner conduct",
    "Partners may not use spam, misleading claims, unauthorized paid advertising, brand impersonation, misrepresentation, or unauthorized Steady Start branding. Partners may not promise results, discounts, services, or income on Steady Start's behalf.",
  ],
  [
    "Payouts and taxes",
    "Approved commissions are paid on the timing and by the method communicated by Steady Start. Partners are responsible for providing accurate payout information and for their own tax reporting and obligations.",
  ],
  [
    "Program changes and termination",
    "Steady Start may change, suspend, or end the program, reject referrals, suspend accounts, or terminate participation for misuse, risk, inactivity, or policy violations. Changes apply prospectively unless needed to address fraud, legal requirements, or payment reversals.",
  ],
];

export default function ReferralTermsPage() {
  return (
    <section className="py-16">
      <PageContainer className="max-w-4xl">
        <div className="glass-card p-7 sm:p-10">
          <p className="section-kicker">Owner / Legal Review Required</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Referral Partner Terms
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Version {REFERRAL_TERMS_VERSION}. These draft terms must be reviewed
            by the owner and qualified legal counsel before production launch.
          </p>
          <div className="mt-8 space-y-5">
            {sections.map(([title, body]) => (
              <section
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
