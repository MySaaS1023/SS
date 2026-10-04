import { NextResponse } from "next/server";

import {
  adminMustChangePassword,
  createAdminSupabaseClient,
  createServerSupabaseClient,
  getAdminUser,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user || !adminMustChangePassword(user))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Enter and confirm a valid password." },
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
  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError)
    return NextResponse.json(
      { error: "Unable to update the password." },
      { status: 400 },
    );

  const admin = createAdminSupabaseClient();
  const { error: metadataError } = await admin.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: {
        ...user.app_metadata,
        must_change_password: false,
      },
    },
  );
  if (metadataError)
    return NextResponse.json(
      {
        error:
          "Your password was updated, but setup could not be completed. Sign in again and retry.",
      },
      { status: 500 },
    );

  await supabase.auth.refreshSession();
  return NextResponse.json({ success: true });
}
