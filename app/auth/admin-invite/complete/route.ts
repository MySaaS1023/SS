import { completeAdministratorInvitation } from "@/lib/admin-management/invitations-server";
import { invitationsEnabled } from "@/lib/admin-management/invitations-core";
import {
  invitationResponse,
  readInvitationRequest,
} from "@/lib/admin-management/invitations-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!invitationsEnabled())
    return invitationResponse(
      { error: "Invitation acceptance is unavailable." },
      403,
    );
  const parsed = await readInvitationRequest(request);
  if (parsed instanceof Response) return parsed;
  if (parsed.body.accept !== true)
    return invitationResponse(
      { error: "Explicit acceptance is required." },
      400,
    );
  try {
    const ok = await completeAdministratorInvitation(
      parsed.body.password,
      parsed.body.confirmation,
    );
    return invitationResponse(
      {
        message: ok
          ? "Your administrator invitation was accepted. Sign in with your own new password."
          : "Invitation could not be accepted. It may be expired, revoked, used, or require owner review.",
      },
      ok ? 200 : 409,
    );
  } catch {
    return invitationResponse(
      {
        error:
          "Invitation acceptance could not be confirmed. Contact the owner; do not retry.",
      },
      409,
    );
  }
}
