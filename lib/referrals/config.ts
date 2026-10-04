export const REFERRAL_TERMS_VERSION = "2026-09-30";
export const REFERRAL_COMMISSION_CENTS = 10_000;
export const REFERRAL_COOKIE_NAME = "steady_start_referral";
export const REFERRAL_VISITOR_COOKIE_NAME = "steady_start_referral_visitor";

export const partnerStatuses = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;
export const referralStatuses = [
  "submitted",
  "contacted",
  "consultation_scheduled",
  "customer",
  "payment_pending",
  "payment_confirmed",
  "closed",
] as const;
export const commissionStatuses = [
  "not_eligible",
  "pending",
  "eligible",
  "approved",
  "paid",
  "reversed",
  "disputed",
] as const;

export type PartnerStatus = (typeof partnerStatuses)[number];
export type ReferralStatus = (typeof referralStatuses)[number];
export type CommissionStatus = (typeof commissionStatuses)[number];

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.steadystartco.com"
  ).replace(/\/$/, "");
}

export function getReferralCookieDays() {
  const configured = Number(process.env.REFERRAL_ATTRIBUTION_DAYS ?? "30");
  return Number.isFinite(configured) && configured > 0
    ? Math.min(configured, 365)
    : 30;
}

export function labelStatus(status: string) {
  const renamedLabels: Record<string, string> = {
    "custom-website-bundle": "Standard Website Package",
    "custom-website-plus-bundle": "Premium Website Package",
    "Custom Website Bundle": "Standard Website Package",
    "Complete Business Bundle": "Premium Website Package",
    "Custom Website+ Bundle": "Premium Website Package",
    "Complete Business Launch Packages": "Complete Business Launch Package",
    "standard-website": "Standard Website Package",
    "premium-website": "Premium Website Package",
    "complete-business-launch": "Complete Business Launch Package",
  };

  if (renamedLabels[status]) return renamedLabels[status];

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
}
