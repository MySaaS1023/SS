import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  consultationDetail,
  getScheduleSettings,
  consultationEmailConfigured,
} from "@/lib/scheduling/server";
import { confirmationMessage } from "@/lib/scheduling/core";
import {
  ConsultationManagementForm,
  ConsultationNotificationForm,
  RefreshNotificationForm,
} from "@/components/scheduling/admin-forms";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Consultation details | Steady Start Admin",
  robots: { index: false, follow: false },
};
export default async function ConsultationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePrivateAdministrator();
  const { id } = await params;
  const {
    consultation: c,
    notifications,
    audit,
  } = await consultationDetail(id);
  if (!c) notFound();
  const settings = await getScheduleSettings();
  const email = confirmationMessage(c);
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone: c.customer_time_zone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(new Date(c.starts_at));
  return (
    <section className="min-w-0">
      <Link
        href="/admin/scheduling"
        className="inline-flex min-h-11 items-center text-sm text-blue-200 underline"
      >
        Back to Client Scheduling
      </Link>
      <h1 className="mt-3 break-words text-3xl font-semibold text-white">
        {c.business_name}
      </h1>
      <p className="mt-2 text-sm capitalize text-slate-300">
        Steady Start — Launch Consultation · {c.status}
      </p>
      <dl className="glass-card my-6 grid min-w-0 gap-4 break-words p-5 text-sm text-slate-200 sm:grid-cols-2">
        {[
          ["Client", c.full_name],
          ["Email", c.email],
          ["Phone", c.phone],
          ["Date and time", when],
          ["Client time zone", c.customer_time_zone],
          ["Purpose", c.purpose],
          ["Additional notes", c.notes || "Not provided"],
          [
            "Existing client association",
            c.source_referral_id
              ? "Referral customer"
              : c.source_handoff_id
                ? "Existing handoff client"
                : "Direct booking; no duplicate customer record created",
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-slate-400">{label}</dt>
            <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
        {c.zoom_join_url ? (
          <div>
            <dt className="text-slate-400">
              Verified-format manual Zoom join link
            </dt>
            <dd>
              <a
                className="inline-flex min-h-11 items-center text-blue-200 underline"
                href={c.zoom_join_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open actual meeting link
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
        <ConsultationManagementForm
          key={c.version}
          consultation={c}
          businessTimeZone={settings.timeZone}
        />
        {["confirmed", "rescheduled", "canceled"].includes(c.status) ? (
          <ConsultationNotificationForm
            key={`email-${c.version}`}
            id={c.id}
            version={c.version}
            recipient={c.email}
            subject={email.subject}
            text={email.text}
            configured={consultationEmailConfigured()}
          />
        ) : (
          <p className="glass-card p-5 text-sm leading-7 text-slate-300">
            Confirm or reschedule the consultation to review its confirmation
            email. No notification is sent on save.
          </p>
        )}
      </div>
      <section className="glass-card mt-6 p-5">
        <h2 className="text-xl font-semibold text-white">
          Notification history
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Accepted means the provider accepted the request. Delivered is shown
          only when the provider confirms delivery. Unknown outcomes need
          reconciliation before retries.
        </p>
        <ul className="mt-4 divide-y divide-white/10">
          {notifications.map((n) => (
            <li key={n.id} className="break-words py-4 text-sm text-slate-300">
              <p>
                {n.destination} · Version {n.consultation_version} ·{" "}
                <span className="font-semibold capitalize text-white">
                  {n.status === "accepted"
                    ? "Accepted by provider"
                    : n.status === "sending"
                      ? n.attempt_count > 1
                        ? "Retrying"
                        : "Pending"
                      : n.status}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Attempts: {n.attempt_count} · Updated{" "}
                {new Date(n.updated_at).toLocaleString("en-US", {
                  timeZone: settings.timeZone,
                })}
                {n.provider_event
                  ? ` · Provider event: ${n.provider_event}`
                  : ""}
              </p>
              {n.provider_message_id ? (
                <RefreshNotificationForm id={c.id} notificationId={n.id} />
              ) : null}
            </li>
          ))}
        </ul>
        {!notifications.length ? (
          <p className="mt-4 text-sm text-slate-400">
            No notification attempts for this consultation.
          </p>
        ) : null}
      </section>
      <details className="glass-card mt-6 p-5">
        <summary className="min-h-11 cursor-pointer text-lg font-semibold text-white">
          Consultation audit history
        </summary>
        <ol className="mt-3 space-y-3 text-sm text-slate-300">
          {audit.map((a) => (
            <li key={a.id}>
              {a.action} ·{" "}
              {new Date(a.created_at).toLocaleString("en-US", {
                timeZone: settings.timeZone,
              })}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
