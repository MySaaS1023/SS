import "server-only";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";
import { searchHandoffClients } from "@/lib/handoff/clients";
import { businessEmail, getResendClient } from "@/lib/email";
import { validHandoffSender } from "@/lib/handoff/delivery-core";
import {
  confirmationMessage,
  defaultSchedule,
  hash,
  rateKey,
  SchedulingError,
  validateBooking,
  validateSchedule,
  validateZoomUrl,
  type ScheduleSettings,
} from "./core";
import { dispatchConsultationNotification } from "./notifications";

export type Consultation = {
  id: string;
  business_name: string;
  full_name: string;
  email: string;
  phone: string;
  purpose: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  customer_time_zone: string;
  status: "pending" | "confirmed" | "rescheduled" | "completed" | "canceled";
  zoom_join_url: string | null;
  version: number;
  created_at: string;
  source_referral_id: string | null;
  source_handoff_id: string | null;
};
export type Notification = {
  id: string;
  consultation_id: string;
  consultation_version: number;
  destination: string;
  status: string;
  attempt_count: number;
  provider_message_id: string | null;
  provider_checked_at: string | null;
  provider_event: string | null;
  updated_at: string;
};
async function authorize() {
  const actor = await getFullyAuthorizedAdminUser();
  if (!actor)
    throw new SchedulingError(
      "Administrator access is required.",
      "unauthorized",
    );
  return actor;
}
function check(error: unknown) {
  if (error)
    throw new SchedulingError(
      "Scheduling storage is unavailable. Check the approved scheduling migration and permissions.",
      "unavailable",
    );
}
const db = createAdminSupabaseClient;
const columns =
  "id,business_name,full_name,email,phone,purpose,notes,starts_at,ends_at,customer_time_zone,status,zoom_join_url,version,created_at,source_referral_id,source_handoff_id";
async function readScheduleSettings(): Promise<ScheduleSettings> {
  const { data, error } = await db()
    .from("consultation_settings")
    .select("settings,version")
    .eq("id", true)
    .single();
  check(error);
  if (!data) throw new SchedulingError("Scheduling settings are unavailable.");
  return validateSchedule({ ...data.settings, version: data.version });
}
export async function getScheduleSettings(): Promise<ScheduleSettings> {
  await authorize();
  return readScheduleSettings();
}
export async function publicSchedule() {
  try {
    const s = await readScheduleSettings();
    return {
      enabled: s.enabled,
      timeZone: s.timeZone,
      durationMinutes: s.durationMinutes,
    };
  } catch {
    return {
      enabled: false,
      timeZone: defaultSchedule.timeZone,
      durationMinutes: defaultSchedule.durationMinutes,
    };
  }
}
export async function availableSlots(date: string): Promise<string[]> {
  const { data, error } = await db().rpc("get_consultation_slots", {
    p_date: date,
  });
  check(error);
  return Array.isArray(data)
    ? data.filter((d): d is string => typeof d === "string")
    : [];
}
export async function submitBooking(input: unknown, address: string) {
  const details = validateBooking(input);
  const key = hash(`consultation-request-v1\n${details.requestKey}`);
  const { data, error } = await db().rpc("create_consultation_request", {
    p_input: details,
    p_key_hash: key,
    p_payload_hash: hash(JSON.stringify(details)),
    p_rate_hash: rateKey(address, process.env.HANDOFF_TOKEN_ENCRYPTION_KEY),
  });
  check(error);
  if (!["received", "invalid", "unavailable", "rate_limited"].includes(data))
    check(true);
  return data as "received" | "invalid" | "unavailable" | "rate_limited";
}
export async function schedulingDashboard(filter: string, page = 1) {
  await authorize();
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000)
    throw new SchedulingError("Invalid page.");
  let query = db().from("consultations").select(columns);
  if (filter === "upcoming")
    query = query
      .in("status", ["pending", "confirmed", "rescheduled"])
      .gte("starts_at", new Date().toISOString());
  else if (
    ["pending", "confirmed", "rescheduled", "completed", "canceled"].includes(
      filter,
    )
  )
    query = query.eq("status", filter);
  const { data, error } = await query
    .order("starts_at", { ascending: filter === "upcoming" })
    .order("id")
    .range((page - 1) * 100, page * 100 - 1);
  check(error);
  return (data ?? []) as Consultation[];
}
export async function consultationDetail(id: string) {
  await authorize();
  if (!/^[a-f0-9-]{36}$/i.test(id))
    throw new SchedulingError("Invalid consultation.");
  const [consultation, notifications, audit] = await Promise.all([
    db().from("consultations").select(columns).eq("id", id).maybeSingle(),
    db()
      .from("consultation_notifications")
      .select(
        "id,consultation_id,consultation_version,destination,status,attempt_count,provider_message_id,provider_checked_at,provider_event,updated_at",
      )
      .eq("consultation_id", id)
      .order("updated_at", { ascending: false })
      .limit(100),
    db()
      .from("consultation_audit")
      .select("id,action,details,created_at")
      .eq("consultation_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  check(consultation.error);
  check(notifications.error);
  check(audit.error);
  return {
    consultation: consultation.data as Consultation | null,
    notifications: (notifications.data ?? []) as Notification[],
    audit: audit.data ?? [],
  };
}
export async function saveSchedule(input: unknown) {
  const actor = await authorize();
  const settings = validateSchedule(input);
  const { version, ...values } = settings;
  const { data, error } = await db().rpc("save_consultation_settings", {
    p_settings: values,
    p_version: version,
    p_actor: actor.id,
  });
  check(error);
  if (data !== true)
    throw new SchedulingError(
      "Scheduling settings changed. Reload before saving again.",
    );
}
export async function findSchedulingClients(query: string) {
  await authorize();
  return searchHandoffClients(query);
}
export async function adminCreateBooking(
  input: unknown,
  source: { kind?: string; id?: string },
) {
  const actor = await authorize();
  const details = validateBooking(input);
  let referral: string | null = null,
    handoff: string | null = null;
  if (source.id && ["referral", "handoff"].includes(source.kind ?? "")) {
    if (!/^[a-f0-9-]{36}$/i.test(source.id))
      throw new SchedulingError("Select the client again.");
    const { data, error } = await db()
      .from(source.kind === "referral" ? "referrals" : "client_handoffs")
      .select("id")
      .eq("id", source.id)
      .maybeSingle();
    check(error);
    if (!data)
      throw new SchedulingError("The selected client no longer exists.");
    if (source.kind === "referral") referral = data.id;
    else handoff = data.id;
  }
  const { data, error } = await db().rpc("create_consultation_request", {
    p_input: details,
    p_key_hash: hash(`consultation-request-v1\n${details.requestKey}`),
    p_payload_hash: hash(JSON.stringify(details)),
    p_rate_hash: rateKey(actor.id, process.env.HANDOFF_TOKEN_ENCRYPTION_KEY),
    p_actor: actor.id,
    p_referral: referral,
    p_handoff: handoff,
  });
  check(error);
  if (data !== "received")
    throw new SchedulingError(
      data === "unavailable"
        ? "This time is no longer available. Choose another slot."
        : "The booking could not be saved. Check details and request limits.",
    );
}
export async function updateConsultation(input: {
  id: string;
  version: number;
  action: string;
  startsAt?: string;
  zoomUrl?: string;
}) {
  const actor = await authorize();
  if (
    !/^[a-f0-9-]{36}$/i.test(input.id) ||
    !Number.isSafeInteger(input.version) ||
    !["confirm", "reschedule", "cancel", "complete"].includes(input.action)
  )
    throw new SchedulingError("Invalid consultation change.");
  const zoom = validateZoomUrl(input.zoomUrl);
  if (
    input.action === "reschedule" &&
    (!input.startsAt || !Number.isFinite(Date.parse(input.startsAt)))
  )
    throw new SchedulingError("Choose an available rescheduled time.");
  const { data, error } = await db().rpc("update_consultation", {
    p_id: input.id,
    p_version: input.version,
    p_action: input.action,
    p_actor: actor.id,
    p_start:
      input.action === "reschedule"
        ? new Date(input.startsAt!).toISOString()
        : null,
    p_zoom: zoom,
  });
  check(error);
  if (data !== "saved")
    throw new SchedulingError(
      data === "delivery_pending"
        ? "A notification is sending. Wait before changing the meeting."
        : data === "unavailable"
          ? "This slot is no longer available under the scheduling rules."
          : "This consultation changed or the action is unavailable. Reload its details.",
    );
}
export function consultationEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
    validHandoffSender(
      process.env.CONSULTATION_FROM_EMAIL ??
        process.env.HANDOFF_FROM_EMAIL ??
        process.env.RESEND_FROM_EMAIL,
    ),
  );
}
export function zoomIntegrationStatus() {
  return {
    automatic: false,
    manual: true,
    message:
      "Automatic Zoom setup required. Use an existing real Zoom join link; this system does not create a meeting.",
  };
}
export async function sendConsultationConfirmation(
  id: string,
  version: number,
  recipient: string,
  confirmed: boolean,
) {
  const actor = await authorize();
  if (!confirmed)
    throw new SchedulingError(
      "Review and confirm the recipient before sending.",
    );
  const { consultation } = await consultationDetail(id);
  if (
    !consultation ||
    consultation.version !== version ||
    consultation.email !== recipient ||
    !["confirmed", "rescheduled", "canceled"].includes(consultation.status)
  )
    throw new SchedulingError(
      "Preview the current consultation and recipient again.",
    );
  const sender = validHandoffSender(
    process.env.CONSULTATION_FROM_EMAIL ??
      process.env.HANDOFF_FROM_EMAIL ??
      process.env.RESEND_FROM_EMAIL,
  );
  if (!sender || !process.env.RESEND_API_KEY?.trim())
    throw new SchedulingError(
      "Email setup required: configure a verified Steady Start consultation sender and existing Resend integration. Nothing was sent.",
    );
  const email = confirmationMessage(consultation);
  return dispatchConsultationNotification({
    claim: async () => {
      const { data, error } = await db().rpc(
        "claim_consultation_notification",
        {
          p_id: id,
          p_version: version,
          p_actor: actor.id,
          p_sender: sender,
          p_hash: hash(`${email.subject}\n${email.text}`),
        },
      );
      check(error);
      if (!data || typeof data.claimed !== "boolean") check(true);
      return data;
    },
    send: async (key) => {
      const response = await getResendClient().emails.send(
        {
          from: sender,
          to: [consultation.email],
          replyTo: businessEmail,
          subject: email.subject,
          text: email.text,
        },
        { idempotencyKey: key },
      );
      return response.data?.id
        ? { id: response.data.id }
        : {
            rejected: Boolean(
              response.error &&
              [
                "validation_error",
                "missing_required_field",
                "invalid_access",
                "restricted_api_key",
                "invalid_api_key",
                "rate_limit_exceeded",
              ].includes(response.error.name),
            ),
          };
    },
    complete: async (attemptId, claim, status, providerId) => {
      const result = await db().rpc("complete_consultation_notification", {
        p_id: attemptId,
        p_claim: claim,
        p_status: status,
        p_provider_id: providerId,
      });
      check(result.error);
    },
  });
}
export async function refreshConsultationNotification(id: string) {
  await authorize();
  if (!/^[a-f0-9-]{36}$/i.test(id))
    throw new SchedulingError("Invalid notification.");
  const { data, error } = await db()
    .from("consultation_notifications")
    .select("id,provider_message_id,provider_checked_at")
    .eq("id", id)
    .single();
  check(error);
  if (!data?.provider_message_id)
    throw new SchedulingError(
      "No provider-accepted notification is available to check.",
    );
  if (
    data.provider_checked_at &&
    Date.now() - Date.parse(data.provider_checked_at) < 30000
  )
    return;
  const result = await getResendClient().emails.get(data.provider_message_id);
  if (result.error || !result.data)
    throw new SchedulingError(
      "Provider status could not be confirmed. No notification was sent.",
    );
  const observed = await db().rpc("observe_consultation_notification", {
    p_id: id,
    p_event: result.data.last_event,
  });
  check(observed.error);
}
