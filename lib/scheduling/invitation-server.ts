import "server-only";
import { getHandoffOrigin } from "@/lib/handoff/core";
import { createInvitationService } from "./invitation-core";

// Reuse only the existing general business email configuration. Referral
// Partner Program credentials are deliberately excluded from this workflow.
export const submitConsultationInvitation = createInvitationService({
  apiKey: () => process.env.RESEND_API_KEY,
  sender: () =>
    process.env.CONSULTATION_FROM_EMAIL ??
    process.env.HANDOFF_FROM_EMAIL ??
    process.env.RESEND_FROM_EMAIL,
  bookingUrl: `${getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL)}/consultation`,
});
