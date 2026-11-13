import Link from "next/link";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/server";
import { requirePartnerRecordAccess } from "@/lib/referrals/partner-record-access";

const links = [
  ["/partner/referrals", "My Referrals"],
  ["/partner/referrals/new", "Submit a Referral"],
  ["/partner#my-referral-link", "My Referral Link"],
  ["/partner/commissions", "My Commissions"],
  ["/partner/resources", "Partner Resources"],
  ["/partner/settings", "Settings"],
];

export async function PartnerNav() {
  const context = await requirePartnerRecordAccess();
  const admin = createAdminSupabaseClient();
  const { count: unreadCount } = await admin
        .from("partner_notifications")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", context.partner.id)
        .eq("is_read", false);
  return (
    <div className="partner-toolbar">
      <nav aria-label="Partner navigation" className="partner-navigation">
        {links.map(([href, label]) =>
          href === "/partner/resources" ? (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              {label}
            </Link>
          ),
        )}
        <Link
          href="/partner/notifications"
          className="partner-notification-link"
        >
          Notifications{unreadCount ? ` (${unreadCount} unread)` : ""}
        </Link>
      </nav>
      <form action="/api/partner/auth/logout" method="post">
        <button className="whitespace-nowrap text-sm text-[var(--foreground)] hover:text-[var(--foreground)]">
          Sign out
        </button>
      </form>
    </div>
  );
}
