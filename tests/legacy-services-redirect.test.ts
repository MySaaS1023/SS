import assert from "node:assert/strict";
import test from "node:test";
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";
import nextConfig from "../next.config";

test("obsolete services URL permanently redirects to the existing service packages without a loop", async () => {
  const response = await unstable_getResponseFromNextConfig({
    url: "https://www.steadystartco.com/services",
    nextConfig,
  });
  assert.equal(response.status, 308);
  assert.equal(getRedirectUrl(response), "https://www.steadystartco.com/pricing");
  const target = await unstable_getResponseFromNextConfig({
    url: getRedirectUrl(response)!,
    nextConfig,
  });
  assert.equal(getRedirectUrl(target), null);
});

test("legacy services redirect preserves referral and campaign parameters", async () => {
  const response = await unstable_getResponseFromNextConfig({
    url: "https://www.steadystartco.com/services?ref=synthetic-partner&utm_source=synthetic",
    nextConfig,
  });
  assert.equal(response.status, 308);
  const target = new URL(getRedirectUrl(response)!);
  assert.equal(target.origin, "https://www.steadystartco.com");
  assert.equal(target.pathname, "/pricing");
  assert.equal(target.hash, "");
  assert.equal(target.searchParams.get("ref"), "synthetic-partner");
  assert.equal(target.searchParams.get("utm_source"), "synthetic");
});

test("services cleanup does not redirect valid pages, package intake or unrelated missing URLs", async () => {
  for (const path of ["/pricing", "/website-without-monthly-fees", "/privacy", "/terms", "/referral-partners", "/get-started?service=complete-business-launch", "/platform", "/&", "/services/unrelated"]) {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://www.steadystartco.com${path}`,
      nextConfig,
    });
    assert.equal(getRedirectUrl(response), null, path);
  }
});
