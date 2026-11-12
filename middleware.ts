import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const portal = pathname === "/admin" || pathname.startsWith("/admin/")
    ? "admin" : pathname === "/partner" || pathname.startsWith("/partner/")
      ? "partner" : null;
  const publicAuthScreen = portal && ["login", "forgot-password", "reset-password"]
    .some(screen => pathname === `/${portal}/${screen}`);
  const protectedPage = Boolean(portal && !publicAuthScreen);
  function denyAnonymous() {
    const destination = request.nextUrl.clone();
    destination.pathname = `/${portal}/login`;
    destination.search = "";
    const denied = NextResponse.redirect(destination);
    for (const cookie of response.cookies.getAll()) denied.cookies.set(cookie);
    denied.headers.set("Cache-Control", "private, no-store, max-age=0");
    denied.headers.set("Referrer-Policy", "no-referrer");
    return denied;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return protectedPage ? denyAnonymous() : response;

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
  try {
    const { data, error } = await supabase.auth.getUser();
    // Stop unauthenticated requests before any child Server Component can run.
    // Verified roles and forced-password checks are also enforced in the DAL.
    if (protectedPage && (error || !data.user)) return denyAnonymous();
  } catch {
    if (protectedPage) return denyAnonymous();
  }
  return response;
}

export const config = {
  matcher: ["/partner/:path*", "/admin/:path*", "/auth/callback"],
};
