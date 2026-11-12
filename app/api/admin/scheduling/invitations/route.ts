import { getFullyAuthorizedAdminUser } from "@/lib/supabase/server";
import { getHandoffOrigin } from "@/lib/handoff/core";
import { handleInvitationRequest } from "@/lib/scheduling/invitation-http";
import { submitConsultationInvitation } from "@/lib/scheduling/invitation-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return handleInvitationRequest(request, {
    origin: getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    authorize: getFullyAuthorizedAdminUser,
    submit: submitConsultationInvitation,
  });
}
