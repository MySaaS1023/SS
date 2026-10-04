import { NextResponse } from "next/server";

import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
  getApprovedPartner,
} from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/referrals/rules";

export function normalizeText(value: unknown, max = 2_000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export async function uniqueReferralCode() {
  const admin = createAdminSupabaseClient();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode();
    const { data } = await admin
      .from("referral_partners")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("Unable to allocate a unique referral code.");
}

export async function requirePartnerApi() {
  const context = await getApprovedPartner();
  return (
    context ??
    NextResponse.json(
      { error: "Approved partner access is required." },
      { status: 403 },
    )
  );
}

export async function requireAdminApi() {
  const user = await getFullyAuthorizedAdminUser();
  return (
    user ??
    NextResponse.json(
      { error: "Administrator access is required." },
      { status: 403 },
    )
  );
}

export async function writeAudit(input: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("referral_audit_log").insert({
    actor_user_id: input.actorUserId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    before_data: input.before ?? null,
    after_data: input.after ?? null,
  });
  if (error) console.error("REFERRAL_AUDIT_ERROR", error);
}

const attempts = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
