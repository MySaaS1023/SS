import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import test from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeConnectSection } from "../components/connect/home-connect-section";
import { ConnectContent } from "../components/connect/connect-content";
import { CompletionCard } from "../components/handoff/completion-card";
import { socialLinks } from "../lib/social-links";
import { isHandoffScreen } from "../lib/handoff/privacy";

const localRequire = createRequire(
  `${process.cwd()}/tests/portal-integration.test.ts`,
);
const loader = Module as unknown as {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
Object.assign(globalThis, { React });

test("private scheduling and resource paths suppress tracking without changing referral or marketing paths", () => {
  for (const route of [
    "/consultation",
    "/admin/scheduling",
    "/admin/scheduling/synthetic",
    "/admin/connect",
    "/admin/settings/admins",
    "/admin/settings/admins/synthetic",
    "/admin/reset-password",
    "/partner/reset-password",
    "/admin/referral-program/resources",
    "/partner/resources",
  ])
    assert.equal(isHandoffScreen(route), true);
  for (const route of [
    "/",
    "/connect",
    "/pricing",
    "/referral-partners",
    "/admin/referral-program/referrals",
    "/consultation-marketing",
  ])
    assert.equal(isHandoffScreen(route), false);
});

async function mockedModule<T>(
  filename: string,
  dependencies: Record<string, unknown>,
  run: (module: T) => Promise<void>,
) {
  const original = loader._load;
  const resolved = localRequire.resolve(filename);
  const previous = localRequire.cache[resolved];
  delete localRequire.cache[resolved];
  loader._load = (request, parent, isMain) =>
    request in dependencies
      ? dependencies[request]
      : original(request, parent, isMain);
  try {
    await run(localRequire(filename) as T);
  } finally {
    loader._load = original;
    delete localRequire.cache[resolved];
    if (previous) localRequire.cache[resolved] = previous;
  }
}

test("one updated central configuration reaches homepage, footer, connect and handoff without changing QR", async () => {
  const settings = {
    ...socialLinks,
    facebook: "https://www.facebook.com/synthetic-qa-business/",
    googleReviewUrl: "https://g.page/r/synthetic-qa/review",
  };
  await mockedModule<{ SiteFooter: () => Promise<React.ReactNode> }>(
    "../components/site-footer",
    {
      "@/lib/social-settings": { getSocialSettings: async () => settings },
    },
    async ({ SiteFooter }) => {
      const views = [
        createElement(HomeConnectSection, { settings }),
        await SiteFooter(),
        createElement(ConnectContent, { settings }),
        createElement(CompletionCard, {
          socialSettings: settings,
          details: {
            businessName: "Synthetic QA",
            websiteUrl: "https://example.com/",
            message: null,
          },
        }),
      ];
      for (const view of views) {
        const html = renderToStaticMarkup(view);
        assert.match(html, /facebook\.com\/synthetic-qa-business/);
        assert.match(html, /g\.page\/r\/synthetic-qa\/review/);
        assert.doesNotMatch(html, /61589843720808/);
      }
      for (const view of views.slice(0, 2))
        assert.match(renderToStaticMarkup(view), /connect-qr\.png/);
    },
  );
});

test("unauthorized social save cannot invalidate public settings, while authorized save invalidates all experiences", async () => {
  const paths: unknown[][] = [],
    tags: string[] = [];
  let allowed = false;
  await mockedModule<{
    saveSocialSettingsAction: (
      state: { ok: boolean; message: string },
      data: FormData,
    ) => Promise<{ ok: boolean }>;
  }>(
    "../app/admin/(protected)/connect/actions",
    {
      "next/cache": {
        revalidatePath: (...args: unknown[]) => paths.push(args),
        revalidateTag: (tag: string) => tags.push(tag),
      },
      "@/lib/social-settings": {
        saveSocialSettings: async () => {
          if (!allowed) throw new Error("Synthetic unauthorized");
        },
      },
    },
    async ({ saveSocialSettingsAction }) => {
      const data = new FormData();
      data.set("version", "1");
      assert.equal(
        (await saveSocialSettingsAction({ ok: false, message: "" }, data)).ok,
        false,
      );
      assert.equal(paths.length, 0);
      assert.equal(tags.length, 0);
      allowed = true;
      assert.equal(
        (await saveSocialSettingsAction({ ok: false, message: "" }, data)).ok,
        true,
      );
      assert.deepEqual(tags, ["steady-start-social-settings"]);
      assert.ok(paths.some((p) => p[0] === "/" && p[1] === "layout"));
      assert.ok(paths.some((p) => p[0] === "/connect"));
      assert.ok(paths.some((p) => p[0] === "/handoff/[token]"));
    },
  );
});

test("private document download denies unauthenticated, wrong partner, old version and mid-download revocation", async () => {
  const resourceId = "00000000-0000-4000-8000-000000000010",
    current = "00000000-0000-4000-8000-000000000020";
  const partner = {
    user: { id: "00000000-0000-4000-8000-000000000101" },
    partner: { id: "00000000-0000-4000-8000-000000000001", status: "approved" },
  };
  const resource = {
    id: resourceId,
    published: true,
    classification: "general",
    target_partner_id: null,
    current_version_id: current,
  };
  let context: typeof partner | null = null,
    queryCount = 0,
    downloads = 0;
  let rows: unknown[] = [];
  const db = {
    from: () => {
      queryCount++;
      const q = {
        select: () => q,
        eq: () => q,
        maybeSingle: async () => ({ data: rows.shift(), error: null }),
      };
      return q;
    },
    storage: {
      from: () => ({
        download: async () => {
          downloads++;
          return { data: new Blob(["Synthetic QA document"]), error: null };
        },
      }),
    },
  };
  await mockedModule<{
    downloadResource: (id: string, version: string | null) => Promise<unknown>;
  }>(
    "../lib/partner-resources/server",
    {
      "server-only": {},
      "@/lib/supabase/server": {
        getFullyAuthorizedAdminUser: async () => null,
        getFullyAuthorizedPartner: async () => context,
        createAdminSupabaseClient: () => db,
      },
    },
    async ({ downloadResource }) => {
      await assert.rejects(
        () => downloadResource(resourceId, null),
        /Approved access is required/,
      );
      assert.equal(queryCount, 0);
      context = partner;
      rows = [
        {
          ...resource,
          classification: "completed_tax",
          target_partner_id: "00000000-0000-4000-8000-000000000002",
        },
      ];
      await assert.rejects(
        () => downloadResource(resourceId, null),
        /unavailable/,
      );
      assert.equal(downloads, 0);
      rows = [resource];
      await assert.rejects(
        () =>
          downloadResource(resourceId, "00000000-0000-4000-8000-000000000021"),
        /unavailable/,
      );
      assert.equal(downloads, 0);
      rows = [
        resource,
        {
          id: current,
          resource_id: resourceId,
          original_filename: "synthetic.txt",
          file_path: "synthetic",
        },
        { ...resource, published: false },
      ];
      await assert.rejects(
        () => downloadResource(resourceId, null),
        /unavailable/,
      );
      assert.equal(downloads, 1);
      rows = [
        resource,
        {
          id: current,
          resource_id: resourceId,
          original_filename: "synthetic.txt",
          file_path: "synthetic",
        },
        resource,
      ];
      assert.ok(await downloadResource(resourceId, null));
      assert.equal(downloads, 2);
    },
  );
});

test("every scheduling administrator operation rejects before database or provider access", async () => {
  let storageCalls = 0,
    providerCalls = 0;
  type SchedulingServer = {
    schedulingDashboard: (filter: string) => Promise<unknown>;
    consultationDetail: (id: string) => Promise<unknown>;
    saveSchedule: (value: unknown) => Promise<unknown>;
    findSchedulingClients: (value: string) => Promise<unknown>;
    adminCreateBooking: (value: unknown, source: object) => Promise<unknown>;
    updateConsultation: (value: {
      id: string;
      version: number;
      action: string;
    }) => Promise<unknown>;
    sendConsultationConfirmation: (
      id: string,
      version: number,
      recipient: string,
      confirmed: boolean,
    ) => Promise<unknown>;
    refreshConsultationNotification: (id: string) => Promise<unknown>;
  };
  const id = "00000000-0000-4000-8000-000000000001";
  await mockedModule<SchedulingServer>(
    "../lib/scheduling/server",
    {
      "server-only": {},
      "@/lib/supabase/server": {
        getFullyAuthorizedAdminUser: async () => null,
        createAdminSupabaseClient: () => {
          storageCalls++;
          throw new Error("Unexpected storage");
        },
      },
      "@/lib/email": {
        businessEmail: "synthetic@example.invalid",
        getResendClient: () => {
          providerCalls++;
          throw new Error("Unexpected provider");
        },
      },
    },
    async (server) => {
      for (const operation of [
        () => server.schedulingDashboard("upcoming"),
        () => server.consultationDetail(id),
        () => server.saveSchedule({}),
        () => server.findSchedulingClients("Synthetic"),
        () => server.adminCreateBooking({}, {}),
        () => server.updateConsultation({ id, version: 1, action: "confirm" }),
        () =>
          server.sendConsultationConfirmation(
            id,
            1,
            "synthetic@example.invalid",
            true,
          ),
        () => server.refreshConsultationNotification(id),
      ])
        await assert.rejects(operation, /Administrator access is required/);
      assert.equal(storageCalls, 0);
      assert.equal(providerCalls, 0);
    },
  );
});
