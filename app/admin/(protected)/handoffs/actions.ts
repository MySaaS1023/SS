"use server";

import { revalidatePath } from "next/cache";
import { createHandoff, deactivateHandoff } from "@/lib/handoff/server";
import { HandoffError } from "@/lib/handoff/core";
import {
  saveHandoffClientCorrections,
  searchHandoffClients,
} from "@/lib/handoff/clients";
import { sendHandoffEmail } from "@/lib/handoff/delivery";

export type HandoffActionState = {
  ok: boolean;
  message: string;
  handoff?: {
    id: string;
    url: string;
    businessName: string;
    businessPhone: string;
    businessEmail: string;
    contactName: string;
    websiteUrl: string;
  };
};
export type HandoffDeliveryActionState = {
  ok: boolean;
  status: "idle" | "accepted" | "duplicate" | "failed";
  message: string;
};

function failure(error: unknown): HandoffActionState {
  return {
    ok: false,
    message:
      error instanceof HandoffError
        ? error.message
        : "We couldn't save this change. Check the handoff setup and try again.",
  };
}

export async function createHandoffAction(
  _previous: HandoffActionState,
  formData: FormData,
): Promise<HandoffActionState> {
  try {
    const input = {
      businessName: String(formData.get("businessName") ?? ""),
      businessPhone: String(formData.get("businessPhone") ?? ""),
      businessEmail: String(formData.get("businessEmail") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      message: String(formData.get("message") ?? ""),
      source: String(formData.get("source") ?? ""),
      sourceReferralId: String(formData.get("sourceReferralId") ?? ""),
      sourceUpdatedAt: String(formData.get("sourceUpdatedAt") ?? ""),
    };
    const handoff = await createHandoff(input);
    let correctionWarning = "";
    if (formData.get("saveClientCorrections") === "yes") {
      try {
        await saveHandoffClientCorrections(input);
      } catch (error) {
        correctionWarning =
          error instanceof Error
            ? ` The handoff was created, but the selected client record was not changed: ${error.message}`
            : " The handoff was created, but the selected client record was not changed.";
      }
    }
    revalidatePath("/admin/handoffs");
    if (!handoff.url)
      throw new HandoffError(
        "configuration",
        "The handoff was created but its secure link cannot be recovered with the current encryption key.",
      );
    return {
      ok: true,
      message: `Handoff created. Choose how to deliver it.${correctionWarning}`,
      handoff: {
        id: handoff.id,
        url: handoff.url,
        businessName: handoff.businessName,
        businessPhone: handoff.businessPhone,
        businessEmail: handoff.businessEmail,
        contactName: handoff.contactName,
        websiteUrl: handoff.websiteUrl,
      },
    };
  } catch (error) {
    return failure(error);
  }
}

export async function searchHandoffClientsAction(query: string) {
  try {
    return await searchHandoffClients(query);
  } catch {
    return [];
  }
}

export async function sendHandoffEmailAction(
  _previous: HandoffDeliveryActionState,
  formData: FormData,
): Promise<HandoffDeliveryActionState> {
  if (formData.get("confirmRecipient") !== "yes")
    return {
      ok: false,
      status: "failed",
      message: "Confirm the intended email recipient before sending.",
    };
  try {
    const result = await sendHandoffEmail({
      handoffId: String(formData.get("handoffId") ?? ""),
      destination: String(formData.get("destination") ?? ""),
    });
    return result;
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      message:
        error instanceof HandoffError
          ? error.message
          : "The email could not be sent. Review the delivery configuration and try again.",
    };
  }
}

export async function deactivateHandoffAction(
  _previous: HandoffActionState,
  formData: FormData,
): Promise<HandoffActionState> {
  try {
    await deactivateHandoff(String(formData.get("id") ?? ""));
    revalidatePath("/admin/handoffs");
    return {
      ok: true,
      message: "Handoff link deactivated. The client's website is unchanged.",
    };
  } catch (error) {
    return failure(error);
  }
}
