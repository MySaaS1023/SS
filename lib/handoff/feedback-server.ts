import "server-only";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";
import { HandoffError } from "./core";
import { submitFeedback, type FeedbackOutcome } from "./feedback";

export type FeedbackEntry = {
  id: string;
  businessName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};
export async function listHandoffFeedback(page = 1): Promise<FeedbackEntry[]> {
  if (!(await getFullyAuthorizedAdminUser()))
    throw new HandoffError("unauthorized", "Administrator access is required.");
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000)
    throw new HandoffError("validation", "Invalid review page.");
  const { data, error } = await createAdminSupabaseClient()
    .from("client_handoff_feedback")
    .select("id,rating,comment,created_at,client_handoffs!inner(business_name)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * 100, page * 100 - 1);
  if (error)
    throw new HandoffError(
      "storage_unavailable",
      "Private feedback storage is unavailable. Check the approved migration and permissions.",
    );
  return (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    businessName: (r.client_handoffs as unknown as { business_name: string })
      .business_name,
  }));
}
export async function submitPublicHandoffFeedback(
  token: string,
  details: unknown,
  address: string,
): Promise<FeedbackOutcome> {
  return submitFeedback({
    token,
    details,
    address,
    key: process.env.HANDOFF_TOKEN_ENCRYPTION_KEY,
    consume: async (hash) => {
      const { data, error } = await createAdminSupabaseClient().rpc(
        "consume_client_handoff_feedback_rate",
        { p_key_hash: hash },
      );
      if (error) throw new Error("Feedback rate storage unavailable");
      return data === true;
    },
    save: async (hash, rating, comment) => {
      const { data, error } = await createAdminSupabaseClient().rpc(
        "submit_client_handoff_feedback",
        { p_token_hash: hash, p_rating: rating, p_comment: comment },
      );
      if (error || !["accepted", "duplicate", "unavailable"].includes(data))
        throw new Error("Feedback storage unavailable");
      return data as FeedbackOutcome;
    },
  });
}
