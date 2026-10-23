import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { isIP } from "node:net";

export type HandoffDetails = {
  businessName: string;
  websiteUrl: string;
  message: string | null;
};
export type HandoffContactDetails = {
  businessPhone: string;
  businessEmail: string;
  contactName: string;
  sourceReferralId: string | null;
};
export type HandoffInputDetails = HandoffDetails & HandoffContactDetails;
export type HandoffRow = HandoffInputDetails & {
  id: string;
  status: "active" | "inactive";
  createdAt: string;
  tokenHash: string;
  encryptedToken: string;
  createdBy: string;
};
export type AdminHandoff = HandoffInputDetails & {
  id: string;
  status: HandoffRow["status"];
  createdAt: string;
  url: string | null;
};
export class HandoffError extends Error {
  constructor(
    public code:
      | "unauthorized"
      | "validation"
      | "configuration"
      | "storage_unavailable"
      | "delivery_unavailable",
    message: string,
  ) {
    super(message);
    this.name = "HandoffError";
  }
}
export interface HandoffStore {
  insert(
    row: Omit<HandoffRow, "id" | "createdAt" | "status">,
  ): Promise<HandoffRow>;
  list(page?: number): Promise<HandoffRow[]>;
  findById(id: string): Promise<HandoffRow | null>;
  findActiveByHash(hash: string): Promise<HandoffRow | null>;
  deactivate(id: string, actorId: string): Promise<void>;
}
const invalid = (message: string): never => {
  throw new HandoffError("validation", message);
};
export function validateWebsiteUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048)
    return invalid("Enter a valid public HTTPS website URL.");
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return invalid("Enter a valid public HTTPS website URL.");
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  // No requests are made to this URL. Reject numeric/private and local names anyway.
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !host.includes(".") ||
    host === "localhost" ||
    /\.(localhost|local|internal|test|invalid)$/.test(host) ||
    isIP(host) !== 0 ||
    host.startsWith("[") ||
    /^\d+(\.\d+)*$/.test(host)
  ) {
    return invalid(
      "Enter a valid public HTTPS website URL without credentials.",
    );
  }
  return url.toString();
}
function plainText(value: unknown, label: string, max: number) {
  if (typeof value !== "string") return invalid(`Enter ${label}.`);
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized || normalized.length > max)
    return invalid(`Enter a valid ${label}.`);
  return normalized;
}
export function validateEmail(value: unknown): string {
  const email = plainText(value, "business email address", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return invalid("Enter a valid business email address.");
  return email;
}
export function validatePhone(value: unknown): string {
  const phone = plainText(value, "business phone number", 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15)
    return invalid("Enter a valid business phone number.");
  return phone;
}
export function validateDetails(input: unknown): HandoffInputDetails {
  if (!input || typeof input !== "object")
    return invalid("Enter the client details.");
  const data = input as Record<string, unknown>;
  if (typeof data.businessName !== "string")
    return invalid("Enter a client business name.");
  const businessName = data.businessName
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!businessName || businessName.length > 120)
    return invalid("Business name must be between 1 and 120 characters.");
  if (
    data.message !== undefined &&
    data.message !== null &&
    typeof data.message !== "string"
  )
    return invalid("Enter a plain text message.");
  const message =
    typeof data.message === "string"
      ? data.message
          .replace(/\r\n?/g, "\n")
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
          .trim()
      : "";
  if (message.length > 1500)
    return invalid("Personalized message must be 1500 characters or fewer.");
  return {
    businessName,
    businessPhone: validatePhone(data.businessPhone),
    businessEmail: validateEmail(data.businessEmail),
    contactName: plainText(data.contactName, "point of contact", 160),
    websiteUrl: validateWebsiteUrl(data.websiteUrl),
    message: message || null,
    sourceReferralId:
      typeof data.sourceReferralId === "string" && data.sourceReferralId
        ? (validateId(data.sourceReferralId), data.sourceReferralId)
        : null,
  };
}
export function validToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(token) &&
    Buffer.from(token, "base64url").toString("base64url") === token
  );
}
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function tokenKey(value: string | undefined): Buffer {
  if (!value || !/^[a-fA-F0-9]{64}$/.test(value))
    throw new HandoffError(
      "configuration",
      "Configure HANDOFF_TOKEN_ENCRYPTION_KEY before creating or copying handoff links.",
    );
  return Buffer.from(value, "hex");
}
export function encryptToken(token: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
  cipher.setAAD(Buffer.from("steady-start-handoff-v1"));
  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}
export function decryptToken(value: string, key: Buffer): string {
  try {
    if (
      !/^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{58}$/.test(
        value,
      )
    )
      throw new Error();
    const [version, iv, tag, ciphertext, extra] = value.split(".");
    if (version !== "v1" || extra !== undefined || !iv || !tag || !ciphertext)
      throw new Error();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(iv, "base64url"),
      { authTagLength: 16 },
    );
    decipher.setAAD(Buffer.from("steady-start-handoff-v1"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const token = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    if (!validToken(token)) throw new Error();
    return token;
  } catch {
    throw new HandoffError(
      "configuration",
      "This handoff link cannot be recovered with the configured encryption key.",
    );
  }
}
export function validateId(id: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    invalid("Invalid handoff identifier.");
}
export function getHandoffOrigin(value?: string) {
  try {
    const url = new URL(value || "https://www.steadystartco.com");
    if (
      url.username ||
      url.password ||
      (url.protocol !== "https:" &&
        !(
          url.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
        ))
    )
      throw new Error();
    return url.origin;
  } catch {
    throw new HandoffError(
      "configuration",
      "Configure a valid NEXT_PUBLIC_SITE_URL.",
    );
  }
}
const publicDetails = (row: HandoffRow): HandoffDetails => ({
  businessName: row.businessName,
  websiteUrl: row.websiteUrl,
  message: row.message,
});
export function createHandoffService(deps: {
  store: HandoffStore;
  authorize: () => Promise<{ id: string } | null>;
  encryptionKey?: string;
  origin?: string;
}) {
  async function authorize() {
    const actor = await deps.authorize();
    if (!actor)
      throw new HandoffError(
        "unauthorized",
        "Administrator access is required.",
      );
    return actor;
  }
  async function storage<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof HandoffError) throw error;
      throw new HandoffError(
        "storage_unavailable",
        "Handoff storage is unavailable. Check the database configuration and migration.",
      );
    }
  }
  function adminDetails(row: HandoffRow): AdminHandoff {
    let url: string | null = null;
    if (row.status === "active") {
      try {
        const token = decryptToken(
          row.encryptedToken,
          tokenKey(deps.encryptionKey),
        );
        if (hashToken(token) !== row.tokenHash) throw new Error();
        url = `${getHandoffOrigin(deps.origin)}/handoff/${token}`;
      } catch {
        /* Management and revocation remain available without a recoverable token. */
      }
    }
    return {
      ...publicDetails(row),
      businessPhone: row.businessPhone,
      businessEmail: row.businessEmail,
      contactName: row.contactName,
      sourceReferralId: row.sourceReferralId,
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      url,
    };
  }
  return {
    async create(input: unknown): Promise<AdminHandoff> {
      const actor = await authorize();
      const details = validateDetails(input);
      const key = tokenKey(deps.encryptionKey);
      getHandoffOrigin(deps.origin);
      const token = randomBytes(32).toString("base64url");
      const row = await storage(() =>
        deps.store.insert({
          ...details,
          tokenHash: hashToken(token),
          encryptedToken: encryptToken(token, key),
          createdBy: actor.id,
        }),
      );
      return adminDetails(row);
    },
    async list(page = 1): Promise<AdminHandoff[]> {
      await authorize();
      if (!Number.isInteger(page) || page < 1 || page > 100000)
        invalid("Enter a valid handoff page number.");
      return (await storage(() => deps.store.list(page)))
        .slice(0, 100)
        .map(adminDetails);
    },
    async preview(id: string): Promise<HandoffDetails | null> {
      await authorize();
      validateId(id);
      const row = await storage(() => deps.store.findById(id));
      return row ? publicDetails(row) : null;
    },
    async delivery(id: string): Promise<AdminHandoff | null> {
      await authorize();
      validateId(id);
      const row = await storage(() => deps.store.findById(id));
      return row ? adminDetails(row) : null;
    },
    async deactivate(id: string): Promise<void> {
      const actor = await authorize();
      validateId(id);
      await storage(() => deps.store.deactivate(id, actor.id));
    },
    async resolve(token: string): Promise<HandoffDetails | null> {
      if (!validToken(token)) return null;
      const row = await storage(() =>
        deps.store.findActiveByHash(hashToken(token)),
      );
      return row && row.status === "active" ? publicDetails(row) : null;
    },
  };
}
