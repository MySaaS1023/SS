import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public traffic cannot be shut down by the retired database setting", async () => {
  const middleware = await readFile("middleware.ts", "utf8");
  assert.doesNotMatch(
    middleware,
    /site_settings|website_online|isWebsiteOffline|temporarilyUnavailable|SUPABASE_SERVICE_ROLE_KEY|status:\s*503/,
  );
  assert.match(
    middleware,
    /matcher: \["\/partner\/:path\*", "\/admin\/:path\*", "\/auth\/callback"\]/,
  );
  assert.match(middleware, /supabase\.auth\.getUser/);
});

test("retired availability screen has no shutdown toggle and admin authorization is retained", async () => {
  const page = await readFile(
    "app/admin/(protected)/website-status/page.tsx",
    "utf8",
  );
  assert.doesNotMatch(page, /WebsiteStatusControl|<form|Temporarily Offline/);
  const layout = await readFile("app/admin/(protected)/layout.tsx", "utf8");
  assert.match(layout, /role !== "admin"/);
  assert.match(layout, /mustChangePassword/);
});
