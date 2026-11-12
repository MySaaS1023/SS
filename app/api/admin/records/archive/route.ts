import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { administratorManagementEnabled } from "@/lib/admin-management/server";
import { archiveRequest } from "@/lib/referrals/archival";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

const reply = (body: unknown, init: ResponseInit = {}) =>
  NextResponse.json(body, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init.headers },
  });

export async function POST(request: Request) {
  if (!administratorManagementEnabled())
    return reply(
      { error: "Archival awaits owner-approved database setup." },
      { status: 503 },
    );
  const user = await getFullyAuthorizedAdminUser();
  if (!user)
    return reply({ error: "Administrator access required." }, { status: 403 });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return reply(
      { error: "Same-origin confirmation required." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") ?? 0) > 2048)
    return reply({ error: "Request too large." }, { status: 413 });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "JSON required." }, { status: 415 });
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    let text = "",
      size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return reply({ error: "Request too large." }, { status: 413 });
      }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return reply({ error: "Invalid request." }, { status: 400 });
  }
  const input = archiveRequest(body);
  if (!input)
    return reply(
      { error: "Confirm the exact record before archiving." },
      { status: 400 },
    );
  const { error } = await createAdminSupabaseClient().rpc(
    "archive_referral_record",
    {
      p_actor: user.id,
      p_kind: input.kind,
      p_record: input.recordId,
      p_confirmation: input.confirmation,
    },
  );
  if (error)
    return reply(
      {
        error:
          "Archive refused: record is ineligible, linked, already archived, or access/setup is unavailable. Reload before retrying.",
      },
      { status: 409 },
    );
  revalidatePath("/admin/referral-program", "layout");
  return reply({
    ok: true,
    message: "Archived and audited. Original records and history are retained.",
  });
}
