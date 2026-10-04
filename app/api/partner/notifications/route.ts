import { NextResponse } from "next/server";

import { normalizeText, requirePartnerApi } from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requirePartnerApi();
  if (auth instanceof NextResponse) return auth;
  const body = (await request.json()) as Record<string, unknown>;
  const action = normalizeText(body.action, 30);
  const id = normalizeText(body.id, 100);
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();
  if (action === "mark_all_read") {
    const { error } = await admin
      .from("partner_notifications")
      .update({ is_read: true, read_at: now })
      .eq("partner_id", auth.partner.id)
      .eq("is_read", false);
    if (error)
      return NextResponse.json(
        { error: "Unable to update notifications." },
        { status: 500 },
      );
    return NextResponse.json({ success: true });
  }
  if (action === "mark_read" && id) {
    const { data, error } = await admin
      .from("partner_notifications")
      .update({ is_read: true, read_at: now })
      .eq("id", id)
      .eq("partner_id", auth.partner.id)
      .select("id")
      .maybeSingle();
    if (error || !data)
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 },
      );
    return NextResponse.json({ success: true });
  }
  return NextResponse.json(
    { error: "Invalid notification action." },
    { status: 400 },
  );
}
