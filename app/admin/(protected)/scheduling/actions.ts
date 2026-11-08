"use server";
import { revalidatePath } from "next/cache";
import {
  adminCreateBooking,
  findSchedulingClients,
  refreshConsultationNotification,
  saveSchedule,
  sendConsultationConfirmation,
  updateConsultation,
} from "@/lib/scheduling/server";
import { SchedulingError } from "@/lib/scheduling/core";
export type SchedulingActionState = { ok: boolean; message: string };
const field = (form: FormData, name: string) => String(form.get(name) ?? "");
const failure = (error: unknown): SchedulingActionState => ({
  ok: false,
  message:
    error instanceof SchedulingError
      ? error.message
      : "This scheduling change could not be completed. Check its configuration and try again.",
});
function revalidate(id?: string) {
  revalidatePath("/admin/scheduling");
  revalidatePath("/consultation");
  if (id) revalidatePath(`/admin/scheduling/${id}`);
}
export async function createConsultationAction(
  _state: SchedulingActionState,
  form: FormData,
): Promise<SchedulingActionState> {
  try {
    await adminCreateBooking(Object.fromEntries(form), {
      kind: field(form, "sourceKind"),
      id: field(form, "sourceId"),
    });
    revalidate();
    return {
      ok: true,
      message:
        "Booking request saved. Open Booking Requests to review and confirm it. No notification was sent.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function lookupSchedulingClientsAction(query: string) {
  return findSchedulingClients(query);
}
export async function saveSchedulingSettingsAction(
  _state: SchedulingActionState,
  form: FormData,
): Promise<SchedulingActionState> {
  try {
    await saveSchedule({
      enabled: form.get("enabled") === "yes",
      timeZone: field(form, "timeZone"),
      days: form.getAll("days").map(Number),
      startTime: field(form, "startTime"),
      endTime: field(form, "endTime"),
      durationMinutes: Number(form.get("durationMinutes")),
      bufferMinutes: Number(form.get("bufferMinutes")),
      dailyLimit: Number(form.get("dailyLimit")),
      blockedDates: field(form, "blockedDates")
        .split(/[\s,]+/)
        .filter(Boolean),
      version: Number(form.get("version")),
    });
    revalidate();
    return {
      ok: true,
      message:
        "Scheduling settings saved. Existing reservations and customer records are preserved. Reload before making another settings change.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function updateConsultationAction(
  _state: SchedulingActionState,
  form: FormData,
): Promise<SchedulingActionState> {
  try {
    const id = field(form, "id");
    if (form.get("confirmChange") !== "yes")
      throw new SchedulingError("Confirm this meeting change before saving.");
    await updateConsultation({
      id,
      version: Number(form.get("version")),
      action: field(form, "action"),
      startsAt: field(form, "startsAt"),
      zoomUrl: field(form, "zoomUrl"),
    });
    revalidate(id);
    return {
      ok: true,
      message:
        "Consultation updated. Review its current email preview before choosing to send a notification. No email was sent automatically.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function sendConsultationEmailAction(
  _state: SchedulingActionState,
  form: FormData,
): Promise<SchedulingActionState> {
  try {
    const id = field(form, "id");
    const message = await sendConsultationConfirmation(
      id,
      Number(form.get("version")),
      field(form, "recipient"),
      form.get("confirmRecipient") === "yes" &&
        form.get("confirmSend") === "yes",
    );
    revalidate(id);
    return { ok: true, message };
  } catch (error) {
    return failure(error);
  }
}
export async function refreshConsultationEmailAction(
  _state: SchedulingActionState,
  form: FormData,
): Promise<SchedulingActionState> {
  try {
    await refreshConsultationNotification(field(form, "notificationId"));
    revalidate(field(form, "id"));
    return {
      ok: true,
      message: "Provider status checked. No notification was sent.",
    };
  } catch (error) {
    return failure(error);
  }
}
