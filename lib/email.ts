import { Resend } from "resend";

export const businessEmail = "support@steadystartco.com";
export const senderEmail =
  process.env.RESEND_FROM_EMAIL ?? "Steady Start <onboarding@resend.dev>";

export type ProjectRequestPayload = {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  selectedPackage: string;
  businessType: string;
  serviceModel: string;
  integrations: string;
  projectGoals: string;
  extraNotes: string;
};

export function formatProjectRequestEmail(
  payload: ProjectRequestPayload,
  submissionDate: string,
) {
  return [
    "New Steady Start Hire Us Submission",
    "",
    `Full Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Business Name: ${payload.businessName}`,
    `Selected Package: ${payload.selectedPackage}`,
    `Business Type: ${payload.businessType}`,
    `Service or Product Model: ${payload.serviceModel}`,
    `Booking / Integration Needs: ${payload.integrations}`,
    `Website Goals: ${payload.projectGoals}`,
    `Extra Notes: ${payload.extraNotes}`,
    `Submission Date: ${submissionDate}`,
  ].join("\n");
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

export function isValidSimpleEmail(email: string) {
  const normalizedEmail = email.trim();
  const atIndex = normalizedEmail.indexOf("@");

  if (atIndex <= 0 || atIndex !== normalizedEmail.lastIndexOf("@")) {
    return false;
  }

  const domain = normalizedEmail.slice(atIndex + 1);

  if (!domain || domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }

  return domain.includes(".");
}
