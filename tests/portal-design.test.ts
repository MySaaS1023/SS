import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { adminPrimaryLinks } from "../components/admin/primary-navigation";
import { HomeConnectSection } from "../components/connect/home-connect-section";
import { SocialIconLinks } from "../components/connect/social-icon-links";
import { HandoffSectionNav } from "../components/handoff/section-nav";
import { socialLinks } from "../lib/social-links";

// The existing tsconfig preserves JSX for Next's compiler. The standalone tsx
// renderer uses the classic runtime, including for existing shared components.
Object.assign(globalThis, { React });

test("admin primary navigation contains exactly four ordered sections", () => {
  assert.deepEqual(
    adminPrimaryLinks.map((link) => link.label),
    ["Referral Program", "Client Scheduling", "Client Handoff", "QR Code"],
  );
  assert.equal(new Set(adminPrimaryLinks.map((link) => link.href)).size, 4);
});

test("homepage uses supplied central links and the existing permanent QR asset", () => {
  const settings = {
    ...socialLinks,
    instagram: "https://www.instagram.com/synthetic-business/",
    googleReviewUrl: "https://g.page/r/synthetic-review/review",
  };
  const html = renderToStaticMarkup(
    createElement(HomeConnectSection, { settings }),
  );
  assert.match(html, /Let&#x27;s Stay Connected/);
  assert.match(html, /synthetic-business/);
  assert.match(html, /synthetic-review\/review/);
  assert.match(html, /connect-qr\.png/);
  assert.match(html, /href="\/connect"/);
  assert.match(html, /Scan to Connect/);
  assert.doesNotMatch(html, /<form|name="rating"|handoff\//);
});

test("homepage never publishes an unverified Google review action", () => {
  const html = renderToStaticMarkup(
    createElement(HomeConnectSection, {
      settings: {
        ...socialLinks,
        googleBusinessProfileVerifiedEligible: false,
      },
    }),
  );
  assert.doesNotMatch(html, /Leave a Google Review/);
  assert.match(html, /connect-qr\.png/);
});

test("shared social icons have accessible labels, safe new-tab behavior and omit unset accounts", () => {
  const html = renderToStaticMarkup(
    createElement(SocialIconLinks, {
      settings: { ...socialLinks, instagram: null },
    }),
  );
  assert.equal((html.match(/target="_blank"/g) || []).length, 3);
  assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 3);
  assert.match(html, /Facebook — Steady Start \(opens in a new tab\)/);
  assert.doesNotMatch(html, /Instagram —/);
});

test("footer reads authoritative settings and preserves existing navigation and legal links", async () => {
  const footer = await readFile("components/site-footer.tsx", "utf8");
  assert.match(footer, /await getSocialSettings\(\)/);
  assert.match(footer, /SocialIconLinks/);
  assert.match(footer, /getGoogleReviewUrl\(settings\)/);
  assert.match(footer, /connect-qr\.png/);
  for (const link of [
    "/terms",
    "/privacy",
    "/referral-partners/terms",
    "/contact",
    "/pricing",
  ])
    assert.ok(footer.includes(`"${link}"`));
  assert.doesNotMatch(footer, /href: "\/portfolio"/);
  assert.doesNotMatch(
    footer,
    /https:\/\/(www\.)?(facebook|youtube|instagram|tiktok|g\.page)/,
  );
});

test("handoff sections stay internal and expose the selected page accessibly", () => {
  const html = renderToStaticMarkup(
    createElement(HandoffSectionNav, { selected: "saved" }),
  );
  assert.match(html, /aria-label="Client Handoff sections"/);
  assert.equal((html.match(/<a /g) || []).length, 4);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  for (const label of [
    "Create Handoff",
    "Delivery",
    "Saved Handoffs",
    "Customer Feedback",
  ])
    assert.ok(html.includes(label));
  assert.match(html, /grid-cols-2/);
  assert.doesNotMatch(html, /overflow-x-auto|whitespace-nowrap/);
});
