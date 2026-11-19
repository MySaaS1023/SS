import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import sitemap from "../app/sitemap";
import {
  designInquiryHref,
  getWebsiteDesign,
  websiteDesigns,
} from "../lib/explore-designs";
import { publicPageMetadata, SITE_URL } from "../lib/seo";
import { navLinks, serviceOfferings } from "../lib/site-data";
import nextConfig from "../next.config";

test("Explore is indexable with exact approved metadata and a single canonical sitemap entry", () => {
  const metadata = publicPageMetadata("/explore");
  assert.equal(metadata.title, "Explore Websites & Designs | Steady Start LLC");
  assert.equal(
    metadata.description,
    "Explore real websites built by Steady Start LLC and browse customizable website designs for service businesses, online stores, creators, and more.",
  );
  assert.equal(metadata.alternates?.canonical, `${SITE_URL}/explore`);
  assert.equal(metadata.robots, undefined);
  assert.equal(metadata.openGraph?.title, metadata.title);
  assert.equal(metadata.twitter?.title, metadata.title);
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.length, 19);
  assert.equal(urls.filter((url) => url === `${SITE_URL}/explore`).length, 1);
  for (const path of ["/", "/about", "/pricing", "/privacy", "/terms", "/referral-partners"])
    assert.ok(urls.includes(`${SITE_URL}${path}`));
  assert.ok(!urls.includes(`${SITE_URL}/portfolio`));
  assert.ok(!urls.includes(`${SITE_URL}/features`));
});

test("Explore augments existing navigation and footer without changing package routes", async () => {
  const expected = ["/", "/pricing", "/about", "/explore", "/referral-partners", "/contact"];
  assert.deepEqual(navLinks.map((link) => link.href), expected);
  assert.equal(navLinks.find((link) => link.href === "/explore")?.label, "Explore Websites");
  const footer = await readFile("components/site-footer.tsx", "utf8");
  assert.match(footer, /href: "\/explore", label: "Explore Websites"/);
  for (const route of ["/about", "/pricing", "/referral-partners", "/contact"])
    assert.ok(footer.includes(`href: "${route}"`));
  assert.equal(serviceOfferings.length, 4);
  for (const offering of serviceOfferings)
    assert.equal(offering.href, `/get-started?service=${offering.key}`);
});

test("selected design links use the existing intake and reject arbitrary untrusted values", () => {
  for (const design of websiteDesigns) {
    const href = designInquiryHref(design.id);
    const url = new URL(href, SITE_URL);
    assert.equal(url.pathname, "/get-started");
    assert.deepEqual([...url.searchParams.keys()], ["design"]);
    assert.equal(getWebsiteDesign(url.searchParams.get("design"))?.name, design.name);
  }
  for (const value of [undefined, null, [], {}, "unknown", "<script>alert(1)</script>", "https://example.com", "home-services&ref=evil", "x".repeat(1000)])
    assert.equal(getWebsiteDesign(value), undefined);
  assert.equal(designInquiryHref("unknown"), "/get-started");
});

test("design prefill uses editable existing notes and preserves required goals and secure intake", async () => {
  const page = await readFile("app/get-started/page.tsx", "utf8");
  assert.match(page, /typeof params\?\.design === "string" && params\.design\.length <= 80/);
  assert.match(page, /getWebsiteDesign\(params\.design\)/);
  assert.match(page, /extraNotes: `Selected website design: \$\{selectedDesign\.name\}\. Please customize this design for my business\.`/);
  assert.doesNotMatch(page, /projectGoals:|dangerouslySetInnerHTML|fetch\(/);
  assert.match(page, /resolveServiceKey\(params\?\.service \?\? params\?\.package\)/);
  const form = await readFile("components/intake-form.tsx", "utf8");
  assert.match(form, /extraNotes: values\.extraNotes/);
  assert.match(form, /projectGoals: values\.projectGoals/);
  assert.match(form, /if \(!values\.projectGoals\.trim\(\)\)/);
  assert.match(form, /fetch\("\/api\/send-project"/);
  assert.match(form, /customerHandoffToken/);
  const securePage = await readFile("app/get-started/[token]/page.tsx", "utf8");
  assert.doesNotMatch(securePage, /getWebsiteDesign|params\?\.design/);
});

test("legacy portfolio uses an authoritative HTTP301 Explore redirect and preserves the existing services redirect", async () => {
  const redirects = await nextConfig.redirects?.();
  assert.deepEqual(redirects?.find((rule) => rule.source === "/portfolio"), {
    source: "/portfolio",
    destination: "/explore",
    statusCode: 301,
  });
  assert.deepEqual(redirects?.find((rule) => rule.source === "/services"), {
    source: "/services",
    destination: "/pricing",
    permanent: true,
  });
  // Framework redirects run before page rendering; this is a same-target
  // permanent fallback rather than a second hop in the public redirect path.
  const route = await readFile("app/portfolio/page.tsx", "utf8");
  assert.match(route, /import \{ permanentRedirect \} from "next\/navigation"/);
  assert.match(route, /permanentRedirect\("\/explore"\)/);
  assert.doesNotMatch(route, /redirect\("\/about"\)|PortfolioPageContent/);
});
