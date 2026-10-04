import { createHash, randomBytes } from "node:crypto";

import { getSiteUrl, labelStatus } from "@/lib/referrals/config";
import {
  missingReferralEmailConfiguration,
  sendReferralProgramEmail,
} from "@/lib/referrals/email";
import {
  decryptCustomerAccessToken,
  encryptCustomerAccessToken,
} from "@/lib/referrals/security";
import { supportEmail } from "@/lib/site-data";
import type { createAdminSupabaseClient } from "@/lib/supabase/server";

export const CUSTOMER_ACCESS_DAYS = 30;
export const CUSTOMER_INVITE_COOLDOWN_MS = 24 * 60 * 60_000;

export type CustomerInviteReferral = {
  id: string;
  partner_id: string;
  customer_first_name: string;
  customer_email: string;
  service_interest: string;
  permission_confirmed: boolean;
  customer_access_token_encrypted?: string | null;
  customer_access_token_expires_at?: string | null;
  customer_invite_sent_at?: string | null;
  customer_invite_resend_count?: number | null;
};

export function generateCustomerAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashCustomerAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function customerAccessExpiresAt(now = new Date()) {
  return new Date(
    now.getTime() + CUSTOMER_ACCESS_DAYS * 24 * 60 * 60_000,
  ).toISOString();
}

export function canPartnerResendInvite(
  sentAt: string | null | undefined,
  now = new Date(),
) {
  return (
    !sentAt ||
    now.getTime() - new Date(sentAt).getTime() >= CUSTOMER_INVITE_COOLDOWN_MS
  );
}

export function customerJourneyStatus(referral: {
  status: string;
  customer_first_viewed_at?: string | null;
  service_selected_at?: string | null;
  payment_link_clicked_at?: string | null;
}) {
  if (["payment_confirmed", "closed"].includes(referral.status))
    return referral.status;
  if (referral.payment_link_clicked_at) return "payment_pending";
  if (referral.service_selected_at) return "interested";
  if (referral.customer_first_viewed_at) return "customer_viewed";
  return referral.status;
}

export function customerInviteMessage(input: {
  customerFirstName: string;
  partnerFirstName: string;
  serviceInterest: string;
  secureUrl: string;
}) {
  const service = labelStatus(input.serviceInterest);
  const text = [
    "STEADY START",
    "",
    "You've Been Referred to Steady Start",
    "",
    `Hi ${input.customerFirstName},`,
    "",
    `${input.partnerFirstName} referred you to Steady Start because you may be looking for help with:`,
    "",
    service,
    "",
    "Steady Start helps businesses build and improve their online presence through professional websites, business setup, automation, AI tools, SEO, and related services.",
    "",
    "We've created a private link where you can review your options and choose what works best for your business.",
    "",
    "View Your Steady Start Options:",
    input.secureUrl,
    "",
    "There is no obligation to purchase.",
    "",
    "Questions? Reply to this email or contact:",
    supportEmail,
    "",
    "Steady Start LLC",
  ].join("\n");
  const escape = (value: string) =>
    value.replace(
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
  return {
    subject: `${input.partnerFirstName} referred you to Steady Start`,
    text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:640px;margin:auto"><p style="font-size:12px;letter-spacing:.16em;color:#2563eb;font-weight:700">STEADY START</p><h1 style="font-size:28px;margin:8px 0 24px">You've Been Referred to Steady Start</h1><p>Hi ${escape(input.customerFirstName)},</p><p>${escape(input.partnerFirstName)} referred you to Steady Start because you may be looking for help with:</p><p><strong>${escape(service)}</strong></p><p>Steady Start helps businesses build and improve their online presence through professional websites, business setup, automation, AI tools, SEO, and related services.</p><p>We've created a private link where you can review your options and choose what works best for your business.</p><p style="margin:28px 0"><a href="${escape(input.secureUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">View Your Steady Start Options</a></p><p>There is no obligation to purchase.</p><p>Questions? Reply to this email or contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p><p>Steady Start LLC</p></div>`,
  };
}

export function customerAccessUrl(encryptedToken: string) {
  return `${getSiteUrl()}/get-started/${decryptCustomerAccessToken(encryptedToken)}`;
}

export async function deliverCustomerInvite(input: {
  admin: ReturnType<typeof createAdminSupabaseClient>;
  referral: CustomerInviteReferral;
  partnerFirstName: string;
  isResend?: boolean;
  actorUserId?: string | null;
}) {
  if (!input.referral.permission_confirmed)
    return { sent: false, reason: "permission_not_confirmed" };
  const now = new Date();
  let token: string;
  let tokenHash: string;
  let encryptedToken: string;
  const existingUnexpired =
    input.referral.customer_access_token_encrypted &&
    input.referral.customer_access_token_expires_at &&
    new Date(input.referral.customer_access_token_expires_at) > now;
  if (existingUnexpired) {
    encryptedToken = input.referral.customer_access_token_encrypted!;
    token = decryptCustomerAccessToken(encryptedToken);
    tokenHash = hashCustomerAccessToken(token);
  } else {
    token = generateCustomerAccessToken();
    tokenHash = hashCustomerAccessToken(token);
    encryptedToken = encryptCustomerAccessToken(token);
  }
  const expiresAt = existingUnexpired
    ? input.referral.customer_access_token_expires_at!
    : customerAccessExpiresAt(now);
  const attemptAt = now.toISOString();
  const { error: prepareError } = await input.admin
    .from("referrals")
    .update({
      customer_access_token_hash: tokenHash,
      customer_access_token_encrypted: encryptedToken,
      customer_access_token_expires_at: expiresAt,
      customer_invite_status: "sending",
      customer_invite_last_attempt_at: attemptAt,
      customer_invite_failure: null,
      customer_last_activity_at: attemptAt,
    })
    .eq("id", input.referral.id);
  if (prepareError) {
    console.error("CUSTOMER_INVITE_CREATE_FAILED", {
      referralId: input.referral.id,
      code: prepareError.code,
    });
    return { sent: false, reason: "invite_create_failed" };
  }
  const { error: auditCreateError } = await input.admin
    .from("referral_audit_log")
    .insert({
      actor_user_id: input.actorUserId ?? null,
      action: "customer_invite_created",
      entity_type: "referral",
      entity_id: input.referral.id,
      after_data: { expires_at: expiresAt, resend: Boolean(input.isResend) },
    });
  if (auditCreateError)
    console.error("CUSTOMER_INVITE_AUDIT_ERROR", {
      referralId: input.referral.id,
    });
  try {
    const missing = missingReferralEmailConfiguration();
    if (missing.length)
      throw new Error(`Missing configuration: ${missing.join(", ")}`);
    const secureUrl = `${getSiteUrl()}/get-started/${token}`;
    const message = customerInviteMessage({
      customerFirstName: input.referral.customer_first_name,
      partnerFirstName: input.partnerFirstName,
      serviceInterest: input.referral.service_interest,
      secureUrl,
    });
    await sendReferralProgramEmail({
      to: input.referral.customer_email,
      replyTo: supportEmail,
      ...message,
    });
    const action = input.isResend
      ? "customer_invite_resent"
      : "customer_invite_sent";
    const { error: sentUpdateError } = await input.admin
      .from("referrals")
      .update({
        customer_invite_status: "sent",
        customer_invite_sent_at: attemptAt,
        customer_invite_failure: null,
        customer_invite_resend_count:
          (input.referral.customer_invite_resend_count ?? 0) +
          (input.isResend ? 1 : 0),
        customer_last_activity_at: attemptAt,
      })
      .eq("id", input.referral.id);
    if (sentUpdateError) {
      console.error("CUSTOMER_INVITE_STATUS_ERROR", {
        referralId: input.referral.id,
      });
      return { sent: false, reason: "status_update_failed" };
    }
    const { error: sentAuditError } = await input.admin
      .from("referral_audit_log")
      .insert({
        actor_user_id: input.actorUserId ?? null,
        action,
        entity_type: "referral",
        entity_id: input.referral.id,
        after_data: { delivery: "sent" },
      });
    if (sentAuditError)
      console.error("CUSTOMER_INVITE_AUDIT_ERROR", {
        referralId: input.referral.id,
      });
    return { sent: true, secureUrl };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message.slice(0, 500)
        : "Email provider failure";
    const { error: failedUpdateError } = await input.admin
      .from("referrals")
      .update({
        customer_invite_status: "failed",
        customer_invite_failure: reason,
        customer_last_activity_at: attemptAt,
      })
      .eq("id", input.referral.id);
    if (failedUpdateError)
      console.error("CUSTOMER_INVITE_STATUS_ERROR", {
        referralId: input.referral.id,
      });
    const { error: failedAuditError } = await input.admin
      .from("referral_audit_log")
      .insert({
        actor_user_id: input.actorUserId ?? null,
        action: "customer_invite_failed",
        entity_type: "referral",
        entity_id: input.referral.id,
        after_data: { delivery: "failed" },
      });
    if (failedAuditError)
      console.error("CUSTOMER_INVITE_AUDIT_ERROR", {
        referralId: input.referral.id,
      });
    console.error("CUSTOMER_INVITE_FAILED", { referralId: input.referral.id });
    return { sent: false, reason: "delivery_failed" };
  }
}
