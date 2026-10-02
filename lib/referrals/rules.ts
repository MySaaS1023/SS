import { randomBytes } from "node:crypto";

export function generateReferralCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return `SS-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export function chooseFirstReferralOwner(
  existingPartnerId: string | null,
  candidatePartnerId: string,
) {
  return existingPartnerId ?? candidatePartnerId;
}

export function invalidPaymentCommissionStatus(currentStatus: string) {
  return currentStatus === "paid" ? "disputed" : "reversed";
}

export function isSelfReferral(partnerEmail: string, customerEmail: string) {
  return (
    partnerEmail.trim().toLowerCase() === customerEmail.trim().toLowerCase()
  );
}
