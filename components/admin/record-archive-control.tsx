import { administratorManagementEnabled } from "@/lib/admin-management/server";
import type { ArchiveKind } from "@/lib/referrals/archival";
import { RecordArchiveForm } from "./record-archive-form";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

export async function RecordArchiveControl(props: {
  kind: ArchiveKind;
  recordId: string;
  label: string;
}) {
  if (!administratorManagementEnabled()) return null;
  if (!(await getFullyAuthorizedAdminUser())) return null;
  const { data, error } = await createAdminSupabaseClient()
    .from("referral_record_archives")
    .select("archived_at")
    .eq("kind", props.kind)
    .eq("record_id", props.recordId)
    .maybeSingle();
  if (error)
    return (
      <p role="status">
        Archive controls unavailable: database verification required.
      </p>
    );
  if (data)
    return (
      <p role="status">
        Archived {new Date(data.archived_at).toLocaleDateString()}. Original
        record retained in history.
      </p>
    );
  return <RecordArchiveForm {...props} />;
}
