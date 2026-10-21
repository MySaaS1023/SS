import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CompletionCard } from "../components/handoff/completion-card";
import { isHandoffScreen } from "../lib/handoff/privacy";
import { socialLinks } from "../lib/social-links";

test("completion design renders escaped client details and only configured calls to action", () => {
  const html = renderToStaticMarkup(
    createElement(CompletionCard, {
      details: {
        businessName: "Apex <script>alert(1)</script>",
        websiteUrl: "https://www.apexlhservices.com/",
        message: "Thank you, Apex!\n<script>unsafe()</script>",
      },
    }),
  );
  assert.match(html, /Your website is ready/);
  assert.match(html, /Apex &lt;script&gt;/);
  assert.match(html, /Thank you, Apex!/);
  assert.doesNotMatch(
    html,
    /<script>|Leave a Google review|token_hash|encryptedToken|createdBy/,
  );
  assert.match(html, /href="https:\/\/www.apexlhservices.com\/"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /referrerPolicy="no-referrer"/i);
  for (const label of ["Facebook", "YouTube", "TikTok"])
    assert.match(html, new RegExp(label));
});

test("default completion remains useful without a personalized message or Google profile", () => {
  const html = renderToStaticMarkup(
    createElement(CompletionCard, {
      details: {
        businessName: "Future Client",
        websiteUrl: "https://example.com/",
        message: null,
      },
    }),
  );
  assert.match(html, /Visit your website/);
  assert.match(html, /Thank you for choosing Steady Start LLC/);
  assert.doesNotMatch(
    html,
    /A note from Steady Start|Share your experience|Leave a Google review/,
  );
});

test("handoff privacy exclusions are scoped to feature screens", () => {
  for (const path of [
    "/handoff",
    "/handoff/opaque-token",
    "/admin/handoffs",
    "/admin/handoffs/id/preview",
  ]) {
    assert.equal(isHandoffScreen(path), true);
  }
  for (const path of [
    "/",
    "/pricing",
    "/get-started/token",
    "/ref/example",
    "/admin/referral-program",
    "/handoff-other",
  ]) {
    assert.equal(isHandoffScreen(path), false);
  }
});

test("completion offers a neutral review request only for configured verified eligibility", () => {
  const previous = { ...socialLinks };
  try {
    socialLinks.googleReviewUrl =
      "https://g.page/r/isolated-test-fixture/review";
    socialLinks.googleBusinessProfileVerifiedEligible = true;
    const html = renderToStaticMarkup(
      createElement(CompletionCard, {
        details: {
          businessName: "Fixture",
          websiteUrl: "https://example.com/",
          message: null,
        },
      }),
    );
    assert.match(html, /Leave a Google review/);
    assert.match(html, /Your honest feedback/);
    assert.doesNotMatch(html, /five.star|5.star|discount/i);
  } finally {
    Object.assign(socialLinks, previous);
  }
});
