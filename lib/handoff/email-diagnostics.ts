import "server-only";
import { getFullyAuthorizedAdminUser } from "@/lib/supabase/server";
import {
  probeHandoffEmailConfiguration,
  unavailableEmailDiagnostic,
} from "./email-diagnostics-core";

export async function checkHandoffEmailConfiguration() {
  // Authorize before accessing configuration or making any provider request.
  if (!(await getFullyAuthorizedAdminUser()))
    return unavailableEmailDiagnostic(
      "unauthorized",
      "Administrator access is required.",
    );
  return probeHandoffEmailConfiguration({
    apiKey: process.env.RESEND_API_KEY,
    sender: process.env.HANDOFF_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL,
  });
}
