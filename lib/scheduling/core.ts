import { createHash, createHmac } from "node:crypto";
import { validTimeZone, validDate } from "./time";
export { validTimeZone, validDate, dateInZone } from "./time";

export const CONSULTATION_TITLE = "Steady Start — Launch Consultation";
export class SchedulingError extends Error {
  constructor(
    message: string,
    public kind: "validation" | "unavailable" | "unauthorized" = "validation",
  ) {
    super(message);
  }
}
export type ScheduleSettings = {
  enabled: boolean;
  timeZone: string;
  days: number[];
  startTime: string;
  endTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  blockedDates: string[];
  dailyLimit: number;
  version: number;
};
export const defaultSchedule: ScheduleSettings = {
  enabled: false,
  timeZone: "America/Phoenix",
  days: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
  durationMinutes: 30,
  bufferMinutes: 15,
  blockedDates: [],
  dailyLimit: 6,
  version: 1,
};
const fail = (message: string): never => {
  throw new SchedulingError(message);
};
function text(value: unknown, label: string, max: number, required = true) {
  const result =
    typeof value === "string"
      ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim()
      : "";
  if ((required && !result) || result.length > max)
    return fail(`Enter a valid ${label}.`);
  return result;
}
export function validateSchedule(value: unknown): ScheduleSettings {
  if (!value || typeof value !== "object")
    return fail("Enter scheduling settings.");
  const v = value as Record<string, unknown>;
  if (!validTimeZone(v.timeZone)) return fail("Choose a valid IANA time zone.");
  const days = Array.isArray(v.days)
    ? [...new Set(v.days.map(Number))].sort()
    : [];
  const times = [v.startTime, v.endTime];
  if (
    !days.length ||
    days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) ||
    times.some(
      (t) =>
        typeof t !== "string" || !/^([01]\d|2[0-3]):(00|15|30|45)$/.test(t),
    )
  )
    return fail("Choose available days and quarter-hour times.");
  if (String(v.startTime) >= String(v.endTime))
    return fail("Closing time must follow opening time.");
  const duration = Number(v.durationMinutes),
    buffer = Number(v.bufferMinutes),
    limit = Number(v.dailyLimit),
    version = Number(v.version);
  if (
    ![15, 30, 45, 60, 90, 120].includes(duration) ||
    !Number.isInteger(buffer) ||
    buffer < 0 ||
    buffer > 120 ||
    buffer % 15 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 30 ||
    !Number.isSafeInteger(version) ||
    version < 1
  )
    return fail("Check duration, buffer, daily limit and settings version.");
  const blocked = Array.isArray(v.blockedDates)
    ? [...new Set(v.blockedDates)]
    : [];
  if (blocked.length > 366 || blocked.some((d) => !validDate(d)))
    return fail("Enter valid blocked dates.");
  return {
    enabled: v.enabled === true,
    timeZone: v.timeZone,
    days,
    startTime: String(v.startTime),
    endTime: String(v.endTime),
    durationMinutes: duration,
    bufferMinutes: buffer,
    dailyLimit: limit,
    blockedDates: blocked as string[],
    version,
  };
}
export type BookingInput = {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: string;
  startsAt: string;
  timeZone: string;
  notes: string;
  requestKey: string;
};
export function validateBooking(value: unknown): BookingInput {
  if (!value || typeof value !== "object")
    return fail("Enter consultation details.");
  const v = value as Record<string, unknown>;
  const email = text(v.email, "email address", 254).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
    return fail("Enter a valid email address.");
  const phone = text(v.phone, "phone number", 40),
    digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15)
    return fail("Enter a valid phone number.");
  if (!validTimeZone(v.timeZone)) return fail("Choose a valid time zone.");
  const start = text(v.startsAt, "available date and time", 40);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?Z$/.test(start) ||
    Number.isNaN(Date.parse(start))
  )
    return fail("Choose an available consultation time.");
  const requestKey = text(v.requestKey, "request identifier", 36);
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      requestKey,
    )
  )
    return fail("Refresh this form before submitting.");
  return {
    businessName: text(v.businessName, "business name", 120),
    fullName: text(v.fullName, "full name", 160),
    email,
    phone,
    purpose: text(v.purpose, "consultation purpose", 500),
    startsAt: new Date(start).toISOString(),
    timeZone: v.timeZone,
    notes: text(v.notes, "additional notes", 1500, false),
    requestKey,
  };
}
export function validateZoomUrl(value: unknown) {
  if (value === "" || value == null) return null;
  if (typeof value !== "string" || value.length > 2048)
    return fail("Enter a valid Zoom meeting join URL.");
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !/(^|\.)zoom\.(us|com)$/.test(url.hostname) ||
      !/^\/(j\/\d{9,11}|my\/[A-Za-z0-9._-]+)$/.test(url.pathname) ||
      url.hash
    )
      throw new Error();
    return url.toString();
  } catch {
    return fail(
      "Use a real HTTPS Zoom meeting join URL from zoom.us or zoom.com.",
    );
  }
}
export function rateKey(address: string, secret: string | undefined) {
  if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret))
    throw new SchedulingError(
      "Consultation booking is temporarily unavailable.",
      "unavailable",
    );
  return createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`consultation-rate-v1\n${address.slice(0, 128)}`)
    .digest("hex");
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function confirmationMessage(row: {
  full_name: string;
  business_name: string;
  starts_at: string;
  customer_time_zone: string;
  purpose: string;
  zoom_join_url: string | null;
  status: string;
}) {
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone: row.customer_time_zone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(new Date(row.starts_at));
  const canceled = row.status === "canceled";
  return {
    subject: canceled
      ? "Your Steady Start Launch Consultation Has Been Canceled"
      : "Your Steady Start Launch Consultation Is Confirmed",
    text: `Hello ${row.full_name},\n\n${canceled ? "Your consultation has been canceled." : "Your Steady Start — Launch Consultation is confirmed."}\n\nBusiness: ${row.business_name}\nDate and time: ${when}\nTime zone: ${row.customer_time_zone}\nPurpose: ${row.purpose}${!canceled && row.zoom_join_url ? `\nZoom meeting: ${validateZoomUrl(row.zoom_join_url)}` : ""}\n\n${canceled ? "Contact us if you would like to arrange a new time." : "We look forward to discussing your business goals and next steps."}\nSteady Start LLC\nsupport@steadystartco.com`,
  };
}
