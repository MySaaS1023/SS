import Link from "next/link";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

const links = [
  ["/partner", "Overview"],
  ["/partner/referrals", "My Referrals"],
  ["/partner/referrals/new", "Submit a Referral"],
  ["/partner/commissions", "Commissions"],
  ["/partner/notifications", "Notifications"],
  ["/partner/settings", "Settings"],
];

export async function PartnerNav() {
  const context = await getApprovedPartner();
  const admin = createAdminSupabaseClient();
  const { count: unreadCount } = context
    ? await admin
        .from("partner_notifications")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", context.partner.id)
        .eq("is_read", false)
    : { count: 0 };
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex gap-2 overflow-x-auto">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            {label}
            {href === "/partner/notifications" && unreadCount ? (
              <span className="ml-2 rounded-full bg-[#3b82f6] px-2 py-0.5 text-xs text-white">
                🔔 {unreadCount}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <form action="/api/partner/auth/logout" method="post">
        <button className="whitespace-nowrap text-sm text-white/60 hover:text-white">
          Sign out
        </button>
      </form>
    </div>
  );
}
