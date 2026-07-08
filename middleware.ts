import { NextResponse, type NextRequest } from "next/server";

const protectedAppRoutes = ["/dashboard"];

function isProtectedAppRoute(pathname: string) {
  return protectedAppRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedAppRoute(pathname)) {
    return NextResponse.next();
  }

  // Temporary auth boundary for Phase 1. Replace this with Supabase session
  // validation before enabling the authenticated application in production.
  const hasSession = Boolean(request.cookies.get("steady_start_session")?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
