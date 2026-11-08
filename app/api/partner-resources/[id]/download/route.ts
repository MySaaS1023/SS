import { ResourceError, safeDownloadName } from "@/lib/partner-resources/core";
import { downloadResource } from "@/lib/partner-resources/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = {
    "Cache-Control": "private, no-store",
    Vary: "Cookie",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Referrer-Policy": "no-referrer",
  };
  try {
    const { blob, filename } = await downloadResource(
      (await params).id,
      new URL(request.url).searchParams.get("version"),
    );
    return new Response(blob, {
      headers: {
        ...headers,
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeDownloadName(filename).replace(/[^\x20-\x7E]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(safeDownloadName(filename))}`,
      },
    });
  } catch (error) {
    return Response.json(
      { error: "Document unavailable." },
      {
        status:
          error instanceof ResourceError && error.code === "unauthorized"
            ? 403
            : 404,
        headers,
      },
    );
  }
}
