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

test("four compact admin tabs retain routes and referral navigation avoids duplicated summary controls", async () => {
  let pathname = "/admin/referral-program/resources";
  const mocks = {
    "next/navigation": {
      usePathname: () => pathname,
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
      assert.equal((html.match(/class="admin-primary-tab"/g) ?? []).length, 4);
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
      assert.equal((html.match(/<a /g) ?? []).length, 1);
      assert.match(html, /href="\/admin\/referral-program"/);
      assert.doesNotMatch(html, /Program Summary/);
      assert.match(html, /flex-wrap/);
      pathname = "/admin/referral-program";
      assert.equal(renderToStaticMarkup(React.createElement(ReferralSectionNavigation)), "");
      pathname = "/admin/referral-program/partners";
      const leaf = renderToStaticMarkup(React.createElement(ReferralSectionNavigation));
      assert.match(leaf, /href="\/admin\/referral-program\/resources"/);
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

test("minimal referral management renders four counted record disclosures and preserves operational details", async () => {
  const queried: string[] = [];
  let failedQuery = "";
  const tables: Record<string, object> = {
    referral_partner_applications: {
      data: [
        { id: "synthetic-application", first_name: "Synthetic", last_name: "Applicant", email: "applicant@example.invalid", phone: "+1 202 555 0100", status: "pending", created_at: "2026-11-12T12:00:00Z" },
      ],
    },
    referral_partners: { data: [{ id: "synthetic-partner", first_name: "Synthetic", last_name: "Partner", email: "partner@example.invalid", phone: "+1 202 555 0101", referral_code: "STABLE-SYNTHETIC-REP-ID", status: "approved" }] },
    referrals: {
      data: [
        { id: "synthetic-referral", partner_id: "synthetic-partner", customer_first_name: "Synthetic", customer_last_name: "Customer", business_name: "Synthetic Business", status: "qualified", source: "referral_link", service_interest: "standard-website", submitted_at: "2026-11-12T12:00:00Z" },
      ],
    },
    referral_commissions: {
      data: [
        { id: "synthetic-commission", referral_id: "synthetic-referral", partner_id: "synthetic-partner", status: "paid", commission_amount_cents: 10000, created_at: "2026-11-12T12:00:00Z", paid_at: "2026-11-12T12:00:00Z" },
      ],
    },
    referral_payouts: { data: [] },
    referral_attributions: { data: [] },
  };
  const db = {
    from(table: string) {
      queried.push(table);
      assert.ok(table in tables, `Unexpected query: ${table}`);
      let selection = "";
      const query = {
        select: (fields: string) => { selection = fields; return query; },
        eq: () => query,
        order: () => query,
        then: (resolve: (value: object) => unknown) =>
          Promise.resolve(failedQuery === `${table}:${selection}` ? { data: null, error: { message: "PRIVATE_QUERY_DETAILS" } } : tables[table]).then(resolve),
      };
      return query;
    },
  };
  async function resolveServerChildren(node: React.ReactNode): Promise<React.ReactNode> {
    if (Array.isArray(node)) return Promise.all(React.Children.toArray(node).map(resolveServerChildren));
    if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return node;
    if (typeof node.type === "function" && node.type.constructor.name === "AsyncFunction")
      return resolveServerChildren(await (node.type as (props: unknown) => Promise<React.ReactNode>)(node.props));
    if (node.props.children !== undefined)
      return React.cloneElement(node, {}, await resolveServerChildren(node.props.children));
    return node;
  }
  const readOnlyAction = async () => ({ ok: false, message: "Synthetic test only" });
  await isolated<{ default: (props: { searchParams?: Promise<{ q?: string | string[] }> }) => Promise<React.ReactNode> }>(
    "../app/admin/(protected)/referral-program/page",
    {
      "@/lib/supabase/server": { createAdminSupabaseClient: () => db },
      "@/app/admin/(protected)/referral-program/actions": new Proxy({}, { get: () => readOnlyAction }),
      "@/components/admin/record-archive-control": { RecordArchiveControl: () => null },
      "next/navigation": { useRouter: () => ({ push() {}, replace() {}, refresh() {} }) },
    },
    async ({ default: Management }) => {
      const html = renderToStaticMarkup(await resolveServerChildren(await Management({})));
      const text = textContent(html);
      assert.equal((html.match(/class="referral-management-section"/g) ?? []).length, 4);
      for (const label of ["Applications 1", "Partners 1", "Referrals 1", "Commissions &amp; Payouts 1"])
        assert.ok(text.includes(label), `Missing count ${label}`);
      for (const detail of ["applicant@example.invalid", "+1 202 555 0100", "STABLE-SYNTHETIC-REP-ID", "Synthetic Business", "$100.00", "Confirm verified customer payment"])
        assert.ok(html.includes(detail), `Lost operational record detail ${detail}`);
      assert.match(html, /href="\/admin\/referral-program\/resources"/);
      assert.doesNotMatch(text, /Program Summary|Referral Program Overview|Quick Actions|Additional Metrics/);
      assert.deepEqual(new Set(queried), new Set(Object.keys(tables)));
      tables.referral_partners = { data: [] };
      tables.referral_commissions = { data: [] };
      const updated = textContent(renderToStaticMarkup(await resolveServerChildren(await Management({}))));
      assert.ok(updated.includes("Partners 0"));
      assert.ok(updated.includes("Commissions &amp; Payouts 0"));
      assert.ok(updated.includes("No records in this section."));
      const errorBranches = [
        ["applications", "ApplicationRecords", "referral_partner_applications:*"] ,
        ["partners", "PartnerRecords", "referral_partners:*"] ,
        ["partners", "PartnerRecords", "referral_payouts:partner_id,amount_cents,paid_at,payment_method,payout_reference"],
        ["partners", "PartnerRecords", "referral_attributions:partner_id"],
        ["partners", "PartnerRecords", "referrals:partner_id,status"],
        ["referrals", "ReferralRecords", "referrals:*"] ,
        ["referrals", "ReferralRecords", "referral_partners:id,first_name,last_name,referral_code,status"],
        ["commissions", "CommissionRecords", "referral_commissions:*"] ,
        ["commissions", "CommissionRecords", "referrals:id,partner_id,business_name,customer_first_name,customer_last_name,status"],
        ["commissions", "CommissionRecords", "referral_partners:id,first_name,last_name"],
      ];
      for (const [file, exported, query] of errorBranches) {
        failedQuery = query;
        const records = localRequire(`../components/admin/referral-records/${file}`) as Record<string, () => Promise<React.ReactNode>>;
        await assert.rejects(() => records[exported](), (error: unknown) =>
          error instanceof Error && /could not be loaded/.test(error.message) && !error.message.includes("PRIVATE_QUERY_DETAILS"),
          `Query errors must not become empty lists: ${query}`);
      }
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

test("homepage adds four canonical compact packages while preserving existing sections and links", async () => {
  await isolated<{ default: () => Promise<React.ReactNode> }>(
    "../app/page",
    { "@/lib/social-settings": { getSocialSettings: async () => socialLinks } },
    async ({ default: Home }) => {
      const html = renderToStaticMarkup(await Home());
      for (const category of [
        "Custom Websites",
        "Booking &amp; Integrations",
        "Automation &amp; AI Tools",
        "Business Setup",
      ])
        assert.ok(html.includes(category));
      assert.match(html, /href="\/pricing"/);
      assert.match(html, /href="\/get-started"/);
      assert.doesNotMatch(html, /board-price-summary/);
      const text = textContent(html);
      const headings = [
        "Launch Your Business Online",
        "Choose the Right Solution for Your Business",
        "Our Services",
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
      assert.equal(
        (html.match(/data-package-variant="compact"/g) ?? []).length,
        4,
      );
      assert.equal((html.match(/pricing-package-action/g) ?? []).length, 4);
      assert.match(html, /Compare All Packages/);
      for (const offering of serviceOfferings) {
        assert.ok(html.includes(offering.name), offering.name);
        assert.ok(html.includes(offering.price), offering.price);
        assert.ok(html.includes(`href="${offering.href}"`), offering.href);
        assert.ok(
          html.includes(`data-service="${offering.key}"`),
          offering.key,
        );
      }
      assert.equal((html.match(/Most Popular/g) ?? []).length, 1);
    },
  );
});

test("shared compact package cards summarize canonical features without altering their full variant", async () => {
  await isolated<{
    PricingCard: (props: {
      tier: (typeof serviceOfferings)[number];
      compact?: boolean;
    }) => React.ReactNode;
  }>("../components/pricing-card", {}, async ({ PricingCard }) => {
    for (const tier of serviceOfferings) {
      const compact = renderToStaticMarkup(
        React.createElement(PricingCard, { tier, compact: true }),
      );
      const full = renderToStaticMarkup(
        React.createElement(PricingCard, { tier }),
      );
      const expected =
        tier.features?.slice(0, 3) ??
        tier.options?.slice(0, 3).map((option) => option.title) ??
        [];
      assert.equal(
        (compact.match(/<li /g) ?? []).length,
        expected.length,
        tier.key,
      );
      for (const feature of expected) {
        assert.ok(
          textContent(compact).includes(feature.replaceAll("&", "&amp;")),
          feature,
        );
      }
      assert.match(compact, /data-package-variant="compact"/);
      assert.match(full, /data-package-variant="full"/);
      assert.ok(compact.includes(`href="${tier.href}"`));
      assert.ok(full.includes(`href="${tier.href}"`));
      for (const feature of tier.features ??
        tier.options?.flatMap((option) => option.features) ??
        []) {
        assert.ok(
          textContent(full).includes(feature.replaceAll("&", "&amp;")),
          feature,
        );
      }
      assert.doesNotMatch(compact, /brand-secondary/);
    }
  });
});

test("pricing retains all approved package prices and intake selections", async () => {
  await isolated<{ default: () => React.ReactNode }>(
    "../app/pricing/page",
    {},
    async ({ default: Pricing }) => {
      const html = renderToStaticMarkup(Pricing());
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
    },
  );
});
