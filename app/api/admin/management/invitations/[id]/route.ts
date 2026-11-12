import {
  administratorInvitationContext,
  sendAdministratorInvitation,
  revokeAdministratorInvitation,
} from "@/lib/admin-management/invitations-server";
import {
  invitationResponse,
  readInvitationRequest,
} from "@/lib/admin-management/invitations-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await administratorInvitationContext();
    if (!context)
      return invitationResponse(
        { error: "Administrator invitations are unavailable." },
        403,
      );
    const parsed = await readInvitationRequest(request);
    if (parsed instanceof Response) return parsed;
    const { id } = await params;
    if (parsed.body.action === "revoke") {
      const ok = await revokeAdministratorInvitation(
        context,
        id,
        parsed.body.confirmation,
      );
      return invitationResponse(
        {
          message: ok
            ? "Invitation revoked and audited. This does not remove an accepted administrator."
            : "Invitation could not be revoked. Reload and confirm the recipient.",
        },
        ok ? 200 : 409,
      );
    }
    if (parsed.body.action !== "send" || parsed.body.ownerConfirmed !== true)
      return invitationResponse(
        { error: "Explicit owner confirmation is required." },
        400,
      );
    const result = await sendAdministratorInvitation(
      context,
      id,
      parsed.body.confirmation,
    );
    return invitationResponse(result, result.status === "accepted" ? 200 : 409);
  } catch {
    return invitationResponse(
      {
        error:
          "Invitation operation could not be confirmed. Do not retry a send; ask the owner to review its audited status and general email configuration.",
      },
      409,
    );
  }
}
