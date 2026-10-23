import "server-only";

import { validateDetails } from "@/lib/handoff/core";
import { writeAudit } from "@/lib/referrals/server";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

export type HandoffClientMatch = {
  source: "referral" | "handoff";
  sourceId: string;
  sourceUpdatedAt: string | null;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  contactName: string;
  websiteUrl: string;
};

function safeSearch(value: string) {
  return value
    .replace(/[%_\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export async function searchHandoffClients(
  value: string,
): Promise<HandoffClientMatch[]> {
  const user = await getFullyAuthorizedAdminUser();
  if (!user) throw new Error("Administrator access is required.");
  const query = safeSearch(value);
  if (query.length < 2) return [];
  const admin = createAdminSupabaseClient();
  const [{ data: referrals, error: referralError }, handoffResult] =
    await Promise.all([
      admin
        .from("referrals")
        .select(
          "id,business_name,customer_first_name,customer_last_name,customer_email,customer_phone,website,updated_at",
        )
        .ilike("business_name", `%${query}%`)
        .order("updated_at", { ascending: false })
        .limit(8),
      admin
        .from("client_handoffs")
        .select(
          "id,business_name,business_phone,business_email,contact_name,website_url,created_at",
        )
        .ilike("business_name", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
  if (referralError)
    throw new Error("Client lookup is temporarily unavailable.");

  const matches = new Map<string, HandoffClientMatch>();
  for (const referral of referrals ?? []) {
    if (!referral.business_name) continue;
    matches.set(referral.business_name.trim().toLowerCase(), {
      source: "referral",
      sourceId: referral.id,
      sourceUpdatedAt: referral.updated_at,
      businessName: referral.business_name,
      businessPhone: referral.customer_phone ?? "",
      businessEmail: referral.customer_email ?? "",
      contactName: [referral.customer_first_name, referral.customer_last_name]
        .filter(Boolean)
        .join(" "),
      websiteUrl: referral.website ?? "",
    });
  }
  if (!handoffResult.error) {
    for (const handoff of handoffResult.data ?? []) {
      const key = handoff.business_name.trim().toLowerCase();
      const existing = matches.get(key);
      if (existing) {
        matches.set(key, {
          ...existing,
          businessPhone: existing.businessPhone || handoff.business_phone || "",
          businessEmail: existing.businessEmail || handoff.business_email || "",
          contactName: existing.contactName || handoff.contact_name || "",
          websiteUrl: existing.websiteUrl || handoff.website_url || "",
        });
      } else {
        matches.set(key, {
          source: "handoff",
          sourceId: handoff.id,
          sourceUpdatedAt: handoff.created_at,
          businessName: handoff.business_name,
          businessPhone: handoff.business_phone ?? "",
          businessEmail: handoff.business_email ?? "",
          contactName: handoff.contact_name ?? "",
          websiteUrl: handoff.website_url,
        });
      }
    }
  }
  return [...matches.values()].slice(0, 8);
}

export async function saveHandoffClientCorrections(input: unknown) {
  const user = await getFullyAuthorizedAdminUser();
  if (!user) throw new Error("Administrator access is required.");
  const data = input as Record<string, unknown>;
  if (data.source !== "referral" || typeof data.sourceUpdatedAt !== "string")
    throw new Error("Only a selected customer record can be updated.");
  const details = validateDetails(data);
  if (!details.sourceReferralId)
    throw new Error("Select the customer record again before saving changes.");
  const nameParts = details.contactName.split(/\s+/);
  const firstName = nameParts.shift() ?? details.contactName;
  const lastName = nameParts.join(" ") || "Not provided";
  const admin = createAdminSupabaseClient();
  const { data: updated, error } = await admin
    .from("referrals")
    .update({
      business_name: details.businessName,
      customer_first_name: firstName,
      customer_last_name: lastName,
      customer_email: details.businessEmail,
      customer_phone: details.businessPhone,
      website: details.websiteUrl,
    })
    .eq("id", details.sourceReferralId)
    .eq("updated_at", data.sourceUpdatedAt)
    .select("id")
    .maybeSingle();
  if (error)
    throw new Error("The selected client record could not be updated.");
  if (!updated)
    throw new Error(
      "The selected client record changed. Search for it again before saving corrections.",
    );
  await writeAudit({
    actorUserId: user.id,
    action: "handoff_client_contact_updated",
    entityType: "referral",
    entityId: updated.id,
    after: {
      changed_fields: [
        "business_name",
        "customer_name",
        "customer_email",
        "customer_phone",
        "website",
      ],
    },
  });
}
