import "server-only";
import { randomUUID } from "node:crypto";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
  getFullyAuthorizedPartner,
} from "@/lib/supabase/server";
import {
  canPartnerAccess,
  MAX_RESOURCE_BYTES,
  RESOURCE_BUCKET,
  ResourceError,
  uuid,
  validateMetadata,
  validateResourceFile,
  validateResourceChange,
  type PartnerResource,
  type ResourceVersion,
} from "./core";

export async function resourceAdmin() {
  const user = await getFullyAuthorizedAdminUser();
  if (!user)
    throw new ResourceError(
      "unauthorized",
      "Administrator access is required.",
    );
  return user;
}
export async function adminResources() {
  await resourceAdmin();
  const db = createAdminSupabaseClient();
  const [resources, versions, acknowledgments, partners] = await Promise.all([
    db
      .from("partner_resources")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200),
    db
      .from("partner_resource_versions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000),
    db
      .from("partner_resource_acknowledgments")
      .select("version_id,partner_id,acknowledged_at")
      .order("acknowledged_at", { ascending: false })
      .limit(1000),
    db
      .from("referral_partners")
      .select("id,first_name,last_name,email,status")
      .order("first_name")
      .limit(1000),
  ]);
  if (
    resources.error ||
    versions.error ||
    acknowledgments.error ||
    partners.error
  )
    throw new ResourceError(
      "unavailable",
      "Partner resource storage is unavailable. Verify the approved migration and private bucket.",
    );
  return {
    resources: resources.data as PartnerResource[],
    versions: versions.data as ResourceVersion[],
    acknowledgments: acknowledgments.data,
    partners: partners.data,
  };
}
export async function partnerResources() {
  const context = await getFullyAuthorizedPartner();
  if (!context)
    throw new ResourceError(
      "unauthorized",
      "Approved partner access is required.",
    );
  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("partner_resources")
    .select("*")
    .eq("published", true)
    .or(`target_partner_id.is.null,target_partner_id.eq.${context.partner.id}`)
    .order("category")
    .order("title")
    .limit(200);
  if (error)
    throw new ResourceError(
      "unavailable",
      "Partner resources are temporarily unavailable.",
    );
  const visible = ((data ?? []) as PartnerResource[]).filter((r) =>
    canPartnerAccess(r, context.partner),
  );
  const versionIds = visible.map((r) => r.current_version_id);
  if (!versionIds.length)
    return {
      resources: visible,
      versions: [] as ResourceVersion[],
      acknowledgments: [] as { version_id: string }[],
    };
  const [versions, acknowledgments] = await Promise.all([
    db
      .from("partner_resource_versions")
      .select(
        "id,resource_id,version_number,original_filename,mime_type,byte_size,sha256,release_notes,created_at",
      )
      .in("id", versionIds),
    db
      .from("partner_resource_acknowledgments")
      .select("version_id")
      .eq("partner_id", context.partner.id)
      .in("version_id", versionIds),
  ]);
  if (versions.error || acknowledgments.error)
    throw new ResourceError(
      "unavailable",
      "Partner resources are temporarily unavailable.",
    );
  return {
    resources: visible,
    versions: versions.data as ResourceVersion[],
    acknowledgments: acknowledgments.data,
  };
}
export async function saveResource(form: FormData) {
  const actor = await resourceAdmin();
  const existingId = form.get("resourceId"),
    expected = Number(form.get("revision") ?? 0);
  if (existingId && !uuid(existingId))
    throw new ResourceError("validation", "Invalid document identifier.");
  if (
    !Number.isSafeInteger(expected) ||
    expected < 0 ||
    Boolean(existingId) !== expected > 0
  )
    throw new ResourceError(
      "validation",
      "Reload this document before saving.",
    );
  const metadata = validateMetadata({
    title: form.get("title"),
    description: form.get("description"),
    category: form.get("category"),
    classification: form.get("classification"),
    targetPartnerId: form.get("targetPartnerId"),
    published: form.get("published") === "on",
    acknowledgmentRequired: form.get("acknowledgmentRequired") === "on",
  });
  const resourceId =
    typeof existingId === "string" && existingId ? existingId : randomUUID();
  const releaseNotes = String(form.get("releaseNotes") ?? "").trim();
  if (releaseNotes.length > 1000)
    throw new ResourceError(
      "validation",
      "Version notes must be 1,000 characters or fewer.",
    );
  const file = form.get("file"),
    db = createAdminSupabaseClient();
  if (existingId) {
    const { data: existing, error } = await db
      .from("partner_resources")
      .select("classification,target_partner_id,revision")
      .eq("id", resourceId)
      .maybeSingle();
    if (error || !existing || existing.revision !== expected)
      throw new ResourceError(
        "conflict",
        "This document changed. Reload before saving.",
      );
    validateResourceChange(existing as PartnerResource, metadata);
  }
  let upload: {
    id: string;
    path: string;
    filename: string;
    mime: string;
    byteSize: number;
    sha256: string;
    releaseNotes: string;
  } | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_RESOURCE_BYTES)
      throw new ResourceError(
        "validation",
        "Choose a document of 3 MB or less.",
      );
    const bytes = Buffer.from(await file.arrayBuffer()),
      checked = validateResourceFile(file.name, bytes),
      versionId = randomUUID();
    const objectPath = `${resourceId}/${versionId}.${checked.extension}`;
    const { error } = await db.storage
      .from(RESOURCE_BUCKET)
      .upload(objectPath, bytes, {
        contentType: checked.mime,
        upsert: false,
        cacheControl: "0",
      });
    if (error)
      throw new ResourceError(
        "unavailable",
        "Private document upload failed. Verify the private resource bucket and server permissions.",
      );
    upload = {
      id: versionId,
      path: objectPath,
      filename: checked.filename,
      mime: checked.mime,
      byteSize: checked.byteSize,
      sha256: checked.sha256,
      releaseNotes,
    };
  } else if (!existingId)
    throw new ResourceError("validation", "Choose the document to upload.");
  const { error } = await db.rpc("save_partner_resource", {
    p_id: resourceId,
    p_expected_revision: expected,
    p_actor: actor.id,
    p_metadata: metadata,
    p_file: upload,
  });
  if (error) {
    // Only this request's newly generated immutable object can be removed on rollback.
    if (upload) await db.storage.from(RESOURCE_BUCKET).remove([upload.path]);
    throw new ResourceError(
      error.code === "40001" ? "conflict" : "unavailable",
      error.code === "40001"
        ? "This document changed. Reload before saving."
        : "Document could not be saved. No existing document was replaced.",
    );
  }
  return resourceId;
}
export async function downloadResource(
  resourceId: string,
  requestedVersion: string | null,
) {
  if (
    !uuid(resourceId) ||
    (requestedVersion !== null && !uuid(requestedVersion))
  )
    throw new ResourceError("unavailable", "Document unavailable.");
  const admin = await getFullyAuthorizedAdminUser();
  const partner = admin ? null : await getFullyAuthorizedPartner();
  if (!admin && !partner)
    throw new ResourceError("unauthorized", "Approved access is required.");
  const db = createAdminSupabaseClient();
  const { data: row, error } = await db
    .from("partner_resources")
    .select("*")
    .eq("id", resourceId)
    .maybeSingle();
  const resource = row as PartnerResource | null;
  if (
    error ||
    !resource ||
    (!admin && !canPartnerAccess(resource, partner?.partner ?? null))
  )
    throw new ResourceError("unavailable", "Document unavailable.");
  const versionId = requestedVersion ?? resource.current_version_id;
  if (!admin && versionId !== resource.current_version_id)
    throw new ResourceError("unavailable", "Document unavailable.");
  const { data: versionRow, error: versionError } = await db
    .from("partner_resource_versions")
    .select("*")
    .eq("id", versionId)
    .eq("resource_id", resource.id)
    .maybeSingle();
  if (versionError || !versionRow)
    throw new ResourceError("unavailable", "Document unavailable.");
  const version = versionRow as ResourceVersion;
  const { data: blob, error: storageError } = await db.storage
    .from(RESOURCE_BUCKET)
    .download(version.file_path);
  if (storageError || !blob)
    throw new ResourceError(
      "unavailable",
      "Document download is temporarily unavailable.",
    );
  // Revalidate publication and partner approval immediately before returning file bytes.
  if (!admin) {
    const currentContext = await getFullyAuthorizedPartner();
    const { data: current } = await db
      .from("partner_resources")
      .select("*")
      .eq("id", resourceId)
      .maybeSingle();
    if (
      !currentContext ||
      !current ||
      !canPartnerAccess(current as PartnerResource, currentContext.partner) ||
      current.current_version_id !== versionId
    )
      throw new ResourceError("unavailable", "Document unavailable.");
  }
  return { blob, filename: version.original_filename };
}
export async function acknowledgeResource(versionId: unknown) {
  const context = await getFullyAuthorizedPartner();
  if (!context)
    throw new ResourceError(
      "unauthorized",
      "Approved partner access is required.",
    );
  if (!uuid(versionId))
    throw new ResourceError("validation", "Invalid document version.");
  const { error } = await createAdminSupabaseClient().rpc(
    "acknowledge_partner_resource",
    {
      p_version_id: versionId,
      p_partner_id: context.partner.id,
      p_user_id: context.user.id,
    },
  );
  if (error)
    throw new ResourceError(
      "unavailable",
      "This version cannot be acknowledged. Reload the resources page.",
    );
}
