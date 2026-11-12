import {
  administratorInvitationContext,
  prepareAdministratorInvitation,
} from "@/lib/admin-management/invitations-server";
import {
  invitationResponse,
  readInvitationRequest,
} from "@/lib/admin-management/invitations-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const context = await administratorInvitationContext();
    if (!context)
      return invitationResponse(
        { error: "Administrator invitations are unavailable." },
        403,
      );
    const parsed = await readInvitationRequest(request);
    if (parsed instanceof Response) return parsed;
    const invitation = await prepareAdministratorInvitation(
      context,
      parsed.body,
    );
    return invitationResponse(
      {
        invitation,
        message:
          "Invitation prepared for review. Nothing has been sent or activated.",
      },
      201,
    );
  } catch {
    return invitationResponse(
      {
        error:
          "Invitation could not be prepared. Check the details and existing identity records; existing accounts require separately approved onboarding.",
      },
      409,
    );
  }
}
