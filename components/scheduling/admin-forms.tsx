"use client";
import { useActionState, useState } from "react";
import {
  saveSchedulingSettingsAction,
  updateConsultationAction,
  sendConsultationEmailAction,
  refreshConsultationEmailAction,
} from "@/app/admin/(protected)/scheduling/actions";
import type { ScheduleSettings } from "@/lib/scheduling/core";
import type { Consultation } from "@/lib/scheduling/server";
import { SlotPicker, schedulingInputClass as input } from "./slot-picker";
const initial = { ok: false, message: "" };
const button =
  "min-h-11 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50";
export function SchedulingSettingsForm({
  settings,
}: {
  settings: ScheduleSettings;
}) {
  const [state, action, pending] = useActionState(
    saveSchedulingSettingsAction,
    initial,
  );
  return (
    <form action={action} className="glass-card min-w-0 p-5 sm:p-7">
      <fieldset disabled={pending} className="min-w-0 space-y-5">
        <legend className="text-xl font-semibold text-white">
          Scheduling Settings
        </legend>
        <input type="hidden" name="version" value={settings.version} />
        <label className="flex min-h-11 items-center gap-3 text-sm text-white">
          <input
            type="checkbox"
            name="enabled"
            value="yes"
            defaultChecked={settings.enabled}
          />
          Enable public consultation requests
        </label>
        <p className="text-sm leading-7 text-slate-300">
          Set the business’s real availability before enabling bookings.
          Existing reserved times remain protected if these rules change.
        </p>
        <label className="block text-sm text-slate-200">
          Business time zone
          <input
            className={input}
            name="timeZone"
            required
            maxLength={80}
            defaultValue={settings.timeZone}
          />
        </label>
        <fieldset>
          <legend className="text-sm text-slate-200">Available days</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day, i) => (
              <label
                key={day}
                className="flex min-h-11 items-center gap-2 text-sm text-slate-300"
              >
                <input
                  type="checkbox"
                  name="days"
                  value={i}
                  defaultChecked={settings.days.includes(i)}
                />
                {day}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-200">
            Available from
            <input
              className={input}
              type="time"
              step={900}
              name="startTime"
              defaultValue={settings.startTime}
              required
            />
          </label>
          <label className="text-sm text-slate-200">
            Available until
            <input
              className={input}
              type="time"
              step={900}
              name="endTime"
              defaultValue={settings.endTime}
              required
            />
          </label>
          <label className="text-sm text-slate-200">
            Duration
            <select
              className={input}
              name="durationMinutes"
              defaultValue={settings.durationMinutes}
            >
              {[15, 30, 45, 60, 90, 120].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-200">
            Buffer minutes
            <input
              className={input}
              name="bufferMinutes"
              type="number"
              min={0}
              max={120}
              step={15}
              defaultValue={settings.bufferMinutes}
              required
            />
          </label>
          <label className="text-sm text-slate-200">
            Daily booking limit
            <input
              className={input}
              name="dailyLimit"
              type="number"
              min={1}
              max={30}
              defaultValue={settings.dailyLimit}
              required
            />
          </label>
        </div>
        <label className="block text-sm text-slate-200">
          Blocked dates
          <textarea
            className={input}
            name="blockedDates"
            rows={4}
            maxLength={5000}
            defaultValue={settings.blockedDates.join("\n")}
            placeholder="YYYY-MM-DD, one per line"
          />
        </label>
        <button className={button}>Save scheduling settings</button>
      </fieldset>
      {state.message ? (
        <p role="status" className="mt-4 text-sm leading-7 text-blue-100">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
export function ConsultationManagementForm({
  consultation: c,
  businessTimeZone,
}: {
  consultation: Consultation;
  businessTimeZone: string;
}) {
  const [state, action, pending] = useActionState(
    updateConsultationAction,
    initial,
  );
  const [change, setChange] = useState("confirm"),
    [start, setStart] = useState("");
  return (
    <form id="consultation-management" action={action} className="glass-card min-w-0 p-5">
      <fieldset
        disabled={pending || ["canceled", "completed"].includes(c.status)}
        className="min-w-0 space-y-4"
      >
        <legend className="text-xl font-semibold text-white">
          Manage consultation
        </legend>
        <input type="hidden" name="id" value={c.id} />
        <input type="hidden" name="version" value={c.version} />
        <input type="hidden" name="startsAt" value={start} />
        <label className="block text-sm text-slate-200">
          Action
          <select
            className={input}
            name="action"
            value={change}
            onChange={(e) => setChange(e.target.value)}
          >
            <option value="confirm">
              {["confirmed", "rescheduled"].includes(c.status)
                ? "Update meeting link"
                : "Confirm meeting"}
            </option>
            <option value="reschedule">Reschedule meeting</option>
            <option value="cancel">Cancel meeting</option>
            <option value="complete">Mark completed</option>
          </select>
        </label>
        {change === "reschedule" ? (
          <SlotPicker
            businessTimeZone={businessTimeZone}
            timeZone={c.customer_time_zone}
            value={start}
            onChange={setStart}
          />
        ) : null}
        {["confirm", "reschedule"].includes(change) ? (
          <label className="block text-sm text-slate-200">
            Real Zoom join link{" "}
            <span className="text-slate-400">(optional)</span>
            <input
              className={input}
              name="zoomUrl"
              type="url"
              maxLength={2048}
              defaultValue={c.zoom_join_url ?? ""}
            />
            <span className="mt-2 block text-xs leading-6 text-slate-400">
              Paste the actual meeting’s join URL from Zoom. Saving does not
              create, change or cancel a meeting in Zoom; update it there
              yourself when rescheduling or canceling.
              {["confirmed", "rescheduled"].includes(c.status)
                ? " Changing the link creates a new notification version. Review its updated email before sending. Saving the same link again does not create another version."
                : ""}
            </span>
          </label>
        ) : null}
        <label className="flex min-h-11 items-center gap-3 text-sm text-slate-200">
          <input type="checkbox" name="confirmChange" value="yes" required />I
          confirm this meeting change.
        </label>
        <button className={button} disabled={change === "reschedule" && !start}>
          {change === "confirm" &&
          ["confirmed", "rescheduled"].includes(c.status)
            ? "Save meeting link"
            : "Save meeting change"}
        </button>
      </fieldset>
      {state.message ? (
        <p role="status" className="mt-4 text-sm leading-7 text-blue-100">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
export function ConsultationNotificationForm({
  id,
  version,
  recipient,
  subject,
  text,
  configured,
}: {
  id: string;
  version: number;
  recipient: string;
  subject: string;
  text: string;
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(
    sendConsultationEmailAction,
    initial,
  );
  return (
    <form action={action} className="glass-card min-w-0 p-5">
      <h2 className="text-xl font-semibold text-white">
        Review confirmation email
      </h2>
      <dl className="mt-4 space-y-2 break-words text-sm text-slate-300">
        <div>
          <dt className="text-slate-400">Recipient</dt>
          <dd>{recipient}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Subject</dt>
          <dd>{subject}</dd>
        </div>
      </dl>
      <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-black/20 p-4 font-sans text-sm leading-7 text-slate-300">
        {text}
      </pre>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <input type="hidden" name="recipient" value={recipient} />
      <fieldset disabled={!configured || pending} className="mt-4 space-y-3">
        <label className="flex min-h-11 items-center gap-3 text-sm text-slate-200">
          <input type="checkbox" required name="confirmRecipient" value="yes" />
          I reviewed the recipient, date, time and meeting link.
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm text-slate-200">
          <input type="checkbox" required name="confirmSend" value="yes" />
          Send this notification now.
        </label>
        <button className={button}>
          {pending ? "Sending…" : "Send consultation email"}
        </button>
      </fieldset>
      {!configured ? (
        <p className="mt-3 text-sm leading-7 text-amber-100">
          Email setup required. A verified Steady Start sender must be
          configured before sending. Saving and confirming a meeting never sends
          automatically.
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="mt-4 text-sm leading-7 text-blue-100">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
export function RefreshNotificationForm({
  notificationId,
  id,
}: {
  notificationId: string;
  id: string;
}) {
  const [state, action, pending] = useActionState(
    refreshConsultationEmailAction,
    initial,
  );
  return (
    <form action={action}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <input type="hidden" name="id" value={id} />
      <button
        className="min-h-11 text-sm text-blue-200 underline disabled:opacity-50"
        disabled={pending}
      >
        Check provider status
      </button>
      {state.message ? (
        <p role="status" className="text-sm text-slate-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
