import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNoIndexMetadata,
  buildPageMetadata,
  organizationStructuredData,
  publicPageMetadata,
  publicPageSeo,
  serializeStructuredData,
  servicesStructuredData,
  SITE_URL,
} from "../lib/seo";
import { seoPages } from "../lib/seo-pages";
import { serviceOfferings, supportEmail } from "../lib/site-data";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

test("indexable public pages have unique titles, descriptions and matching self-canonical social URLs", () => {
  const titles = new Set();
  const descriptions = new Set();
  const pages = [
    ...Object.keys(publicPageSeo).map((path) =>
      publicPageMetadata(path as keyof typeof publicPageSeo),
    ),
    ...Object.values(seoPages).map((page) =>
      buildPageMetadata(`/${page.slug}`, page.title, page.description),
    ),
  ];
  for (const page of pages) {
    assert.ok(page.title);
    assert.ok(page.description);
    assert.ok(!titles.has(page.title));
    assert.ok(!descriptions.has(page.description));
    titles.add(page.title);
    descriptions.add(page.description);
    const canonical = String(page.alternates?.canonical);
    assert.ok(canonical.startsWith(`${SITE_URL}/`));
    assert.equal(new URL(canonical).search, "");
    assert.equal(new URL(canonical).hash, "");
    const og = page.openGraph as { url: string; title: string; description: string };
    assert.equal(og.url, canonical);
    assert.equal(og.title, page.title);
    assert.equal(og.description, page.description);
    assert.equal(page.twitter?.title, page.title);
    assert.equal(page.twitter?.description, page.description);
  }
});

test("conversion metadata does not inherit a public homepage canonical or share card", () => {
  const page = buildNoIndexMetadata("Project Intake", "Private project flow.");
  assert.deepEqual(page.robots, { index: false, follow: false, noarchive: true });
  assert.equal(page.alternates?.canonical, null);
  assert.equal(page.openGraph, null);
  assert.equal(page.twitter, null);
});

test("metadata describes actual small business services and avoids unconditional platform cost or fit promises", () => {
  const home = publicPageMetadata("/");
  assert.match(String(home.title), /Small Business Websites/);
  assert.match(String(home.description), /booking and payment integrations/);
  assert.match(String(home.description), /AI automation/);
  const contact = publicPageMetadata("/contact");
  assert.match(String(contact.description), /for Mesa, Arizona small businesses/);
  for (const slug of ["website-without-monthly-fees", "shopify-alternative", "custom-website-vs-shopify"] as const) {
    assert.doesNotMatch(`${seoPages[slug].title} ${seoPages[slug].description}`, /without monthly|better fit/i);
  }
});

test("sitemap is the curated indexable public set, with no login, token, conversion URL or fabricated freshness", () => {
  const entries = sitemap();
  const expected = [
    ...Object.keys(publicPageSeo),
    ...Object.values(seoPages).map((page) => `/${page.slug}`),
  ].map((path) => new URL(path, SITE_URL).href);
  assert.deepEqual(entries.map((entry) => entry.url).sort(), expected.sort());
  assert.equal(new Set(expected).size, expected.length);
  for (const entry of entries) {
    assert.equal(entry.lastModified, undefined);
    assert.doesNotMatch(
      new URL(entry.url).pathname,
      /^\/(?:admin|partner|auth|api|handoff|get-started|referral-intake|consultation|success|cancel|portfolio)(?:\/|$)|^\/referral-partners\/apply$/,
    );
  }
});

test("robots permits HTML crawling to observe noindex and excludes API crawl only", () => {
  const value = robots();
  assert.deepEqual(value.rules, {
    userAgent: "*",
    allow: "/",
    disallow: "/api/",
  });
  assert.equal(value.sitemap, `${SITE_URL}/sitemap.xml`);
});

test("Organization uses only verified public business identity, without fabricated local or review claims", () => {
  const value = organizationStructuredData();
  assert.equal(value["@type"], "Organization");
  assert.equal(value.name, "Steady Start LLC");
  assert.equal(value.url, SITE_URL);
  assert.equal(value.email, supportEmail);
  assert.equal(value.logo, `${SITE_URL}/brand/steady-start-browser-lockup-original.png`);
  for (const forbidden of ["address", "aggregateRating", "review", "award", "areaServed", "telephone"])
    assert.ok(!(forbidden in value));
});

test("Organization sameAs contains exactly the five approved public profiles without changing existing identity", () => {
  const value = organizationStructuredData();
  assert.deepEqual(value.sameAs, [
    "https://www.facebook.com/profile.php?id=61589843720808",
    "https://www.instagram.com/steadystartllc/",
    "https://www.tiktok.com/@steadystartco",
    "https://www.youtube.com/channel/UCuVyP9rYxYh0I06v67GH6tg",
    "https://share.google/3EiiW6pSc2CoKitRs",
  ]);
  assert.equal(new Set(value.sameAs).size, value.sameAs.length);
  for (const url of value.sameAs) assert.equal(new URL(url).protocol, "https:");
  const { sameAs, ...identity } = JSON.parse(serializeStructuredData(value));
  assert.deepEqual(sameAs, value.sameAs);
  assert.deepEqual(identity, {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Steady Start LLC",
    url: SITE_URL,
    email: supportEmail,
    logo: `${SITE_URL}/brand/steady-start-browser-lockup-original.png`,
  });
});

test("Service schema derives all names and numeric prices from canonical package data; custom quotes are not invented numeric offers", () => {
  const graph = servicesStructuredData()["@graph"];
  assert.equal(graph.length, serviceOfferings.length);
  for (const service of serviceOfferings) {
    const entry = graph.find((item) => item.name === service.name)!;
    assert.ok(entry);
    assert.equal(entry.provider["@id"], `${SITE_URL}/#organization`);
    if (service.price === "Custom Quote") {
      assert.equal(entry.offers, undefined);
    } else {
      assert.equal(entry.offers?.price, service.price.slice(1));
      assert.equal(entry.offers?.priceCurrency, "USD");
      assert.equal(entry.offers?.url, `${SITE_URL}/pricing`);
    }
  }
  assert.deepEqual(graph.flatMap((entry) => entry.offers?.price ?? []).sort(), ["319", "599"]);
});

test("structured data serialization prevents script-tag breakout without changing parsed values", () => {
  const value = { name: "</script><script>alert('example')</script>" };
  const json = serializeStructuredData(value);
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), value);
});
