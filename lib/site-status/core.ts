export const WEBSITE_STATUS_KEY = "public_website";

export type WebsiteStatus = {
  online: boolean;
  updatedAt: string | null;
};

export function isAlwaysAvailablePath(pathname: string) {
  return [
    "/admin",
    "/api/admin",
    "/partner",
    "/api/partner",
    "/auth/callback",
    "/api/webhooks",
    "/api/stripe/webhook",
  ].some(
    (path) =>
      pathname === path ||
      (path !== "/auth/callback" && pathname.startsWith(`${path}/`)),
  );
}

export function offlineApiResponse() {
  return {
    error: "The Steady Start website is temporarily unavailable.",
    code: "website_temporarily_offline",
  };
}

export function offlinePageHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <title>Website Temporarily Unavailable | Steady Start</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at 20% 10%, rgba(59,130,246,.22), transparent 30%), radial-gradient(circle at 85% 20%, rgba(139,92,246,.18), transparent 32%), linear-gradient(180deg,#0a0a0a,#0f172a); color: #f8fafc; font-family: "Segoe UI", "Helvetica Neue", sans-serif; }
      main { width: min(100%, 680px); padding: clamp(32px,7vw,64px); text-align: center; border: 1px solid rgba(255,255,255,.12); border-radius: 24px; background: rgba(15,23,42,.76); box-shadow: 0 28px 80px rgba(2,6,23,.5); backdrop-filter: blur(16px); }
      .brand { margin: 0; color: #93c5fd; font-size: 13px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
      h1 { margin: 20px auto 0; max-width: 520px; font-size: clamp(34px,7vw,56px); line-height: 1.05; letter-spacing: -.04em; }
      .rule { width: 64px; height: 3px; margin: 28px auto; border-radius: 999px; background: linear-gradient(90deg,#3b82f6,#8b5cf6); }
      .message { margin: 0 auto; max-width: 480px; color: #cbd5e1; font-size: clamp(17px,3vw,20px); line-height: 1.7; }
    </style>
  </head>
  <body>
    <main>
      <p class="brand">Steady Start</p>
      <h1>Website Temporarily Unavailable</h1>
      <div class="rule" aria-hidden="true"></div>
      <p class="message">Our website is currently unavailable. Please check back soon.</p>
    </main>
  </body>
</html>`;
}
