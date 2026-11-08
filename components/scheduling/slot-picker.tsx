"use client";
import { useEffect, useState } from "react";
import { validTimeZone } from "@/lib/scheduling/time";
const input =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-white/20 bg-[#0f172a] px-3 py-3 text-white";
export function SlotPicker({
  businessTimeZone,
  timeZone,
  value,
  onChange,
}: {
  businessTimeZone: string;
  timeZone: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    fetch(`/api/scheduling?date=${encodeURIComponent(date)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok)
          throw new Error(data.message || "Times could not be loaded.");
        setSlots(data.slots ?? []);
        setStatus(
          (data.slots ?? []).length
            ? ""
            : "No available times on this date. Please choose another date.",
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setStatus(
            error instanceof Error
              ? error.message
              : "Times could not be loaded.",
          );
      });
    return () => controller.abort();
  }, [date]);
  const zone = validTimeZone(timeZone) ? timeZone : businessTimeZone;
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <label className="text-sm text-slate-200">
        Requested date{" "}
        <span className="mt-1 block text-xs text-slate-400">
          Calendar date in {businessTimeZone}
        </span>
        <input
          className={input}
          type="date"
          required
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlots([]);
            setStatus("Loading available times…");
            onChange("");
          }}
        />
      </label>
      <label className="text-sm text-slate-200">
        Available time{" "}
        <span className="mt-1 block text-xs text-slate-400">
          Displayed in {zone}
        </span>
        <select
          className={input}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Choose an available time</option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {new Intl.DateTimeFormat("en-US", {
                timeZone: zone,
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              }).format(new Date(slot))}
            </option>
          ))}
        </select>
      </label>
      {status ? (
        <p role="status" className="text-sm text-slate-300 sm:col-span-2">
          {status}
        </p>
      ) : null}
    </div>
  );
}
export { input as schedulingInputClass };
