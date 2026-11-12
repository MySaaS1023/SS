import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import Link from "next/link";
import { BookingForm } from "@/components/scheduling/booking-form";
import { SchedulingSettingsForm } from "@/components/scheduling/admin-forms";
import { ConsultationShare } from "@/components/scheduling/consultation-share";
import { getHandoffOrigin } from "@/lib/handoff/core";
import {
  getScheduleSettings,
  schedulingDashboard,
  zoomIntegrationStatus,
  consultationEmailConfigured,
} from "@/lib/scheduling/server";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client Scheduling | Steady Start Admin",
  robots: { index: false, follow: false },
};
export default async function SchedulingPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; status?: string; page?: string }>;
}) {
  await requirePrivateAdministrator();
  const q = await searchParams,
    section = ["requests", "settings", "new"].includes(q.section ?? "")
      ? q.section
      : "consultations";
  const filter =
    section === "requests"
      ? "pending"
      : ["confirmed", "completed", "canceled", "rescheduled"].includes(
            q.status ?? "",
          )
        ? q.status!
        : "upcoming";
  const page = Number(q.page ?? 1);
  const safePage =
    Number.isSafeInteger(page) && page >= 1 && page <= 100000 ? page : 1;
  let settings: Awaited<ReturnType<typeof getScheduleSettings>> | null = null,
    rows: Awaited<ReturnType<typeof schedulingDashboard>> = [];
  let unavailable = false;
  try {
    settings = await getScheduleSettings();
    if (section === "consultations" || section === "requests")
      rows = await schedulingDashboard(filter, safePage);
  } catch {
    unavailable = true;
  }
  return (
    <section className="min-w-0">
      <p className="section-kicker">Plan the next step</p>
      <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
        Client Scheduling
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
        Manage launch consultations and booking requests. Customer information
        is private. Saving or previewing never sends a message automatically.
      </p>
      <nav
        aria-label="Scheduling sections"
        className="my-6 grid gap-2 sm:grid-cols-4"
      >
        {[
          ["consultations", "Consultations"],
          ["requests", "Booking Requests"],
          ["new", "New Booking"],
          ["settings", "Scheduling Settings"],
        ].map(([key, label]) => (
          <Link
            key={key}
            aria-current={section === key ? "page" : undefined}
            className={`flex min-h-11 min-w-0 items-center rounded-xl border px-4 py-3 text-sm ${section === key ? "border-blue-300/50 bg-blue-300/10 text-blue-100" : "border-white/15 text-slate-300"}`}
            href={`/admin/scheduling?section=${key}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <ConsultationShare
        bookingUrl={`${getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL)}/consultation`}
        emailConfigured={consultationEmailConfigured()}
      />
      {unavailable ? (
        <p
          role="alert"
          className="glass-card p-5 text-sm leading-7 text-amber-100"
        >
          Scheduling storage is not ready. Apply and verify the approved
          scheduling migration before enabling bookings. Existing website and
          customer workflows remain available.
        </p>
      ) : settings && section === "settings" ? (
        <div className="max-w-3xl">
          <SchedulingSettingsForm key={settings.version} settings={settings} />
          <div className="glass-card mt-5 p-5 text-sm leading-7 text-slate-300">
            <h2 className="text-lg font-semibold text-white">Integrations</h2>
            <p className="mt-2">{zoomIntegrationStatus().message}</p>
            <p className="mt-2">
              Consultation email:{" "}
              {consultationEmailConfigured()
                ? "Sender configured; verify delivery with an approved controlled test."
                : "Setup required — verified Steady Start sender not configured."}
            </p>
            <p className="mt-2">
              Automatic Zoom requires an authorized existing Zoom app/account,
              meeting permissions, secure server credentials, and
              lifecycle/idempotency verification before it can be enabled.
            </p>
          </div>
        </div>
      ) : settings && section === "new" ? (
        <div className="max-w-3xl">
          {settings.enabled ? (
            <BookingForm businessTimeZone={settings.timeZone} admin />
          ) : (
            <p className="glass-card p-5 text-slate-300">
              Configure and enable real availability in Scheduling Settings
              before creating a booking request.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              "upcoming",
              "confirmed",
              "completed",
              "canceled",
              "rescheduled",
            ].map((status) => (
              <Link
                key={status}
                className={`inline-flex min-h-11 items-center rounded-xl border px-3 text-sm capitalize ${filter === status ? "border-blue-300/40 text-blue-100" : "border-white/15 text-slate-300"}`}
                href={`/admin/scheduling?status=${status}`}
              >
                {status}
              </Link>
            ))}
          </div>
          <div className="glass-card min-w-0 p-5">
            <h2 className="text-xl font-semibold capitalize text-white">
              {filter}{" "}
              {filter === "pending" ? "booking requests" : "consultations"}
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Up to 100 records per page. Times below use the business time zone{" "}
              {settings?.timeZone}.
            </p>
            <ul className="mt-4 divide-y divide-white/10">
              {rows.map((c) => (
                <li
                  key={c.id}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0 break-words">
                    <Link
                      className="font-semibold text-blue-100 underline"
                      href={`/admin/scheduling/${c.id}`}
                    >
                      {c.business_name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-300">
                      {c.full_name} ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        timeZone: settings?.timeZone,
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(c.starts_at))}
                    </p>
                  </div>
                  <span className="text-xs capitalize text-slate-400">
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
            {!rows.length ? (
              <p className="mt-5 text-sm text-slate-300">
                No consultations in this view.
              </p>
            ) : null}
            <nav
              aria-label="Consultation pages"
              className="mt-4 flex flex-wrap gap-5 text-sm text-blue-200"
            >
              {safePage > 1 ? (
                <Link
                  className="inline-flex min-h-11 items-center underline"
                  href={`/admin/scheduling?section=${section}&status=${filter}&page=${safePage - 1}`}
                >
                  Previous page
                </Link>
              ) : null}
              {rows.length === 100 ? (
                <Link
                  className="inline-flex min-h-11 items-center underline"
                  href={`/admin/scheduling?section=${section}&status=${filter}&page=${safePage + 1}`}
                >
                  Next page
                </Link>
              ) : null}
            </nav>
          </div>
        </>
      )}
      <Link
        href="/consultation"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center text-sm text-blue-200 underline"
      >
        Open public consultation booking page
      </Link>
    </section>
  );
}
