import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

type Cookie = { name: string; value: string; path?: string; maxAge?: number };
type MiddlewareResponse = { kind: string; location?: string; headers: Headers; cookies: { set: (...args: unknown[]) => void; getAll: () => Cookie[] } };
function fixture(options: { configured?: boolean; authenticated?: boolean; error?: boolean; throws?: boolean; refreshCookies?: boolean } = {}) {
  let factories = 0;
  function response(kind: string, location?: string): MiddlewareResponse {
    let cookies: Cookie[] = [];
    return { kind, location, headers: new Headers(), cookies: {
      set: (...args: unknown[]) => { const cookie = typeof args[0] === "object" ? args[0] as Cookie : { name: args[0] as string, value: args[1] as string, ...(args[2] as object) }; cookies = cookies.filter(item => item.name !== cookie.name).concat(cookie); },
      getAll: () => cookies,
    } };
  }
  const container = { exports: {} as { middleware: (request: object) => Promise<MiddlewareResponse> } };
  vm.runInNewContext(ts.transpileModule(readFileSync("middleware.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    module: container, exports: container.exports,
    process: { env: options.configured === false ? {} : { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3145", NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic" } },
    require: (name: string) => {
      if (name === "next/server") return { NextResponse: { next: () => response("next"), redirect: (url: URL) => response("redirect", url.href) } };
      assert.equal(name, "@supabase/ssr");
      return { createServerClient: (_url: string, _key: string, config: { cookies: { setAll: (cookies: { name: string; value: string; options: object }[]) => void } }) => {
        factories++;
        return { auth: { getUser: async () => {
          if (options.refreshCookies) config.cookies.setAll([{ name: "synthetic-session", value: "", options: { path: "/", maxAge: 0 } }]);
          if (options.throws) throw new Error("Synthetic auth unavailable");
          return { data: { user: options.authenticated ? { id: "synthetic-user" } : null }, error: options.error ? { message: "Synthetic auth rejected" } : null };
        } } };
      } };
    },
  }, { filename: "middleware.ts" });
  return { middleware: container.exports.middleware, factories: () => factories };
}
function request(path: string) {
  const url = new URL(path, "https://steadystart.example.invalid");
  return { nextUrl: { pathname: url.pathname, clone: () => new URL(url) }, cookies: { getAll: () => [], set: () => {} } };
}

test("anonymous, invalid, unavailable and unconfigured protected requests stop before SSR", async () => {
  for (const path of ["/admin/referral-program?private=discard", "/partner/referrals?private=discard"]) for (const options of [{}, { error: true }, { throws: true }, { configured: false }]) {
    const testCase = fixture(options);
    const result = await testCase.middleware(request(path));
    assert.equal(result.kind, "redirect");
    assert.equal(new URL(result.location!).pathname, path.startsWith("/admin") ? "/admin/login" : "/partner/login");
    assert.equal(new URL(result.location!).search, "");
    assert.match(result.headers.get("cache-control")!, /no-store/);
    assert.equal(result.headers.get("referrer-policy"), "no-referrer");
    if (options.configured === false) assert.equal(testCase.factories(), 0);
  }
});

test("public login, forgotten/reset password and callback routes remain available for recovery code exchange", async () => {
  for (const path of ["/admin/login", "/admin/forgot-password", "/admin/reset-password?code=synthetic", "/partner/login", "/partner/forgot-password", "/partner/reset-password?code=synthetic", "/auth/callback?code=synthetic"]) {
    for (const options of [{}, { error: true }, { throws: true }, { configured: false }]) assert.equal((await fixture(options).middleware(request(path))).kind, "next", path);
  }
});

test("cookie refresh/deletion is preserved on denial and verified sessions continue to authoritative DAL role checks", async () => {
  const denied = await fixture({ refreshCookies: true }).middleware(request("/admin/referral-program"));
  assert.deepEqual(JSON.parse(JSON.stringify(denied.cookies.getAll())), [{ name: "synthetic-session", value: "", path: "/", maxAge: 0 }]);
  const allowed = await fixture({ authenticated: true, refreshCookies: true }).middleware(request("/partner/referrals"));
  assert.equal(allowed.kind, "next");
  assert.deepEqual(JSON.parse(JSON.stringify(allowed.cookies.getAll())), [{ name: "synthetic-session", value: "", path: "/", maxAge: 0 }]);
});
