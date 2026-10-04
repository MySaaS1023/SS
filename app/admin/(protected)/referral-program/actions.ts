"use server";

import { revalidatePath } from "next/cache";

import { getSiteUrl } from "@/lib/referrals/config";
import { sendReferralEmail } from "@/lib/referrals/email";
import {
  normalizeText,
  uniqueReferralCode,
  writeAudit,
} from "@/lib/referrals/server";
import { invalidPaymentCommissionStatus } from "@/lib/referrals/rules";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

async function context() {
  const user = await getFullyAuthorizedAdminUser();
  if (!user) throw new Error("Administrator access required.");
  return { user, admin: createAdminSupabaseClient() };
}

async function findAuthUser(email: string) {
  const { admin } = await context();
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

export async function reviewApplication(formData: FormData) {
  const { user, admin } = await context();
  const id = normalizeText(formData.get("id"), 100);
  const action = normalizeText(formData.get("action"), 20);
  const notes = normalizeText(formData.get("notes"));
  const { data: application, error } = await admin
    .from("referral_partner_applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !application || application.status !== "pending")
    throw new Error("Pending application not found.");

  if (action === "reject") {
    await admin
      .from("referral_partner_applications")
      .update({
        status: "rejected",
        internal_notes: notes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    await writeAudit({
      actorUserId: user.id,
      action: "application_rejected",
      entityType: "application",
      entityId: id,
      before: application,
      after: { status: "rejected", notes },
    });
    await sendReferralEmail(application.email, {
      kind: "application_rejected",
      firstName: application.first_name,
    }).catch(console.error);
  } else if (action === "approve") {
    let authUser = await findAuthUser(application.email);
    if (!authUser) {
      const { data, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(application.email, {
          redirectTo: `${getSiteUrl()}/auth/callback?next=/partner`,
        });
      if (inviteError) throw inviteError;
      authUser = data.user;
    }
    const code = await uniqueReferralCode();
    const { data: partner, error: partnerError } = await admin
      .from("referral_partners")
      .insert({
        user_id: authUser.id,
        application_id: application.id,
        referral_code: code,
        status: "approved",
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone,
        city: application.city,
        state: application.state,
        terms_version: application.terms_version,
        terms_accepted_at: application.terms_accepted_at,
        approved_at: new Date().toISOString(),
        internal_notes: notes || null,
      })
      .select("id")
      .single();
    if (partnerError) throw partnerError;
    await admin
      .from("referral_partner_applications")
      .update({
        status: "approved",
        internal_notes: notes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    await writeAudit({
      actorUserId: user.id,
      action: "application_approved",
      entityType: "partner",
      entityId: partner.id,
      before: application,
      after: { status: "approved", referral_code: code, user_id: authUser.id },
    });
    await sendReferralEmail(application.email, {
      kind: "application_approved",
      firstName: application.first_name,
      referralCode: code,
      portalUrl: `${getSiteUrl()}/partner/login`,
    }).catch(console.error);
  }
  revalidatePath("/admin/referral-program", "layout");
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
    await admin
      .from("referral_commissions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        admin_notes: normalizeText(formData.get("notes")) || null,
      })
      .eq("id", id);
    await sendReferralEmail(partner.email, {
      kind: "commission_approved",
      firstName: partner.first_name,
      businessName,
      portalUrl: `${getSiteUrl()}/partner/commissions`,
    }).catch(console.error);
  } else if (action === "reverse") {
    const invalidStatus = invalidPaymentCommissionStatus(before.status);
    await admin
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
