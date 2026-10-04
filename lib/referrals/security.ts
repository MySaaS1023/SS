import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function key() {
  const secret = process.env.REFERRAL_DATA_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error(
      "REFERRAL_DATA_ENCRYPTION_KEY must contain at least 32 characters.",
    );
  }
  return createHash("sha256").update(secret).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decrypt(value: string) {
  const [iv, tag, encrypted] = value
    .split(".")
    .map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

export function encryptPayoutDetails(value: string) {
  return encrypt(value);
}

export function decryptPayoutDetails(value: string) {
  return decrypt(value);
}

export function encryptCustomerAccessToken(value: string) {
  return encrypt(value);
}

export function decryptCustomerAccessToken(value: string) {
  return decrypt(value);
}
