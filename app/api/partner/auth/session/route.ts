import { NextResponse } from "next/server";

import { getApprovedPartner } from "@/lib/supabase/server";

export async function GET() {
  const context = await getApprovedPartner();
  if (!context)
    return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true });
}
