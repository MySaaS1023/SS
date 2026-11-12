import Link from "next/link";
import { AdministratorInvitationAccept } from "@/components/admin/administrator-invitation-accept";
import { canAcceptAdministratorInvitation } from "@/lib/admin-management/invitations-server";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administrator invitation | Steady Start",
  robots: { index: false, follow: false },
};
export default async function AcceptAdministratorInvitationPage() {
  let available = false;
  try {
    available = await canAcceptAdministratorInvitation();
  } catch {
    /* Generic unavailable state. */
  }
  return (
    <section className="mx-auto w-[92vw] max-w-xl py-12">
      <h1 className="mb-5 text-2xl font-semibold">Administrator invitation</h1>
      {available ? (
        <AdministratorInvitationAccept />
      ) : (
        <div>
          <p>
            This invitation is unavailable, expired, revoked or already used.
            Contact the owner for assistance.
          </p>
          <Link
            href="/admin/login"
            className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Admin sign in
          </Link>
        </div>
      )}
    </section>
  );
}
