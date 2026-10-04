"use server";

import { revalidatePath } from "next/cache";

import { getSiteUrl } from "@/lib/referrals/config";
import { deliverCustomerInvite } from "@/lib/referrals/customer-handoff";
import {
  missingReferralEmailConfiguration,
  sendReferralEmail,
} from "@/lib/referrals/email";
import { generateTemporaryPartnerPassword } from "@/lib/referrals/partner-access";
import {
  PartnerApprovalError,
  resolveReusablePartner,
  safeApprovalFailureCode,
  type ReusablePartner,
} from "@/lib/referrals/partner-approval";
import {
  normalizeText,
  uniqueReferralCode,
  writeAudit,
} from "@/lib/referrals/server";
import { invalidPaymentCommissionStatus } from "@/lib/referrals/rules";
import {
  createPartnerNotification,
  referralDisplayName,
} from "@/lib/referrals/notifications";
import {
  canReviewApplication,
  isIdempotentDecision,
  preserveInternalNotes,
} from "@/lib/referrals/application-review";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

async function context() {
  const user = await getFullyAuthorizedAdminUser();
  if (!user) throw new Error("Administrator access required.");
  return { user, admin: createAdminSupabaseClient() };
}

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;

export type ApplicationReviewAction = "approve" | "reject";

export type ApplicationReviewResult = {
  ok: boolean;
  action?: ApplicationReviewAction;
  emailSent?: boolean;
};

async function findAuthUser(admin: AdminClient, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 100) break;
  }
  return null;
}

async function setTemporaryPartnerPassword(
  admin: AdminClient,
  authUser: Awaited<ReturnType<typeof findAuthUser>>,
  email: string,
  temporaryPassword: string,
) {
  if (authUser) {
    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      password: temporaryPassword,
      app_metadata: {
        ...authUser.app_metadata,
        must_change_password: true,
      },
    });
    if (error)
      throw new PartnerApprovalError("auth_user_update_failed", {
        cause: error,
      });
    return data.user;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    app_metadata: { must_change_password: true },
  });
  if (error)
    throw new PartnerApprovalError("auth_user_create_failed", { cause: error });
  return data.user;
}

const partnerSelection =
  "id,user_id,application_id,email,referral_code,status,approved_at";

async function findReusablePartner(
  admin: AdminClient,
  input: { applicationId: string; authUserId: string; email: string },
) {
  const [applicationResult, userResult, emailResult] = await Promise.all([
    admin
      .from("referral_partners")
      .select(partnerSelection)
      .eq("application_id", input.applicationId)
      .maybeSingle(),
    admin
      .from("referral_partners")
      .select(partnerSelection)
      .eq("user_id", input.authUserId)
      .maybeSingle(),
    admin
      .from("referral_partners")
      .select(partnerSelection)
      .ilike("email", input.email)
      .maybeSingle(),
  ]);
  const queryError =
    applicationResult.error ?? userResult.error ?? emailResult.error;
  if (queryError)
    throw new PartnerApprovalError("database_constraint_failed", {
      cause: queryError,
    });
  return resolveReusablePartner({
    authUserId: input.authUserId,
    byApplication: applicationResult.data as ReusablePartner | null,
    byUser: userResult.data as ReusablePartner | null,
    byEmail: emailResult.data as ReusablePartner | null,
  });
}

async function createPartnerWithReferralCodeRetry(
  admin: AdminClient,
  payload: Record<string, unknown>,
) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const referralCode = await uniqueReferralCode();
    const { data, error } = await admin
      .from("referral_partners")
      .insert({ ...payload, referral_code: referralCode })
      .select(partnerSelection)
      .single();
    if (!error) return data as ReusablePartner;
    const collision =
      error.code === "23505" &&
      `${error.message} ${error.details ?? ""}`.includes("referral_code");
    if (!collision)
      throw new PartnerApprovalError("partner_create_failed", {
        cause: error,
      });
  }
  throw new PartnerApprovalError("referral_code_collision");
}

async function sendPartnerAccessEmail(input: {
  actorUserId: string;
  partnerId: string;
  firstName: string;
  email: string;
  referralCode: string;
  temporaryPassword: string;
}) {
  try {
    if (missingReferralEmailConfiguration().length)
      throw new Error("Referral email is not configured.");
    await sendReferralEmail(input.email, {
      kind: "application_approved",
      firstName: input.firstName,
      partnerEmail: input.email,
      temporaryPassword: input.temporaryPassword,
      referralCode: input.referralCode,
      portalUrl: `${getSiteUrl()}/partner/login`,
    });
    return true;
  } catch {
    await writeAudit({
      actorUserId: input.actorUserId,
      action: "partner_access_email_failed",
      entityType: "partner",
      entityId: input.partnerId,
      after: { delivery: "failed" },
    });
    console.error("PARTNER_ACCESS_EMAIL_FAILED", {
      partnerId: input.partnerId,
    });
    return false;
  }
}

async function ensureApplicationAudit(
  admin: AdminClient,
  input: {
    actorUserId: string;
    action: "application_approved" | "application_rejected";
    applicationId: string;
    before: unknown;
    after: unknown;
  },
) {
  const { data: existing, error: lookupError } = await admin
    .from("referral_audit_log")
    .select("id")
    .eq("action", input.action)
    .eq("entity_type", "application")
    .eq("entity_id", input.applicationId)
    .limit(1)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return;
  const { error } = await admin.from("referral_audit_log").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: "application",
    entity_id: input.applicationId,
    before_data: input.before,
    after_data: input.after,
  });
  if (error) throw error;
}

export async function reviewApplication(
  formData: FormData,
): Promise<ApplicationReviewResult> {
  const id = normalizeText(formData.get("id"), 100);
  const action = normalizeText(formData.get("action"), 20);
  const notes = normalizeText(formData.get("notes"));
  const reviewAction = action as ApplicationReviewAction;
  let approvalEmailSent: boolean | undefined;
  if (!id || !["approve", "reject"].includes(action)) return { ok: false };

  try {
    const { user, admin } = await context();
    const { data: application, error } = await admin
      .from("referral_partner_applications")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !application)
      throw error ?? new Error("Application not found.");

    if (isIdempotentDecision(application.status, reviewAction)) {
      await ensureApplicationAudit(admin, {
        actorUserId: user.id,
        action:
          reviewAction === "approve"
            ? "application_approved"
            : "application_rejected",
        applicationId: id,
        before: application,
        after: { status: application.status, idempotent: true },
      });
      return { ok: true, action: reviewAction };
    }
    if (!canReviewApplication(application.status, reviewAction))
      throw new Error("Application is no longer pending.");

    const reviewedAt = new Date().toISOString();
    const internalNotes = preserveInternalNotes(
      notes,
      application.internal_notes,
    );

    if (reviewAction === "reject") {
      const { data: rejected, error: rejectError } = await admin
        .from("referral_partner_applications")
        .update({
          status: "rejected",
          internal_notes: internalNotes,
          reviewed_by: user.id,
          reviewed_at: reviewedAt,
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (rejectError) throw rejectError;
      if (!rejected) {
        const { data: latest } = await admin
          .from("referral_partner_applications")
          .select("status")
          .eq("id", id)
          .single();
        if (latest?.status !== "rejected")
          throw new Error("Application state changed during rejection.");
      }
      await ensureApplicationAudit(admin, {
        actorUserId: user.id,
        action: "application_rejected",
        applicationId: id,
        before: application,
        after: { status: "rejected", notes: internalNotes },
      });
      await sendReferralEmail(application.email, {
        kind: "application_rejected",
        firstName: application.first_name,
      }).catch((emailError) =>
        console.error("REFERRAL_APPLICATION_EMAIL_ERROR", {
          action: "reject",
          error: emailError,
        }),
      );
    } else {
      let authUser = await findAuthUser(admin, application.email);
      const temporaryPassword = generateTemporaryPartnerPassword();
      let partner = authUser
        ? await findReusablePartner(admin, {
            applicationId: application.id,
            authUserId: authUser.id,
            email: application.email,
          })
        : null;
      authUser = await setTemporaryPartnerPassword(
        admin,
        authUser,
        application.email,
        temporaryPassword,
      );
      partner ??= await findReusablePartner(admin, {
        applicationId: application.id,
        authUserId: authUser.id,
        email: application.email,
      });
      if (partner) {
        const { error: activateError } = await admin
          .from("referral_partners")
          .update({
            user_id: authUser.id,
            application_id: application.id,
            status: "approved",
            first_name: application.first_name,
            last_name: application.last_name,
            email: application.email,
            phone: application.phone,
            city: application.city,
            state: application.state,
            terms_version: application.terms_version,
            terms_accepted_at: application.terms_accepted_at,
            approved_at: partner.approved_at || reviewedAt,
            suspended_at: null,
            internal_notes: internalNotes,
          })
          .eq("id", partner.id);
        if (activateError)
          throw new PartnerApprovalError("partner_association_failed", {
            cause: activateError,
          });
      } else {
        partner = await createPartnerWithReferralCodeRetry(admin, {
          user_id: authUser.id,
          application_id: application.id,
          status: "approved",
          first_name: application.first_name,
          last_name: application.last_name,
          email: application.email,
          phone: application.phone,
          city: application.city,
          state: application.state,
          terms_version: application.terms_version,
          terms_accepted_at: application.terms_accepted_at,
          approved_at: reviewedAt,
          internal_notes: internalNotes,
        });
      }
      const code = partner.referral_code;

      const { data: approved, error: approveError } = await admin
        .from("referral_partner_applications")
        .update({
          status: "approved",
          internal_notes: internalNotes,
          reviewed_by: user.id,
          reviewed_at: reviewedAt,
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (approveError)
        throw new PartnerApprovalError("application_update_failed", {
          cause: approveError,
        });
      if (!approved) {
        const { data: latest } = await admin
          .from("referral_partner_applications")
          .select("status")
          .eq("id", id)
          .single();
        if (latest?.status !== "approved")
          throw new Error("Application state changed during approval.");
      }
      await ensureApplicationAudit(admin, {
        actorUserId: user.id,
        action: "application_approved",
        applicationId: id,
        before: application,
        after: {
          status: "approved",
          partner_id: partner.id,
          referral_code: code,
          user_id: authUser.id,
        },
      });
      approvalEmailSent = await sendPartnerAccessEmail({
        actorUserId: user.id,
        partnerId: partner.id,
        firstName: application.first_name,
        email: application.email,
        referralCode: code,
        temporaryPassword,
      });
    }
    revalidatePath("/admin/referral-program", "layout");
    return {
      ok: true,
      action: reviewAction,
      emailSent: approvalEmailSent,
    };
  } catch (error) {
    console.error("REFERRAL_APPLICATION_REVIEW_ERROR", {
      action: reviewAction,
      applicationId: id,
      event: safeApprovalFailureCode(error),
      cause:
        error instanceof PartnerApprovalError && error.cause
          ? error.cause
          : error,
    });
    return { ok: false, action: reviewAction };
  }
}

export type RegeneratePartnerAccessResult = {
  ok: boolean;
  emailSent?: boolean;
};

export async function regeneratePartnerAccess(
  formData: FormData,
): Promise<RegeneratePartnerAccessResult> {
  const id = normalizeText(formData.get("id"), 100);
  if (!id) return { ok: false };
  try {
    const { user, admin } = await context();
    const { data: partner, error } = await admin
      .from("referral_partners")
      .select("id,user_id,status,first_name,email,referral_code")
      .eq("id", id)
      .single();
    if (error || !partner) throw error ?? new Error("Partner not found.");
    if (partner.status !== "approved" || !partner.user_id)
      throw new Error("Only active Partners can receive new access.");

    const { data: authData, error: authError } =
      await admin.auth.admin.getUserById(partner.user_id);
    if (authError || !authData.user)
      throw authError ?? new Error("Partner Auth identity not found.");
    const temporaryPassword = generateTemporaryPartnerPassword();
    await setTemporaryPartnerPassword(
      admin,
      authData.user,
      partner.email,
      temporaryPassword,
    );
    await writeAudit({
      actorUserId: user.id,
      action: "partner_access_regenerated",
      entityType: "partner",
      entityId: partner.id,
      after: { must_change_password: true },
    });
    const emailSent = await sendPartnerAccessEmail({
      actorUserId: user.id,
      partnerId: partner.id,
      firstName: partner.first_name,
      email: partner.email,
      referralCode: partner.referral_code,
      temporaryPassword,
    });
    revalidatePath("/admin/referral-program/partners");
    return { ok: true, emailSent };
  } catch (error) {
    console.error("PARTNER_ACCESS_REGENERATION_ERROR", {
      partnerId: id,
      error,
    });
    return { ok: false };
  }
}

export async function updatePartner(formData: FormData) {
  const { user, admin } = await context();
  const id = normalizeText(formData.get("id"), 100);
  const status = normalizeText(formData.get("status"), 20);
  if (!["approved", "suspended"].includes(status))
    throw new Error("Invalid partner status.");
  const { data: before } = await admin
    .from("referral_partners")
    .select("*")
    .eq("id", id)
    .single();
  if (!before) throw new Error("Partner not found.");
  const update = {
    status,
    internal_notes: normalizeText(formData.get("notes")) || null,
    suspended_at: status === "suspended" ? new Date().toISOString() : null,
  };
  const { error } = await admin
    .from("referral_partners")
    .update(update)
    .eq("id", id);
  if (error) throw error;
  await writeAudit({
    actorUserId: user.id,
    action:
      status === "suspended" ? "partner_suspended" : "partner_reactivated",
    entityType: "partner",
    entityId: id,
    before,
    after: update,
  });
  if (status === "suspended")
    await sendReferralEmail(before.email, {
      kind: "account_suspended",
      firstName: before.first_name,
    }).catch(console.error);
  revalidatePath("/admin/referral-program", "layout");
}

export async function updateReferral(formData: FormData) {
  const { user, admin } = await context();
  const id = normalizeText(formData.get("id"), 100);
  const status = normalizeText(formData.get("status"), 40);
  const partnerId = normalizeText(formData.get("partnerId"), 100);
  const allowed = [
    "submitted",
    "contacted",
    "consultation_scheduled",
    "customer",
    "payment_pending",
    "payment_confirmed",
    "closed",
  ];
  if (!allowed.includes(status)) throw new Error("Invalid referral status.");
  const { data: before } = await admin
    .from("referrals")
    .select("*")
    .eq("id", id)
    .single();
  if (!before) throw new Error("Referral not found.");
  if (partnerId) {
    const { data: partner } = await admin
      .from("referral_partners")
      .select("id,referral_code")
      .eq("id", partnerId)
      .eq("status", "approved")
      .single();
    if (!partner) throw new Error("Active partner not found.");
    const { error } = await admin
      .from("referrals")
      .update({
        status,
        partner_id: partner.id,
        duplicate_review: false,
        converted_at:
          status === "customer"
            ? new Date().toISOString()
            : before.converted_at,
      })
      .eq("id", id);
    if (error) throw error;
    if (before.lead_id)
      await admin
        .from("hire_us_submissions")
        .update({
          referral_partner_id: partner.id,
          referral_code: partner.referral_code,
          referral_id: id,
          referral_source: "admin_correction",
          referral_attributed_at: new Date().toISOString(),
        })
        .eq("id", before.lead_id);
    await writeAudit({
      actorUserId: user.id,
      action: "referral_attribution_corrected",
      entityType: "referral",
      entityId: id,
      before,
      after: { status, partner_id: partner.id },
    });
  } else {
    const { error } = await admin
      .from("referrals")
      .update({
        status,
        notes: normalizeText(formData.get("notes")) || before.notes,
        converted_at:
          status === "customer"
            ? new Date().toISOString()
            : before.converted_at,
      })
      .eq("id", id);
    if (error) throw error;
    await writeAudit({
      actorUserId: user.id,
      action: "referral_updated",
      entityType: "referral",
      entityId: id,
      before,
      after: { status },
    });
  }
  if (status === "customer" && before.status !== "customer") {
    const ownerId = partnerId || before.partner_id;
    const { data: owner } = await admin
      .from("referral_partners")
      .select("first_name,email")
      .eq("id", ownerId)
      .single();
    if (owner) {
      await sendReferralEmail(owner.email, {
        kind: "referral_converted",
        firstName: owner.first_name,
        businessName:
          before.business_name ||
          `${before.customer_first_name} ${before.customer_last_name}`,
        portalUrl: `${getSiteUrl()}/partner/referrals`,
      }).catch(console.error);
    }
  }
  revalidatePath("/admin/referral-program", "layout");
}

export async function resendCustomerInvite(formData: FormData) {
  const { user, admin } = await context();
  const id = normalizeText(formData.get("id"), 100);
  const { data: referral } = await admin
    .from("referrals")
    .select("*")
    .eq("id", id)
    .single();
  if (!referral) throw new Error("Referral not found.");
  const { data: partner } = await admin
    .from("referral_partners")
    .select("first_name")
    .eq("id", referral.partner_id)
    .single();
  if (!partner) throw new Error("Referral Partner not found.");
  await deliverCustomerInvite({
    admin,
    referral,
    partnerFirstName: partner.first_name,
    isResend: referral.customer_invite_status !== "not_sent",
    actorUserId: user.id,
  });
  revalidatePath("/admin/referral-program/referrals");
}

export async function confirmCustomerPayment(formData: FormData) {
  const { user, admin } = await context();
  const referralId = normalizeText(formData.get("referralId"), 100);
  const transactionId = normalizeText(formData.get("transactionId"), 240);
  const amountCents = Math.round(Number(formData.get("paymentAmount")) * 100);
  const paymentDate =
    normalizeText(formData.get("paymentDate"), 40) || new Date().toISOString();
  if (
    !referralId ||
    !transactionId ||
    !Number.isSafeInteger(amountCents) ||
    amountCents <= 0
  )
    throw new Error("Valid payment details are required.");
  const { data: existing } = await admin
    .from("referral_commissions")
    .select("id")
    .eq("transaction_id", transactionId)
    .maybeSingle();
  const { data: commission, error } = await admin.rpc(
    "confirm_referral_payment",
    {
      p_referral_id: referralId,
      p_transaction_id: transactionId,
      p_payment_amount_cents: amountCents,
      p_payment_date: new Date(paymentDate).toISOString(),
    },
  );
  if (error) throw error;
  if (!existing && commission) {
    const { data: referral } = await admin
      .from("referrals")
      .select("business_name,customer_first_name,customer_last_name,partner_id")
      .eq("id", referralId)
      .single();
    if (!referral)
      throw new Error("Referral not found after payment confirmation.");
    const { data: partner } = await admin
      .from("referral_partners")
      .select("first_name,email")
      .eq("id", referral.partner_id)
      .single();
    if (!partner)
      throw new Error("Referral Partner not found after payment confirmation.");
    await writeAudit({
      actorUserId: user.id,
      action: "customer_payment_confirmed",
      entityType: "commission",
      entityId: commission.id,
      after: {
        referral_id: referralId,
        transaction_id: transactionId,
        amount_cents: amountCents,
      },
    });
    await createPartnerNotification({
      admin,
      partnerId: referral.partner_id,
      type: "payment_confirmed",
      title: "You earned $100!",
      message: `Your referral ${referralDisplayName(referral)} became an eligible paying Steady Start customer. Your $100 referral commission is now eligible for review.`,
      eventKey: `commission_eligible:${commission.id}`,
      referralId,
      commissionId: commission.id,
    });
    await sendReferralEmail(partner.email, {
      kind: "commission_earned",
      firstName: partner.first_name,
      businessName:
        referral.business_name ||
        `${referral.customer_first_name} ${referral.customer_last_name}`,
      portalUrl: `${getSiteUrl()}/partner/commissions`,
    }).catch(console.error);
  }
  revalidatePath("/admin/referral-program", "layout");
}

export async function updateCommission(formData: FormData) {
  const { user, admin } = await context();
  const id = normalizeText(formData.get("id"), 100);
  const action = normalizeText(formData.get("action"), 30);
  const { data: before } = await admin
    .from("referral_commissions")
    .select("*")
    .eq("id", id)
    .single();
  if (!before) throw new Error("Commission not found.");
  const { data: partner } = await admin
    .from("referral_partners")
    .select("first_name,email")
    .eq("id", before.partner_id)
    .single();
  const { data: referral } = await admin
    .from("referrals")
    .select("business_name,customer_first_name,customer_last_name")
    .eq("id", before.referral_id)
    .single();
  if (!partner || !referral)
    throw new Error("Commission relationship is incomplete.");
  const businessName =
    referral.business_name ||
    `${referral.customer_first_name} ${referral.customer_last_name}`;
  if (action === "approve") {
    if (before.status !== "eligible")
      throw new Error("Only eligible commissions may be approved.");
    const { error: approveError } = await admin
      .from("referral_commissions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        admin_notes: normalizeText(formData.get("notes")) || null,
      })
      .eq("id", id);
    if (approveError) throw approveError;
    await createPartnerNotification({
      admin,
      partnerId: before.partner_id,
      type: "commission_approved",
      title: "$100 Commission Approved",
      message: "Your referral commission has been approved.",
      eventKey: `commission_approved:${before.id}`,
      referralId: before.referral_id,
      commissionId: before.id,
    });
    await sendReferralEmail(partner.email, {
      kind: "commission_approved",
      firstName: partner.first_name,
      businessName,
      portalUrl: `${getSiteUrl()}/partner/commissions`,
    }).catch(console.error);
  } else if (action === "reverse") {
    const invalidStatus = invalidPaymentCommissionStatus(before.status);
    const { error: reverseError } = await admin
      .from("referral_commissions")
      .update(
        invalidStatus === "disputed"
          ? {
              status: invalidStatus,
              paid_review_required: true,
              admin_notes:
                normalizeText(formData.get("notes")) ||
                "Paid commission requires review.",
            }
          : {
              status: invalidStatus,
              reversed_at: new Date().toISOString(),
              admin_notes: normalizeText(formData.get("notes")) || null,
            },
      )
      .eq("id", id);
    if (reverseError) throw reverseError;
  } else if (action === "paid") {
    const method = normalizeText(formData.get("paymentMethod"), 40);
    const reference = normalizeText(formData.get("payoutReference"), 240);
    if (!method || !reference)
      throw new Error("Payment method and payout reference are required.");
    const { error } = await admin.rpc("mark_referral_commission_paid", {
      p_commission_id: id,
      p_payment_method: method,
      p_payout_reference: reference,
      p_paid_at: new Date().toISOString(),
      p_recorded_by: user.id,
    });
    if (error) throw error;
    await createPartnerNotification({
      admin,
      partnerId: before.partner_id,
      type: "commission_paid",
      title: "$100 Commission Paid",
      message: "Your Steady Start referral commission has been marked paid.",
      eventKey: `commission_paid:${before.id}`,
      referralId: before.referral_id,
      commissionId: before.id,
    });
    await sendReferralEmail(partner.email, {
      kind: "commission_paid",
      firstName: partner.first_name,
      businessName,
      payoutReference: reference,
      portalUrl: `${getSiteUrl()}/partner/commissions`,
    }).catch(console.error);
  }
  await writeAudit({
    actorUserId: user.id,
    action: `commission_${action}`,
    entityType: "commission",
    entityId: id,
    before,
    after: { action },
  });
  revalidatePath("/admin/referral-program", "layout");
}
