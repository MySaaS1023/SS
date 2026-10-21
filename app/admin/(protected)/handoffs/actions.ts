"use server";

import { revalidatePath } from "next/cache";
import { createHandoff, deactivateHandoff } from "@/lib/handoff/server";
import { HandoffError } from "@/lib/handoff/core";

export type HandoffActionState = { ok: boolean; message: string };

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
    await createHandoff({
      businessName: String(formData.get("businessName") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      message: String(formData.get("message") ?? ""),
    });
    revalidatePath("/admin/handoffs");
    return {
      ok: true,
      message: "Handoff created. Preview it before sharing the link.",
    };
  } catch (error) {
    return failure(error);
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
