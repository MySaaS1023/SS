import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConnectContent } from "../components/connect/connect-content";
import { CompletionCard } from "../components/handoff/completion-card";
import { socialLinks, type SocialLinkSettings } from "../lib/social-links";

const fixture = (
  overrides: Partial<SocialLinkSettings> & {
    instagram?: string | null;
    googleBusinessProfileUrl?: string | null;
    googleBusinessProfileVerified?: boolean;
  } = {},
) => ({
  ...socialLinks,
  googleReviewUrl: null,
  googleBusinessProfileVerifiedEligible: false,
  googleBusinessProfileUrl: null,
  googleBusinessProfileVerified: false,
  ...overrides,
});
const renderConnect = (settings: SocialLinkSettings) =>
  renderToStaticMarkup(createElement(ConnectContent, { settings }));

test("connect is a standalone branded experience without customer forms or handoff data", () => {
  const html = renderConnect(fixture());
  assert.match(html, /<h1>Stay Connected<\/h1>/);
  assert.match(html, /Your feedback means a lot to us!/);
  assert.match(html, /direct Google review link is not available yet/);
  assert.match(html, /Facebook — Follow Us/);
  assert.match(html, /YouTube — Subscribe/);
  assert.doesNotMatch(
    html,
    /<form|handoff\/|referral|businessEmail|contactName|token_hash|encryptedToken/i,
  );
});

test("unconfigured or unverified Google destinations do not publish a review action", () => {
  for (const settings of [
    fixture(),
    fixture({ googleReviewUrl: "https://g.page/r/test-only/review" }),
    fixture({
      googleBusinessProfileVerifiedEligible: true,
      googleReviewUrl: "https://untrusted.example/review",
    }),
  ]) {
    const html = renderConnect(settings);
    assert.match(html, /direct Google review link is not available yet/);
    assert.doesNotMatch(html, /> Leave a Google Review/);
    assert.doesNotMatch(html, /href="https:\/\/untrusted/);
  }
});

test("a verified profile remains a profile link and never masquerades as a direct review", () => {
  const profile = "https://share.google/isolated-profile-fixture";
  const unverified = renderConnect(
    fixture({ googleBusinessProfileUrl: profile }),
  );
  assert.doesNotMatch(unverified, /href="https:\/\/share.google/);
  const verified = renderConnect(
    fixture({
      googleBusinessProfileUrl: profile,
      googleBusinessProfileVerified: true,
    }),
  );
  assert.match(verified, /Visit our Google Business Profile/);
  assert.match(
    verified,
    /href="https:\/\/share.google\/isolated-profile-fixture"/,
  );
  assert.doesNotMatch(verified, /> Leave a Google Review/);
});

test("the same configured official Google action is prominent and independent of private feedback", () => {
  const review = "https://g.page/r/isolated-review-fixture/review";
  const settings = fixture({
    googleReviewUrl: review,
    googleBusinessProfileVerifiedEligible: true,
  });
  const html = renderConnect(settings);
  assert.match(
    html,
    /href="https:\/\/g.page\/r\/isolated-review-fixture\/review"/,
  );
  assert.match(html, /Leave a Google Review/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /referrerPolicy="no-referrer"/i);
  const handoff = renderToStaticMarkup(
    createElement(CompletionCard, {
      details: {
        businessName: "Synthetic Client",
        websiteUrl: "https://example.com/",
        message: "Thank you!",
      },
      socialSettings: settings,
      feedbackToken: "isolated-form-token",
    }),
  );
  assert.match(handoff, /We&#x27;d Love Your Feedback!/);
  assert.match(handoff, /Leave a Google Review/);
  assert.match(handoff, /Leave Us a Review/);
  assert.match(handoff, /name="rating"/);
  assert.match(handoff, /Submit Review/);
  assert.ok(
    handoff.indexOf("Visit your website") <
      handoff.indexOf("Leave a Google Review"),
  );
  assert.ok(
    handoff.indexOf("Leave a Google Review") <
      handoff.indexOf("social-heading"),
  );
});

test("configured business platforms use separate recognizable icons and safe external actions", () => {
  const html = renderConnect(
    fixture({
      facebook: "https://www.facebook.com/example-business",
      youtube: "https://www.youtube.com/@example-business",
      instagram: "https://www.instagram.com/example-business/",
      tiktok: "https://www.tiktok.com/@example-business",
    }),
  );
  for (const label of [
    "Facebook — Follow Us",
    "YouTube — Subscribe",
    "Instagram — Follow Us",
    "TikTok — Follow Us",
  ])
    assert.match(html, new RegExp(label));
  assert.ok((html.match(/<svg/g) || []).length >= 5);
  assert.ok((html.match(/rel="noopener noreferrer"/g) || []).length >= 4);
  const noInstagram = renderConnect(fixture({ instagram: null }));
  assert.doesNotMatch(noInstagram, /Instagram — Follow Us/);
});
