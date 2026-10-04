import { NextResponse } from "next/server";

import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  const context = await getApprovedPartner();
  if (!context)
    return NextResponse.json(
      { error: "Your recovery session is invalid or has expired." },
      { status: 401 },
    );
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Enter a valid password." },
      { status: 400 },
    );
  }
  const password = typeof body.password === "string" ? body.password : "";
  const confirmation =
    typeof body.confirmation === "string" ? body.confirmation : "";
  if (password.length < 12)
    return NextResponse.json(
      { error: "Use a password with at least 12 characters." },
      { status: 400 },
    );
  if (password !== confirmation)
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 },
    );
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return NextResponse.json(
      { error: "Unable to update the password. Request a new reset link." },
      { status: 400 },
    );
  const admin = createAdminSupabaseClient();
  const { error: metadataError } = await admin.auth.admin.updateUserById(
    context.user.id,
    {
      app_metadata: {
        ...context.user.app_metadata,
        must_change_password: false,
      },
    },
  );
  if (metadataError)
    return NextResponse.json(
      { error: "Password updated, but account setup remains incomplete." },
      { status: 500 },
    );
  return NextResponse.json({ success: true });
}
