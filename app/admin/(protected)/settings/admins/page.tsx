import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { loadAdministratorManagement } from "@/lib/admin-management/server";
import { invitationsEnabled } from "@/lib/admin-management/invitations-core";
import { AdministratorRecords } from "@/components/admin/administrator-records";
import { AdministratorInvitationForm } from "@/components/admin/administrator-invitation-form";

export default async function AdministratorManagementPage() {
  await requirePrivateAdministrator();
  const data = await loadAdministratorManagement();
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Manage Administrators</h1>
        <p className="mt-2 text-sm">
          Super Admin access management · existing Supabase authentication
        </p>
      </div>
      {!data ? (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 p-5"
        >
          <h2 className="font-semibold">Awaiting approved security setup</h2>
          <p className="mt-2 text-sm">
            Administrator management is unavailable until the owner approves the
            database migration, owner identity bootstrap, and access activation.
            No administrator privileges have been changed.
          </p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Administrators</h2>
            <AdministratorRecords members={data.members} />
            <p className="mt-3 text-sm">
              Role and access changes require explicit owner approval and a
              confirmed, audited server operation.
            </p>
          </section>
          <AdministratorInvitationForm
            enabled={invitationsEnabled()}
            invitations={data.invitations}
          />
          <section>
            <h2 className="font-semibold">Administrator audit history</h2>
            {data.audit.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {data.audit.map((event) => (
                  <li key={event.id}>
                    {event.action} · {event.created_at}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm">No administrator changes recorded.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
