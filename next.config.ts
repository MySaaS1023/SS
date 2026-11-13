import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  async headers() {
    const existingPrivateHeaders = [
      "/handoff/:path*",
      "/admin/handoffs/:path*",
      "/admin/connect/:path*",
      "/api/handoff/:path*",
      "/admin/scheduling/:path*",
      "/admin/settings/:path*",
      "/api/admin/management",
      "/api/admin/records/:path*",
      "/auth/recovery",
      "/auth/partner-access",
      "/auth/admin-invite/:path*",
      "/api/admin/management/invitations/:path*",
      "/api/auth/recovery/:path*",
      "/api/partner/auth/representative-access",
      "/admin/referral-program/resources/:path*",
      "/partner/resources/:path*",
      "/api/partner-resources/:path*",
      "/api/scheduling/:path*",
    ].map((source) => ({
      source,
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
        { key: "Referrer-Policy", value: "no-referrer" },
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow, noarchive, nosnippet",
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        {
          key: "Content-Security-Policy",
          value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'`,
        },
      ],
    }));

    // Authentication remains the access boundary. HTML stays crawlable so
    // search engines can read noindex; these routes never enter the sitemap.
    const searchExcludedRoutes = [
      "/admin/:path*",
      "/partner/:path*",
      "/auth/:path*",
      "/api/:path*",
      "/handoff/:path*",
      "/get-started/:path*",
      "/ref/:path*",
      "/referral-intake",
      "/consultation",
      "/referral-partners/apply",
      "/success",
      "/cancel",
      "/portfolio",
    ];

    return [
      ...existingPrivateHeaders,
      ...searchExcludedRoutes.map((source) => ({
        source,
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      })),
    ];
  },
};

export default nextConfig;
