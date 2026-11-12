import assert from "node:assert/strict";
import test from "node:test";
import {
  archiveRequest,
  canPartnerRemoveReferral,
} from "../lib/referrals/archival";

test("archival requires supported kind, exact UUID and explicit record confirmation", () => {
  const recordId = "b3f8242a-fc65-4cf1-8c56-519c1839301a";
  assert.deepEqual(
    archiveRequest({
      kind: "application",
      recordId,
      confirmation: `ARCHIVE ${recordId}`,
    }),
    { kind: "application", recordId, confirmation: `ARCHIVE ${recordId}` },
  );
  for (const input of [
    null,
    {},
    { kind: "commission", recordId, confirmation: `ARCHIVE ${recordId}` },
    { kind: "application", recordId, confirmation: true },
    {
      kind: "application",
      recordId: "not-an-id",
      confirmation: "ARCHIVE not-an-id",
    },
  ])
    assert.equal(archiveRequest(input), null);
});
test("submitted partner referrals are never reclassified as removable drafts", () => {
  assert.equal(canPartnerRemoveReferral(), false);
});
