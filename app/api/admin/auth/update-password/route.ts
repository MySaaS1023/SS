import { NextResponse } from "next/server";

import {
  createServerSupabaseClient,
  getAdminUser,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!(await getAdminUser()))
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
  if (password.length < 12)
    return NextResponse.json(
      { error: "Use a password with at least 12 characters." },
      { status: 400 },
    );
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return NextResponse.json(
      { error: "Unable to update the password. Request a new reset link." },
      { status: 400 },
    );
  return NextResponse.json({ success: true });
}
