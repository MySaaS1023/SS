import "server-only";

import { createHash } from "node:crypto";

import { HandoffError, validateEmail } from "@/lib/handoff/core";
import { getHandoffForDelivery } from "@/lib/handoff/server";
import { handoffEmailMessage } from "@/lib/handoff/messages";
import { businessEmail, getResendClient, senderEmail } from "@/lib/email";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

export type HandoffDeliveryResult = {
  ok: boolean;
  status: "accepted" | "duplicate" | "failed";
  message: string;
};

function messageHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function sendHandoffEmail(input: {
  handoffId: string;
  destination: string;
}): Promise<HandoffDeliveryResult> {
  const user = await getFullyAuthorizedAdminUser();
  if (!user)
    throw new HandoffError("unauthorized", "Administrator access is required.");
  const destination = validateEmail(input.destination);
  const handoff = await getHandoffForDelivery(input.handoffId);
  if (!handoff || handoff.status !== "active" || !handoff.url)
    throw new HandoffError(
      "delivery_unavailable",
      "This handoff link is not available for delivery.",
    );
  const email = handoffEmailMessage(handoff);
  const contentHash = messageHash(`${email.subject}\n${email.text}`);
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();
  let deliveryId: string | null = null;

  const inserted = await admin
    .from("client_handoff_deliveries")
    .insert({
      handoff_id: handoff.id,
      channel: "email",
      destination,
      content_hash: contentHash,
      status: "sending",
      attempt_count: 1,
      provider: "resend",
      created_by: user.id,
      updated_at: now,
    })
    .select("id")
    .maybeSingle();
  if (!inserted.error && inserted.data) {
    deliveryId = inserted.data.id;
  } else if (inserted.error?.code === "23505") {
    const { data: existing } = await admin
      .from("client_handoff_deliveries")
      .select("id,status,attempt_count")
      .eq("handoff_id", handoff.id)
      .eq("channel", "email")
      .eq("destination", destination)
      .eq("content_hash", contentHash)
      .maybeSingle();
    if (!existing || ["sending", "accepted"].includes(existing.status))
      return {
        ok: true,
        status: "duplicate",
        message: "This email was already sent or is currently being processed.",
      };
    if (existing.attempt_count >= 3)
      return {
        ok: false,
        status: "failed",
        message:
          "The three permitted delivery attempts were used. Review the address and contact the client another way.",
      };
    const { data: claimed } = await admin
      .from("client_handoff_deliveries")
      .update({
        status: "sending",
        attempt_count: existing.attempt_count + 1,
        last_error_code: null,
        updated_at: now,
      })
      .eq("id", existing.id)
      .eq("status", "failed")
      .eq("attempt_count", existing.attempt_count)
      .select("id")
      .maybeSingle();
    if (!claimed)
      return {
        ok: true,
        status: "duplicate",
        message: "This email is currently being processed.",
      };
    deliveryId = claimed.id;
  } else {
    throw new HandoffError(
      "storage_unavailable",
      "Email delivery history is unavailable.",
    );
  }

  try {
    const result = await getResendClient().emails.send({
      from: senderEmail,
      to: [destination],
      replyTo: businessEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    if (result.error) throw new Error("provider_rejected");
    await admin
      .from("client_handoff_deliveries")
      .update({
        status: "accepted",
        provider_message_id: result.data?.id ?? null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", deliveryId);
    return {
      ok: true,
      status: "accepted",
      message:
        "Resend accepted the email. Inbox delivery depends on the recipient's mail provider.",
    };
  } catch (error) {
    const errorCode =
      error instanceof Error && error.message === "provider_rejected"
        ? "provider_rejected"
        : process.env.RESEND_API_KEY
          ? "provider_failure"
          : "configuration_missing";
    await admin
      .from("client_handoff_deliveries")
      .update({
        status: "failed",
        last_error_code: errorCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deliveryId);
    console.error("HANDOFF_EMAIL_DELIVERY_FAILURE", {
      handoffId: handoff.id,
      errorCode,
    });
    return {
      ok: false,
      status: "failed",
      message:
        "The email was not accepted. Confirm the address and configuration before retrying.",
    };
  }
}

export function handoffSmsConfigured() {
  return false;
}
