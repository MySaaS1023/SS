import { NextResponse } from "next/server";

import { normalizeText, rateLimit, validEmail } from "@/lib/referrals/server";
import {
  adminMustChangePassword,
  createServerSupabaseClient,
  isAdminEmail,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`admin-password-login:${ip}`, 8, 10 * 60_000))
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Enter your administrator email and password." },
      { status: 400 },
    );
  }
  const email = normalizeText(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!validEmail(email) || !password)
    return NextResponse.json(
      { error: "Enter your administrator email and password." },
      { status: 400 },
    );
  if (!isAdminEmail(email))
    return NextResponse.json(
      { error: "The email or password is incorrect." },
      { status: 403 },
    );

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user || !isAdminEmail(data.user.email)) {
    if (data.session) await supabase.auth.signOut();
    return NextResponse.json(
      { error: "The email or password is incorrect." },
      { status: 401 },
    );
  }
  return NextResponse.json({
    success: true,
    mustChangePassword: adminMustChangePassword(data.user),
  });
}
