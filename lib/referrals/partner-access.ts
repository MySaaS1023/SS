import { randomBytes } from "node:crypto";

import type { User } from "@supabase/supabase-js";

export function generateTemporaryPartnerPassword() {
  return `${randomBytes(24).toString("base64url")}!Aa9`;
}

export function partnerMustChangePassword(user: Pick<User, "app_metadata">) {
  return user.app_metadata?.must_change_password === true;
}
