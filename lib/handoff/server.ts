import "server-only";

import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";
import {
  createHandoffService,
  HandoffError,
  type HandoffRow,
  type HandoffStore,
} from "./core";

const columns =
  "id,business_name,website_url,message,status,created_at,created_by,token_hash,encrypted_token";
function mapRow(row: Record<string, unknown>): HandoffRow {
  return {
    id: row.id as string,
    businessName: row.business_name as string,
    websiteUrl: row.website_url as string,
    message: row.message as string | null,
    status: row.status as HandoffRow["status"],
    createdAt: row.created_at as string,
    createdBy: row.created_by as string,
    tokenHash: row.token_hash as string,
    encryptedToken: row.encrypted_token as string,
  };
}
function database() {
  return createAdminSupabaseClient();
}
const store: HandoffStore = {
  async insert(row) {
    const { data, error } = await database()
      .from("client_handoffs")
      .insert({
        business_name: row.businessName,
        website_url: row.websiteUrl,
        message: row.message,
        token_hash: row.tokenHash,
        encrypted_token: row.encryptedToken,
        created_by: row.createdBy,
      })
      .select(columns)
      .single();
    if (error || !data) throw new Error("Storage unavailable");
    return mapRow(data);
  },
  async list(page = 1) {
    const { data, error } = await database()
      .from("client_handoffs")
      .select(columns)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range((page - 1) * 100, page * 100 - 1);
    if (error) throw new Error("Storage unavailable");
    return (data || []).map(mapRow);
  },
  async findById(id) {
    const { data, error } = await database()
      .from("client_handoffs")
      .select(columns)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error("Storage unavailable");
    return data ? mapRow(data) : null;
  },
  async findActiveByHash(hash) {
    const { data, error } = await database()
      .from("client_handoffs")
      .select(columns)
      .eq("token_hash", hash)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error("Storage unavailable");
    return data ? mapRow(data) : null;
  },
  async deactivate(id, actorId) {
    const { error } = await database()
      .from("client_handoffs")
      .update({
        status: "inactive",
        deactivated_at: new Date().toISOString(),
        deactivated_by: actorId,
      })
      .eq("id", id)
      .eq("status", "active");
    if (error) throw new Error("Storage unavailable");
  },
};
function service() {
  return createHandoffService({
    store,
    authorize: async () => {
      try {
        return await getFullyAuthorizedAdminUser();
      } catch {
        throw new HandoffError(
          "configuration",
          "Administrator authentication is unavailable. Check the Supabase configuration.",
        );
      }
    },
    encryptionKey: process.env.HANDOFF_TOKEN_ENCRYPTION_KEY,
    origin: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
export function getHandoffSetupStatus(): string[] {
  const missing = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ].filter((name) => !process.env[name]);
  if (!/^[a-fA-F0-9]{64}$/.test(process.env.HANDOFF_TOKEN_ENCRYPTION_KEY || ""))
    missing.push("HANDOFF_TOKEN_ENCRYPTION_KEY");
  return missing;
}
export async function listHandoffs(page = 1) {
  return service().list(page);
}
export async function createHandoff(input: unknown) {
  return service().create(input);
}
export async function deactivateHandoff(id: string) {
  return service().deactivate(id);
}
export async function getHandoffPreview(id: string) {
  return service().preview(id);
}
export async function resolvePublicHandoff(token: string) {
  return service().resolve(token);
}
