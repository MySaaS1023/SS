import { Resend } from "resend";

import { businessEmail } from "@/lib/email";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

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
  const text = [
    `Hi ${input.firstName || "there"},`,
    "",
    bodies[input.kind],
    "",
    "Steady Start LLC",
    businessEmail,
  ].join("\n");
  if (input.kind === "application_received") {
    const firstName = escapeHtml(input.firstName || "there");
    return {
      subject: subjects[input.kind],
      text: [
        "STEADY START",
        "",
        "Application Received",
        "",
        `Hi ${input.firstName || "there"},`,
        "",
        "Thank you for applying to become a Steady Start Referral Partner.",
        "",
        "Your application has been received and is currently:",
        "PENDING REVIEW",
        "",
        "What happens next:",
        "1. Steady Start reviews your application.",
        "2. If approved, you'll receive access to your Partner Portal.",
        "3. You'll receive your personal referral link.",
        "4. You can begin referring eligible businesses and earn $100 for each eligible customer who completes a qualifying purchase.",
        "",
        "No action is required from you right now.",
        "",
        "Questions?",
        `Reply to this email or contact: ${businessEmail}`,
        "",
        "Steady Start LLC",
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:640px;margin:auto"><p style="font-size:12px;letter-spacing:.16em;color:#2563eb;font-weight:700">STEADY START</p><h1 style="font-size:28px;margin:8px 0 24px">Application Received</h1><p>Hi ${firstName},</p><p>Thank you for applying to become a Steady Start Referral Partner.</p><p>Your application has been received and is currently:</p><p style="font-weight:700;color:#2563eb">PENDING REVIEW</p><h2 style="font-size:18px;margin-top:28px">What happens next:</h2><ol><li>Steady Start reviews your application.</li><li>If approved, you’ll receive access to your Partner Portal.</li><li>You’ll receive your personal referral link.</li><li>You can begin referring eligible businesses and earn $100 for each eligible customer who completes a qualifying purchase.</li></ol><p>No action is required from you right now.</p><h2 style="font-size:18px;margin-top:28px">Questions?</h2><p>Reply to this email or contact: <a href="mailto:${businessEmail}">${businessEmail}</a></p><p>Steady Start LLC</p></div>`,
    };
  }
  return {
    subject: subjects[input.kind],
    text,
  };
}

export function referralApplicationAdminEmail(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  heardAbout: string;
  motivation: string;
  referralPlan: string;
  reviewUrl: string;
}) {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const fields = [
    ["Email", input.email],
    ["Phone", input.phone],
    ["Location", `${input.city}, ${input.state}`],
    ["How they heard about Steady Start", input.heardAbout],
    ["Why they want to become a Referral Partner", input.motivation],
    ["How they plan to find/refer customers", input.referralPlan],
    ["Application Status", "Pending"],
  ];
  return {
    subject: `New Referral Application — ${fullName}`,
    replyTo: input.email,
    text: [
      "NEW REFERRAL PARTNER APPLICATION",
      "",
      fullName,
      "",
      ...fields.flatMap(([label, value]) => [`${label}:`, value, ""]),
      "Review Application:",
      input.reviewUrl,
    ].join("\n"),
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:680px;margin:auto"><p style="font-size:12px;letter-spacing:.16em;color:#2563eb;font-weight:700">NEW REFERRAL PARTNER APPLICATION</p><h1 style="font-size:28px;margin:8px 0 24px">${escapeHtml(fullName)}</h1>${fields.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value)}</p>`).join("")}<p style="margin-top:28px"><a href="${escapeHtml(input.reviewUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">Review Application</a></p></div>`,
  };
}

export function missingReferralEmailConfiguration() {
  return ["REFERRAL_RESEND_API_KEY", "REFERRAL_RESEND_FROM_EMAIL"].filter(
    (name) => !process.env[name]?.trim(),
  );
}

export function getReferralSenderEmail() {
  const sender = process.env.REFERRAL_RESEND_FROM_EMAIL?.trim();
  if (!sender)
    throw new Error("REFERRAL_RESEND_FROM_EMAIL is not configured.");
  return sender;
}

export function getReferralResendClient() {
  const apiKey = process.env.REFERRAL_RESEND_API_KEY?.trim();
  if (!apiKey)
    throw new Error("REFERRAL_RESEND_API_KEY is not configured.");
  return new Resend(apiKey);
}

export async function sendReferralProgramEmail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const missing = missingReferralEmailConfiguration();
  if (missing.length) {
    console.error("MISSING_REFERRAL_EMAIL_CONFIGURATION", {
      missing,
      to: input.to,
    });
    return;
  }
  const result = await getReferralResendClient().emails.send({
    from: getReferralSenderEmail(),
    to: Array.isArray(input.to) ? input.to : [input.to],
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function sendReferralEmail(
  to: string,
  input: Parameters<typeof referralEmail>[0],
) {
  const message = referralEmail(input);
  await sendReferralProgramEmail({
    to,
    subject: message.subject,
    text: message.text,
    html: "html" in message ? message.html : undefined,
  });
}
