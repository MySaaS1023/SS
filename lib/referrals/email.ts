import { businessEmail, getResendClient, senderEmail } from "@/lib/email";

export type ReferralEmailKind =
  | "application_received"
  | "application_approved"
  | "application_rejected"
  | "new_referral"
  | "referral_converted"
  | "commission_earned"
  | "commission_approved"
  | "commission_paid"
  | "account_suspended";

const subjects: Record<ReferralEmailKind, string> = {
  application_received:
    "We received your Steady Start Referral Partner application",
  application_approved: "Welcome to the Steady Start Referral Partner program",
  application_rejected: "Your Steady Start Referral Partner application",
  new_referral: "New Steady Start referral received",
  referral_converted: "One of your Steady Start referrals became a customer",
  commission_earned: "You earned a $100 Steady Start referral commission",
  commission_approved: "Your Steady Start referral commission was approved",
  commission_paid: "Your Steady Start referral commission was paid",
  account_suspended: "Your Steady Start Partner account has been suspended",
};

export function referralEmail(input: {
  kind: ReferralEmailKind;
  firstName: string;
  businessName?: string;
  referralCode?: string;
  portalUrl?: string;
  payoutReference?: string;
}) {
  const portalLine = input.portalUrl
    ? `\nPartner Portal:\n${input.portalUrl}\n`
    : "";
  const businessLine = input.businessName
    ? `\nReferral:\n${input.businessName}\n`
    : "";
  const bodies: Record<ReferralEmailKind, string> = {
    application_received:
      "Thank you for applying to become a Steady Start Referral Partner. We'll review your application and contact you at the email address provided.",
    application_approved: `Your application has been approved. Your referral code is ${input.referralCode ?? "available in your portal"}. Use the secure login link on the Partner Login page to access your account.${portalLine}`,
    application_rejected:
      "Thank you for your interest in the Steady Start Referral Partner program. We are unable to approve your application at this time.",
    new_referral: `We received your referral and added it to your Partner Portal.${businessLine}${portalLine}`,
    referral_converted: `Great news — one of your referrals became a Steady Start customer.${businessLine}${portalLine}`,
    commission_earned: `Great news — one of your eligible Steady Start referrals became a paying customer.${businessLine}\nCommission:\n$100.00\n\nStatus:\nEligible for review\n${portalLine}`,
    commission_approved: `Your $100.00 referral commission has been approved.${businessLine}${portalLine}`,
    commission_paid: `Your $100.00 referral commission has been marked paid.${input.payoutReference ? `\nPayout reference: ${input.payoutReference}\n` : ""}${portalLine}`,
    account_suspended:
      "Your Steady Start Referral Partner account has been suspended. Portal functions are unavailable. Contact support if you have questions.",
  };
  return {
    subject: subjects[input.kind],
    text: [
      `Hi ${input.firstName || "there"},`,
      "",
      bodies[input.kind],
      "",
      "Steady Start LLC",
      businessEmail,
    ].join("\n"),
  };
}

export async function sendReferralEmail(
  to: string,
  input: Parameters<typeof referralEmail>[0],
) {
  if (!process.env.RESEND_API_KEY) {
    console.error("MISSING_RESEND_API_KEY", { kind: input.kind, to });
    return;
  }
  const message = referralEmail(input);
  const result = await getResendClient().emails.send({
    from: senderEmail,
    to: [to],
    subject: message.subject,
    text: message.text,
  });
  if (result.error) throw new Error(result.error.message);
}
