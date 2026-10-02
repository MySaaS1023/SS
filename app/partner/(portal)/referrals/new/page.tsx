import { NewReferralForm } from "@/components/referrals/new-referral-form";

export default function NewReferralPage() {
  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        Submit a Referral
      </h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Only share contact information with the customer&apos;s permission.
      </p>
      <NewReferralForm />
    </div>
  );
}
