import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategory,
  type ResourceMetadata,
  type PartnerResource,
} from "./types";
export { RESOURCE_CATEGORIES } from "./types";
export type {
  ResourceCategory,
  ResourceMetadata,
  PartnerResource,
  ResourceVersion,
} from "./types";

export const RESOURCE_BUCKET = "partner-resources";
export const MAX_RESOURCE_BYTES = 3 * 1024 * 1024;
export class ResourceError extends Error {
  constructor(
    public code: "validation" | "unauthorized" | "unavailable" | "conflict",
    message: string,
  ) {
    super(message);
    this.name = "ResourceError";
  }
}
export function uuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      value,
    )
  );
}
function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string")
    throw new ResourceError("validation", "Enter valid document information.");
  const result = value.trim();
  if (
    (required && !result) ||
    result.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)
  )
    throw new ResourceError(
      "validation",
      "Document information is missing or too long.",
    );
  return result;
}
export function validateMetadata(
  input: Record<string, unknown>,
): ResourceMetadata {
  const title = text(input.title, 160, true),
    description = text(input.description ?? "", 2000);
  if (!RESOURCE_CATEGORIES.includes(input.category as ResourceCategory))
    throw new ResourceError("validation", "Choose a document category.");
  if (
    input.classification !== "general" &&
    input.classification !== "completed_tax"
  )
    throw new ResourceError(
      "validation",
      "Choose a document privacy classification.",
    );
  const targetPartnerId =
    input.targetPartnerId === "" || input.targetPartnerId == null
      ? null
      : input.targetPartnerId;
  if (targetPartnerId !== null && !uuid(targetPartnerId))
    throw new ResourceError("validation", "Choose an existing partner.");
  if (input.classification === "completed_tax" && !targetPartnerId)
    throw new ResourceError(
      "validation",
      "Completed tax documents must be restricted to one partner.",
    );
  if (
    typeof input.published !== "boolean" ||
    typeof input.acknowledgmentRequired !== "boolean"
  )
    throw new ResourceError(
      "validation",
      "Choose valid publication and receipt settings.",
    );
  return {
    title,
    description,
    category: input.category as ResourceCategory,
    classification: input.classification,
    targetPartnerId,
    published: input.published,
    acknowledgmentRequired: input.acknowledgmentRequired,
  };
}
export function canPartnerAccess(
  resource: PartnerResource,
  partner: { id: string; status: string } | null,
) {
  return Boolean(
    partner?.status === "approved" &&
    resource.published &&
    (resource.target_partner_id === null ||
      resource.target_partner_id === partner.id) &&
    (resource.classification !== "completed_tax" ||
      resource.target_partner_id === partner.id),
  );
}
export function validateResourceChange(
  existing: Pick<PartnerResource, "classification" | "target_partner_id">,
  next: ResourceMetadata,
) {
  if (
    existing.classification === "completed_tax" &&
    (next.classification !== "completed_tax" ||
      next.targetPartnerId !== existing.target_partner_id)
  )
    throw new ResourceError(
      "validation",
      "Completed tax documents cannot change privacy or recipient. Create a separate document for another partner.",
    );
}
export function safeDownloadName(name: string) {
  return (
    name.replace(/[\r\n\u0000-\u001f\u007f"\\/]/g, "_").slice(0, 180) ||
    "document"
  );
}

// Validate DOCX ZIP structure without extracting files or executing document content.
function validateDocx(bytes: Buffer) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (bytes.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  if (
    end < 0 ||
    bytes.readUInt16LE(end + 4) !== 0 ||
    bytes.readUInt16LE(end + 6) !== 0
  )
    throw new Error();
  const count = bytes.readUInt16LE(end + 10),
    start = bytes.readUInt32LE(end + 16),
    centralSize = bytes.readUInt32LE(end + 12);
  if (
    !count ||
    count > 500 ||
    start + centralSize !== end ||
    bytes.readUInt16LE(end + 8) !== count ||
    end + 22 + bytes.readUInt16LE(end + 20) !== bytes.length
  )
    throw new Error();
  let cursor = start,
    expanded = 0;
  const names = new Set<string>();
  let contentTypes = "";
  for (let n = 0; n < count; n++) {
    if (cursor + 46 > end || bytes.readUInt32LE(cursor) !== 0x02014b50)
      throw new Error();
    const flags = bytes.readUInt16LE(cursor + 8),
      method = bytes.readUInt16LE(cursor + 10),
      compressed = bytes.readUInt32LE(cursor + 20),
      size = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28),
      extra = bytes.readUInt16LE(cursor + 30),
      comment = bytes.readUInt16LE(cursor + 32),
      local = bytes.readUInt32LE(cursor + 42);
    if (
      cursor + 46 + nameLength + extra + comment > end ||
      flags & 1 ||
      ![0, 8].includes(method) ||
      size > MAX_RESOURCE_BYTES ||
      size > Math.max(1024, compressed * 100)
    )
      throw new Error();
    const name = bytes
      .subarray(cursor + 46, cursor + 46 + nameLength)
      .toString("utf8");
    if (
      !name ||
      names.has(name) ||
      /(^\/|\\|(^|\/)\.\.(\/|$)|[\u0000-\u001f])/.test(name) ||
      /vbaproject|activex|embeddings|\.exe$|\.js$/i.test(name)
    )
      throw new Error();
    names.add(name);
    expanded += size;
    if (expanded > MAX_RESOURCE_BYTES * 3) throw new Error();
    if (
      local + 30 > start ||
      bytes.readUInt32LE(local) !== 0x04034b50 ||
      bytes.readUInt16LE(local + 6) !== flags ||
      bytes.readUInt16LE(local + 8) !== method
    )
      throw new Error();
    const localNameLength = bytes.readUInt16LE(local + 26),
      localExtra = bytes.readUInt16LE(local + 28),
      dataStart = local + 30 + localNameLength + localExtra;
    if (
      bytes
        .subarray(local + 30, local + 30 + localNameLength)
        .toString("utf8") !== name ||
      dataStart + compressed > start
    )
      throw new Error();
    const data = bytes.subarray(dataStart, dataStart + compressed);
    const decoded =
      method === 0
        ? data
        : inflateRawSync(data, { maxOutputLength: MAX_RESOURCE_BYTES });
    if (decoded.length !== size) throw new Error();
    if (name.endsWith(".xml") || name.endsWith(".rels")) {
      const rawXml = new TextDecoder("utf-8", { fatal: true }).decode(decoded);
      if (rawXml.includes("\u0000")) throw new Error();
      const xml = rawXml.replace(
        /&#(?:x([\da-f]+)|(\d+));/gi,
        (_, hex: string | undefined, decimal: string | undefined) =>
          String.fromCodePoint(parseInt(hex ?? decimal!, hex ? 16 : 10)),
      );
      if (
        /<!DOCTYPE|<!ENTITY|macroEnabled|vbaProject|oleObject|TargetMode\s*=\s*["']External/i.test(
          xml,
        )
      )
        throw new Error();
      if (name === "[Content_Types].xml") contentTypes = xml;
    }
    cursor += 46 + nameLength + extra + comment;
  }
  if (
    cursor !== end ||
    !names.has("[Content_Types].xml") ||
    !names.has("word/document.xml") ||
    !contentTypes.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    )
  )
    throw new Error();
}
export function validateResourceFile(name: string, bytes: Buffer) {
  if (!bytes.length || bytes.length > MAX_RESOURCE_BYTES)
    throw new ResourceError("validation", "Choose a document of 3 MB or less.");
  const extension = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  let mime: string;
  try {
    if (extension === "pdf") {
      const source = bytes
        .toString("latin1")
        .replace(/#([a-f\d]{2})/gi, (_, hex: string) =>
          String.fromCharCode(parseInt(hex, 16)),
        );
      if (
        !source.startsWith("%PDF-") ||
        !/%%EOF\s*$/.test(source) ||
        /\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction|AA)\b/i.test(
          source,
        )
      )
        throw new Error();
      mime = "application/pdf";
    } else if (extension === "docx") {
      validateDocx(bytes);
      mime =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (extension === "txt") {
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(decoded))
        throw new Error();
      mime = "text/plain";
    } else throw new Error();
  } catch {
    throw new ResourceError(
      "validation",
      "Upload a valid PDF, macro-free DOCX without embedded/external content, or UTF-8 TXT document. Active documents and archives are not accepted.",
    );
  }
  return {
    extension: extension!,
    mime,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    filename: safeDownloadName(name),
    byteSize: bytes.length,
  };
}
