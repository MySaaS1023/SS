import { revalidatePath } from "next/cache";
import { getHandoffOrigin } from "@/lib/handoff/core";
import {
  MAX_RESOURCE_BYTES,
  ResourceError,
} from "@/lib/partner-resources/core";
import { resourceAdmin, saveResource } from "@/lib/partner-resources/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    await resourceAdmin();
    if (
      request.headers.get("origin") !==
      getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    )
      return reply(403, "Submit documents from this website.");
    if (
      !request.headers
        .get("content-type")
        ?.startsWith("multipart/form-data;") ||
      Number(request.headers.get("content-length")) > MAX_RESOURCE_BYTES + 65536
    )
      return reply(413, "Upload a supported document of 3 MB or less.");
    // Bound the entire streamed request even when Content-Length is omitted or forged.
    const reader = request.body?.getReader();
    if (!reader) return reply(400, "Choose a document.");
    let size = 0;
    const parts: Uint8Array[] = [];
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_RESOURCE_BYTES + 65536) {
        await reader.cancel();
        return reply(413, "Upload a supported document of 3 MB or less.");
      }
      parts.push(part.value);
    }
    const bounded = new Request(request.url, {
      method: "POST",
      headers: { "content-type": request.headers.get("content-type")! },
      body: Buffer.concat(parts.map((p) => Buffer.from(p))),
    });
    const id = await saveResource(await bounded.formData());
    revalidatePath("/admin/referral-program/resources");
    revalidatePath("/partner/resources");
    return Response.json(
      { ok: true, id },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  } catch (error) {
    return reply(
      error instanceof ResourceError
        ? error.code === "unauthorized"
          ? 403
          : error.code === "validation"
            ? 400
            : error.code === "conflict"
              ? 409
              : 503
        : 503,
      error instanceof ResourceError
        ? error.message
        : "Document management is temporarily unavailable.",
    );
  }
}
function reply(status: number, message: string) {
  return Response.json(
    { ok: false, message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
