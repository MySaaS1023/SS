import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAlwaysAvailablePath,
  offlineApiResponse,
  offlinePageHtml,
  WEBSITE_STATUS_KEY,
} from "@/lib/site-status/core";

async function isWebsiteOffline() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const response = await fetch(
      `${url}/rest/v1/site_settings?key=eq.${WEBSITE_STATUS_KEY}&select=website_online`,
      {
        headers: { apikey: key, authorization: `Bearer ${key}` },
        cache: "no-store",
      },
    );
    if (!response.ok) return false;
    const rows = (await response.json()) as { website_online?: boolean }[];
    return rows[0]?.website_online === false;
  } catch {
    // Fail open if status storage is unavailable so authentication and existing
    // production functionality are not accidentally taken down.
    return false;
  }
}

function temporarilyUnavailable(request: NextRequest) {
  const headers = {
    "Cache-Control": "private, no-store, max-age=0",
    "Retry-After": "3600",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-Content-Type-Options": "nosniff",
  };
  if (request.nextUrl.pathname.startsWith("/api/"))
    return NextResponse.json(offlineApiResponse(), { status: 503, headers });
  return new NextResponse(
    request.method === "HEAD" ? null : offlinePageHtml(),
    {
      status: 503,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export async function middleware(request: NextRequest) {
  const protectedPath = isAlwaysAvailablePath(request.nextUrl.pathname);
  if (!protectedPath && (await isWebsiteOffline()))
    return temporarilyUnavailable(request);

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|og-image.png).*)",
  ],
};
