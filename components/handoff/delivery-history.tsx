import { listHandoffEmailDeliveries } from "@/lib/handoff/delivery";
import { RefreshHandoffDeliveryForm } from "./admin-forms";
const names: Record<string, string> = {
  sending: "Pending",
  accepted: "Accepted by provider",
  delivered: "Delivered — provider confirmed",
  failed: "Failed",
  indeterminate: "Outcome unknown",
  delivery_failed: "Failed — provider reported",
  disabled: "Disabled",
};
export async function DeliveryHistory({ handoffId }: { handoffId?: string }) {
  let rows: Awaited<ReturnType<typeof listHandoffEmailDeliveries>>;
  try {
    rows = await listHandoffEmailDeliveries(handoffId);
  } catch {
    return (
      <section className="glass-card mt-8 p-6">
        <h2 className="text-xl font-semibold text-white">
          Email delivery history
        </h2>
        <p role="alert" className="mt-3 text-sm leading-7 text-amber-100">
          Email delivery history is unavailable. Check the delivery table
          migration and service-role permissions before sending. This is not an
          empty delivery history.
        </p>
      </section>
    );
  }
  return (
    <section className="glass-card mt-8 p-6">
      <h2 className="text-xl font-semibold text-white">
        Email delivery history
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Provider acceptance does not confirm inbox delivery. Status checks do
        not send messages.
      </p>
      {rows.length ? (
        <ol className="mt-5 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-white/10 p-4 text-sm leading-7 text-slate-300"
            >
              <p className="font-semibold text-white">
                {row.status === "sending" && row.attempt_count > 1
                  ? "Retrying"
                  : (names[row.status] ?? "Unknown")}
              </p>
              <p className="break-all">{row.destination}</p>
              <time dateTime={row.created_at}>
                {new Date(row.created_at).toISOString()}
              </time>
              <p>Attempts: {row.attempt_count}</p>
              {row.delivery_observed_at ? (
                <p>
                  Provider-confirmed delivery observed{" "}
                  {new Date(row.delivery_observed_at).toISOString()}.
                </p>
              ) : null}
              {row.last_error_code ? (
                <p>Diagnostic: {row.last_error_code}</p>
              ) : null}
              <ol className="mt-2 text-xs text-slate-400">
                {(row.attempt_history ?? []).map((e) => (
                  <li key={e.number}>
                    Attempt {e.number}: {e.status} ·{" "}
                    {new Date(e.startedAt).toISOString()}
                    {e.finishedAt
                      ? ` to ${new Date(e.finishedAt).toISOString()}`
                      : ""}
                  </li>
                ))}
              </ol>
              {row.provider_message_id ? (
                <RefreshHandoffDeliveryForm id={row.id} />
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-slate-300">
          No email delivery attempts recorded.
        </p>
      )}
    </section>
  );
}
