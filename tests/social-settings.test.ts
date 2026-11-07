import assert from "node:assert/strict";
import test from "node:test";
import {
  getGoogleProfileUrl,
  getGoogleReviewUrl,
  getHandoffSocialLinks,
  socialLinks,
} from "../lib/social-links";
import {
  createSocialSettingsService,
  SocialSettingsError,
  validateSocialSettings,
} from "../lib/social-settings-core";

const settingsInput = () => ({
  ...socialLinks,
  businessAccountsConfirmed: true,
});
test("social settings validate supported HTTPS hosts without credentials or lookalikes", () => {
  assert.equal(
    validateSocialSettings(settingsInput()).facebook,
    socialLinks.facebook,
  );
  for (const facebook of [
    "http://facebook.com/business",
    "https://facebook.com.evil.example/business",
    "https://user:pass@facebook.com/business",
    "javascript:alert(1)",
    "https://facebook.com:444/business",
  ]) {
    assert.throws(
      () => validateSocialSettings({ ...settingsInput(), facebook }),
      SocialSettingsError,
    );
  }
  assert.throws(
    () =>
      validateSocialSettings({
        ...settingsInput(),
        businessAccountsConfirmed: false,
      }),
    SocialSettingsError,
  );
  assert.equal(
    validateSocialSettings({
      ...settingsInput(),
      instagram: "https://www.instagram.com/examplebusiness/",
    }).instagram,
    "https://www.instagram.com/examplebusiness/",
  );
  assert.equal(
    getHandoffSocialLinks({ ...socialLinks, instagram: null }).some(
      (link) => link.label === "Instagram",
    ),
    false,
  );
});
test("profile identity verification never publishes a listing as a direct review URL", () => {
  assert.equal(
    getGoogleProfileUrl(socialLinks),
    "https://share.google/3EiiW6pSc2CoKitRs",
  );
  assert.equal(
    getGoogleReviewUrl({
      ...socialLinks,
      googleReviewUrl: null,
      googleBusinessProfileVerifiedEligible: false,
    }),
    null,
  );
  assert.throws(
    () =>
      validateSocialSettings({
        ...settingsInput(),
        googleReviewUrl: "https://share.google/3EiiW6pSc2CoKitRs",
        googleBusinessProfileVerifiedEligible: true,
      }),
    SocialSettingsError,
  );
  const direct = {
    ...settingsInput(),
    googleReviewUrl: "https://g.page/r/official-reviewed-token/review",
    googleBusinessProfileVerifiedEligible: false,
  };
  assert.equal(getGoogleReviewUrl(validateSocialSettings(direct)), null);
  assert.equal(
    getGoogleReviewUrl(
      validateSocialSettings({
        ...direct,
        googleBusinessProfileVerifiedEligible: true,
      }),
    ),
    direct.googleReviewUrl,
  );
  assert.equal(
    getGoogleProfileUrl({
      ...socialLinks,
      googleBusinessProfileVerified: false,
    }),
    null,
  );
});
test("admin read and save authorize before any storage access", async () => {
  let calls = 0;
  const service = createSocialSettingsService({
    authorize: async () => null,
    store: {
      read: async () => {
        calls++;
        return { settings: socialLinks, version: 1, updatedAt: null };
      },
      update: async () => {
        calls++;
        return true;
      },
    },
  });
  await assert.rejects(() => service.read(), /Administrator/);
  await assert.rejects(() => service.save(settingsInput(), 1), /Administrator/);
  assert.equal(calls, 0);
});
test("settings saves use explicit expected version and reject lost updates", async () => {
  let version = 4;
  let actor = "";
  const service = createSocialSettingsService({
    authorize: async () => ({ id: "authorized-admin" }),
    store: {
      read: async () => ({ settings: socialLinks, version, updatedAt: null }),
      update: async (_settings, expected, userId) => {
        actor = userId;
        if (expected !== version) return false;
        version++;
        return true;
      },
    },
  });
  assert.equal((await service.read()).version, 4);
  await service.save(settingsInput(), 4);
  assert.equal(actor, "authorized-admin");
  assert.equal(version, 5);
  await assert.rejects(
    () => service.save(settingsInput(), 4),
    /changed elsewhere/,
  );
  await assert.rejects(() => service.save(settingsInput(), 0), /Refresh/);
  await assert.rejects(
    () => service.save(settingsInput(), 2147483647),
    /Refresh/,
  );
});
