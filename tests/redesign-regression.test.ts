import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { serviceOfferings } from "../lib/site-data";
import { socialLinks } from "../lib/social-links";

Object.assign(globalThis, { React });
const localRequire = createRequire(
  `${process.cwd()}/tests/redesign-regression.test.ts`,
);
const loader = Module as unknown as {
  _load: (request: string, parent: unknown, main: boolean) => unknown;
};
async function isolated<T>(
  filename: string,
  mocks: Record<string, unknown>,
  run: (module: T) => Promise<void>,
) {
  const original = loader._load;
  const resolved = localRequire.resolve(filename);
  const previous = localRequire.cache[resolved];
  delete localRequire.cache[resolved];
  loader._load = (request, parent, main) =>
    request in mocks ? mocks[request] : original(request, parent, main);
  try {
    await run(localRequire(filename) as T);
  } finally {
    loader._load = original;
    delete localRequire.cache[resolved];
    if (previous) localRequire.cache[resolved] = previous;
  }
}
const textContent = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("four primary cards and six referral controls retain routes and accessible active state", async () => {
  const mocks = {
    "next/navigation": {
      usePathname: () => "/admin/referral-program/resources",
    },
  };
  await isolated<{ AdminPrimaryNavigation: () => React.ReactNode }>(
    "../components/admin/primary-navigation",
    mocks,
    async ({ AdminPrimaryNavigation }) => {
      const html = renderToStaticMarkup(
        React.createElement(AdminPrimaryNavigation),
      );
      assert.equal((html.match(/<a /g) ?? []).length, 4);
      assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
      assert.equal((html.match(/<svg /g) ?? []).length, 4);
      for (const href of [
        "/admin/referral-program",
        "/admin/scheduling",
        "/admin/handoffs",
        "/admin/connect",
      ])
        assert.ok(html.includes(`href="${href}"`));
      assert.match(html, /grid-cols-2/);
      assert.doesNotMatch(html, /Sign out|Availability/);
    },
  );
  await isolated<{ ReferralSectionNavigation: () => React.ReactNode }>(
    "../components/admin/referral-section-navigation",
    mocks,
    async ({ ReferralSectionNavigation }) => {
      const html = renderToStaticMarkup(
        React.createElement(ReferralSectionNavigation),
      );
      assert.equal((html.match(/<a /g) ?? []).length, 6);
      assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
      assert.equal((html.match(/<svg /g) ?? []).length, 6);
      for (const name of [
        "Program Summary",
        "Applications",
        "Partners",
        "Referrals",
        "Commissions &amp; Payouts",
        "Partner Resources",
      ])
        assert.ok(html.includes(name));
      assert.match(html, /flex-wrap/);
      assert.match(html, /focus-visible/);
    },
  );
});

test("portal hides marketing chrome while public and authentication routes preserve it", async () => {
  let pathname = "/";
  await isolated<{
    PublicSiteChrome: (props: { children: React.ReactNode }) => React.ReactNode;
  }>(
    "../components/public-site-chrome",
    { "next/navigation": { usePathname: () => pathname } },
    async ({ PublicSiteChrome }) => {
      for (const route of [
        "/",
        "/pricing",
        "/portfolio",
        "/admin/login",
        "/admin/forgot-password",
        "/admin/reset-password",
        "/admin/change-password",
      ]) {
        pathname = route;
        assert.equal(
          PublicSiteChrome({ children: "marketing chrome" }),
          "marketing chrome",
          route,
        );
      }
      for (const route of [
        "/admin",
        "/admin/referral-program",
        "/admin/referral-program/resources",
        "/admin/scheduling",
        "/admin/handoffs",
        "/admin/connect",
      ]) {
        pathname = route;
        assert.equal(
          PublicSiteChrome({ children: "marketing chrome" }),
          null,
          route,
        );
      }
    },
  );
});

test("redesigned summary renders live query results and preserves additional metrics", async () => {
  const queried: string[] = [];
  const tables: Record<string, object> = {
    referral_partner_applications: {
      data: [
        { status: "pending" },
        { status: "pending" },
        { status: "approved" },
        { status: "rejected" },
      ],
    },
    referral_partners: { count: 7 },
    referrals: {
      data: [
        { status: "qualified", source: "referral_link" },
        { status: "partial", source: "referral_link" },
        { status: "payment_confirmed", source: "referral_link" },
        { status: "customer", source: "manual" },
      ],
    },
    referral_commissions: {
      data: [
        { status: "paid", commission_amount_cents: 12345 },
        { status: "paid", commission_amount_cents: 678 },
        { status: "eligible", commission_amount_cents: 10000 },
        { status: "approved", commission_amount_cents: 10000 },
      ],
    },
    referral_payouts: { count: 5 },
    referral_attributions: { count: 19 },
  };
  const db = {
    from(table: string) {
      queried.push(table);
      assert.ok(table in tables, `Unexpected query: ${table}`);
      const query = {
        select: () => query,
        eq: () => query,
        then: (resolve: (value: object) => unknown) =>
          Promise.resolve(tables[table]).then(resolve),
      };
      return query;
    },
  };
  await isolated<{ default: () => Promise<React.ReactNode> }>(
    "../app/admin/(protected)/referral-program/page",
    { "@/lib/supabase/server": { createAdminSupabaseClient: () => db } },
    async ({ default: Overview }) => {
      const html = renderToStaticMarkup(await Overview());
      const text = textContent(html);
      for (const [label, value] of [
        ["Pending Applications", 2],
        ["Approved Applications", 1],
        ["Rejected Applications", 1],
        ["Active Partners", 7],
        ["Total Referrals", 4],
        ["Referral Link Visits", 19],
        ["Qualified Leads from Links", 2],
        ["Total Commissions Paid", "$130.23"],
      ])
        assert.ok(
          text.includes(`${label} ${value}`),
          `Missing computed ${label}: ${value}`,
        );
      for (const label of [
        "Additional Metrics",
        "Link Conversions",
        "Converted Customers",
        "Eligible Commissions",
        "Approved Commissions",
        "Payouts",
      ])
        assert.ok(text.includes(label), `Lost existing metric: ${label}`);
      assert.match(html, /<details/);
      assert.match(text, /administrator-confirmed payments and manual payouts/);
      assert.match(text, /durable lead\/customer identifier/);
      for (const href of [
        "/admin/referral-program/applications",
        "/admin/referral-program/partners",
        "/admin/referral-program/resources",
      ])
        assert.ok(
          html.includes(`href="${href}"`),
          `Missing existing quick action ${href}`,
        );
      assert.deepEqual(new Set(queried), new Set(Object.keys(tables)));
      tables.referral_partners = { count: 0 };
      tables.referral_commissions = { data: [] };
      const updated = textContent(renderToStaticMarkup(await Overview()));
      assert.ok(updated.includes("Active Partners 0"));
      assert.ok(updated.includes("Total Commissions Paid $0.00"));
    },
  );
});

test("redesigned protected layout retains partner, unauthenticated and forced-password redirects", async () => {
  let role: string | null = null;
  let mustChangePassword = false;
  await isolated<{
    default: (props: { children: React.ReactNode }) => Promise<React.ReactNode>;
  }>(
    "../app/admin/(protected)/layout",
    {
      "next/navigation": {
        usePathname: () => "/admin/referral-program",
        redirect: (path: string) => {
          throw new Error(`REDIRECT ${path}`);
        },
      },
      "@/lib/supabase/server": {
        getUserReferralRole: async () => role,
        getAdminAccessState: async () => ({ mustChangePassword }),
      },
      "@/lib/social-settings": { getSocialSettings: async () => socialLinks },
    },
    async ({ default: Layout }) => {
      await assert.rejects(
        () => Layout({ children: "synthetic" }),
        /REDIRECT \/admin\/login/,
      );
      role = "partner";
      await assert.rejects(
        () => Layout({ children: "synthetic" }),
        /REDIRECT \/partner/,
      );
      role = "admin";
      mustChangePassword = true;
      await assert.rejects(
        () => Layout({ children: "synthetic" }),
        /REDIRECT \/admin\/change-password/,
      );
    },
  );
});

test("redesigned homepage presents all approved packages and intake selections without a project showcase", async () => {
  await isolated<{ default: () => Promise<React.ReactNode> }>(
    "../app/page",
    { "@/lib/social-settings": { getSocialSettings: async () => socialLinks } },
    async ({ default: Home }) => {
      const html = renderToStaticMarkup(await Home());
      for (const offering of serviceOfferings) {
        assert.ok(
          html.includes(offering.name),
          `Missing offering ${offering.name}`,
        );
        assert.ok(
          html.includes(offering.price),
          `Wrong price ${offering.name}`,
        );
        assert.ok(
          html.includes(`href="${offering.href}"`),
          `Lost intake selection ${offering.key}`,
        );
      }
      const text = textContent(html);
      const headings = [
        "Launch Your Business Online",
        "Choose the Right Solution for Your Business",
        "A Partner in Your Business Growth",
        "Leave a Review &amp; Follow Along",
      ];
      let position = -1;
      for (const heading of headings) {
        const next = text.indexOf(heading);
        assert.ok(next > position, `Missing or misplaced section ${heading}`);
        position = next;
      }
      assert.doesNotMatch(
        html,
        /Websites I(?:&#x27;|')ve Built|Reliable Climate|Grubel Property|Apex Landscaping|Emli|PortfolioCarousel|portfolio-carousel/i,
      );
      assert.match(html, /connect-qr\.png/);
      assert.match(html, /href="\/connect"/);
    },
  );
});
