export const consultationInvitationSubject =
  "Schedule your Steady Start launch consultation";

export function consultationInvitationText(url: string) {
  return `Hello,\n\nYou're invited to schedule a launch consultation with Steady Start LLC. Choose an available date and time using this link:\n\n${url}\n\nSubmitting a booking request does not confirm a meeting. Steady Start will review your request and follow up with the details.\n\nThank you,\nSteady Start LLC\nsupport@steadystartco.com`;
}

export type ConsultationInvitationResult = {
  ok: boolean;
  status:
    | "preview"
    | "accepted"
    | "duplicate"
    | "pending"
    | "rejected"
    | "indeterminate"
    | "setup"
    | "limited"
    | "validation"
    | "unauthorized";
  message: string;
  recipient?: string;
  confirmationToken?: string;
  checkedAt?: string;
  providerId?: string;
};
