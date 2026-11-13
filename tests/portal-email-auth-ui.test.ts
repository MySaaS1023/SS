import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";

async function renderLogin(portal: "admin" | "partner", enabled: boolean) {
  const output = { default: async () => React.createElement("div") };
  const legacy = () => React.createElement("form", { id: "legacy-password-login" }, React.createElement("input", { type: "password" }), React.createElement("a", { href: `/${portal}/forgot-password` }, "Forgot Password?"));
  const mocks: Record<string, unknown> = {
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": { redirect: () => { throw Error("Unexpected unauthenticated page redirect"); } },
    "@/components/page-container": { PageContainer: ({ children }: { children: React.ReactNode }) => React.createElement("div", {}, children) },
    "@/components/referrals/admin-login-form": { AdminLoginForm: legacy },
    "@/components/referrals/login-form": { LoginForm: legacy },
    "@/components/referrals/representative-access-form": { RepresentativeAccessForm: () => React.createElement("div", {}, "REPRESENTATIVE-CANDIDATE") },
    "@/components/referrals/email-link-login-form": { EmailLinkLoginForm: () => React.createElement("div", {}, "EMAIL-LINK-CANDIDATE") },
    "@/lib/partner-auth/passwordless-core": { passwordlessEnabled: () => false },
    "@/lib/portal-auth/core": { emailLinksEnabled: () => enabled },
    "@/lib/supabase/server": { getUserReferralRole: async () => null, getAdminAccessState: async () => null },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(`app/${portal}/login/page.tsx`, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    module: { exports: output }, exports: output,
    require: (name: string) => { if (name in mocks) return mocks[name]; throw Error("Unexpected isolated page dependency " + name); },
  });
  return renderToStaticMarkup(await output.default());
}
test("both portal login pages keep legacy password and recovery unchanged while email-link gate is OFF", async () => {
  for (const portal of ["admin", "partner"] as const) {
    const html = await renderLogin(portal, false);
    assert.match(html, /id="legacy-password-login"/); assert.match(html, /type="password"/); assert.ok(html.includes(`href="/${portal}/forgot-password"`)); assert.doesNotMatch(html, /EMAIL-LINK-CANDIDATE|REPRESENTATIVE-CANDIDATE|Use existing email/);
  }
});
test("even candidate email-link UI retains explicit password and recovery fallback for both portals", async () => {
  for (const portal of ["admin", "partner"] as const) {
    const html = await renderLogin(portal, true);
    assert.match(html, /EMAIL-LINK-CANDIDATE/); assert.match(html, /<details/); assert.match(html, /Use existing email and password login/); assert.match(html, /type="password"/); assert.ok(html.includes(`href="/${portal}/forgot-password"`));
  }
});
