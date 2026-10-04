import { NotificationActions } from "@/components/referrals/notification-actions";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

export default async function PartnerNotificationsPage() {
  const context = (await getApprovedPartner())!;
  const admin = createAdminSupabaseClient();
  const { data: notifications } = await admin
    .from("partner_notifications")
    .select("id,type,title,message,is_read,created_at")
    .eq("partner_id", context.partner.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const unread = (notifications ?? []).filter((item) => !item.is_read).length;
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Partner Portal</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Notifications
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">{unread} unread</p>
        </div>
        {unread ? <NotificationActions /> : null}
      </div>
      <div className="mt-8 space-y-3">
        {(notifications ?? []).length ? (
          notifications!.map((notification) => (
            <article
              key={notification.id}
              className={`glass-card p-5 ${notification.is_read ? "opacity-70" : "border-[#3b82f6]/40"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    {notification.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {notification.message}
                  </p>
                  <p className="mt-3 text-xs text-white/50">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.is_read ? (
                  <NotificationActions id={notification.id} />
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="glass-card p-8 text-center text-[var(--muted)]">
            No referral activity yet.
          </div>
        )}
      </div>
    </div>
  );
}
