import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  launchPackageOptions,
  resolveServiceKey,
  serviceOfferings,
} from "../lib/site-data";

const source = (path: string) => readFile(path, "utf8");

test("canonical packages use the approved names, prices, and shared intake routes", () => {
  const byKey = Object.fromEntries(
    serviceOfferings.map((offering) => [offering.key, offering]),
  );
  assert.equal(byKey["standard-website"].name, "Standard Website Package");
  assert.equal(byKey["standard-website"].price, "$319");
  assert.equal(
    byKey["standard-website"].href,
    "/get-started?service=standard-website",
  );
  assert.equal(byKey["premium-website"].name, "Premium Website Package");
  assert.equal(byKey["premium-website"].price, "$599");
  assert.equal(
    byKey["premium-website"].href,
    "/get-started?service=premium-website",
  );
  assert.equal(
    byKey["business-setup"].href,
    "/get-started?service=business-setup",
  );
  assert.equal(
    byKey["complete-business-launch"].href,
    "/get-started?service=complete-business-launch",
  );
});

test("legacy public slugs remain safe aliases without duplicating package data", () => {
  assert.equal(resolveServiceKey("custom-website-bundle"), "standard-website");
  assert.equal(
    resolveServiceKey("custom-website-plus-bundle"),
    "premium-website",
  );
  assert.equal(resolveServiceKey("Custom Website Bundle"), "standard-website");
  assert.equal(
    resolveServiceKey("Complete Business Bundle"),
    "premium-website",
  );
  assert.equal(resolveServiceKey("unknown"), undefined);
  assert.equal(serviceOfferings.length, 4);
});

test("complete launch offers both website tiers and not-sure choice", () => {
  assert.deepEqual(
    launchPackageOptions.map((option) => option.label),
    [
      "Business Setup + Standard Website",
      "Business Setup + Premium Website",
      "Not Sure Yet",
    ],
  );
});

test("navigation and service CTAs all enter the shared intake flow", async () => {
  const [header, form, directPage, securePage, customerOptions] =
    await Promise.all([
      source("components/site-header.tsx"),
      source("components/intake-form.tsx"),
      source("app/get-started/page.tsx"),
      source("app/get-started/[token]/page.tsx"),
      source("components/referrals/customer-options.tsx"),
    ]);
  assert.match(header, /Start Here/);
  assert.doesNotMatch(header, /Work With Me/);
  assert.match(directPage, /resolveServiceKey/);
  assert.match(form, /Which launch package are you interested in\?/);
  assert.match(form, /customerHandoffToken/);
  assert.match(securePage, /initialValues/);
  assert.match(customerOptions, /service_selected/);
  assert.doesNotMatch(customerOptions, /href=["']#["']/);
});

test("secure intake validates the handoff token server-side and preserves referral ownership", async () => {
  const route = await source("app/api/send-project/route.ts");
  assert.match(route, /hashCustomerAccessToken\(customerHandoffToken\)/);
  assert.match(route, /secureReferral \?\? emailReferral/);
  assert.match(route, /customer_access_token_expires_at/);
  assert.match(
    route,
    /eventKey: `service_selected:\$\{linkedReferralId\}:\$\{selectedServiceKey\}`/,
  );
});
