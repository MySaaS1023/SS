import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import * as core from "../lib/partner-resources/core";
import type {
  PartnerResource,
  ResourceMetadata,
} from "../lib/partner-resources/types";

const resourceId = "11111111-1111-4111-8111-111111111111",
  partnerId = "22222222-2222-4222-8222-222222222222",
  versionId = "33333333-3333-4333-8333-333333333333",
  otherId = "44444444-4444-4444-8444-444444444444";
const resource: PartnerResource = {
  id: resourceId,
  title: "Synthetic resource",
  description: "",
  category: "Other Resources",
  classification: "general",
  target_partner_id: null,
  published: true,
  acknowledgment_required: false,
  current_version_id: versionId,
  revision: 1,
  updated_at: "",
  created_at: "",
};
const metadata: ResourceMetadata = {
  title: "Policy",
  description: "",
  category: "Policies",
  classification: "general",
  targetPartnerId: null,
  published: false,
  acknowledgmentRequired: false,
};

test("resource publication and approval are required independently", () => {
  assert.equal(
    core.canPartnerAccess(resource, { id: partnerId, status: "approved" }),
    true,
  );
  for (const status of ["pending", "rejected", "suspended"])
    assert.equal(
      core.canPartnerAccess(resource, { id: partnerId, status }),
      false,
    );
  assert.equal(core.canPartnerAccess(resource, null), false);
  assert.equal(
    core.canPartnerAccess(
      { ...resource, published: false },
      { id: partnerId, status: "approved" },
    ),
    false,
  );
});
test("targeted resources and completed tax documents never cross partners", () => {
  for (const classification of ["general", "completed_tax"] as const) {
    const targeted = {
      ...resource,
      classification,
      target_partner_id: partnerId,
    };
    assert.equal(
      core.canPartnerAccess(targeted, { id: partnerId, status: "approved" }),
      true,
    );
    assert.equal(
      core.canPartnerAccess(targeted, { id: otherId, status: "approved" }),
      false,
    );
  }
  assert.equal(
    core.canPartnerAccess(
      { ...resource, classification: "completed_tax" },
      { id: partnerId, status: "approved" },
    ),
    false,
  );
});
test("tax metadata requires explicit recipient and valid bounded fields", () => {
  assert.throws(() =>
    core.validateMetadata({ ...metadata, classification: "completed_tax" }),
  );
  assert.equal(
    core.validateMetadata({
      ...metadata,
      classification: "completed_tax",
      targetPartnerId: partnerId,
    }).targetPartnerId,
    partnerId,
  );
  for (const bad of [
    { title: "" },
    { title: "x".repeat(161) },
    { description: "x".repeat(2001) },
    { category: "Invented legal terms" },
    { published: "true" },
    { targetPartnerId: "../../other" },
  ])
    assert.throws(() => core.validateMetadata({ ...metadata, ...bad }));
});
test("completed tax privacy cannot be downgraded or retargeted on edit or replace", () => {
  const existing = {
    classification: "completed_tax" as const,
    target_partner_id: partnerId,
  };
  assert.throws(() =>
    core.validateResourceChange(existing, {
      ...metadata,
      targetPartnerId: partnerId,
    }),
  );
  assert.throws(() =>
    core.validateResourceChange(existing, {
      ...metadata,
      classification: "completed_tax",
      targetPartnerId: otherId,
    }),
  );
  assert.doesNotThrow(() =>
    core.validateResourceChange(existing, {
      ...metadata,
      classification: "completed_tax",
      targetPartnerId: partnerId,
      published: true,
    }),
  );
  assert.doesNotThrow(() =>
    core.validateResourceChange(existing, {
      ...metadata,
      classification: "completed_tax",
      targetPartnerId: partnerId,
      published: false,
    }),
  );
});
test("only bounded signature-checked PDF and safe UTF-8 TXT are accepted", () => {
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
  );
  assert.equal(
    core.validateResourceFile("Policy.PDF", pdf).mime,
    "application/pdf",
  );
  assert.equal(
    core.validateResourceFile(
      "Notes.txt",
      Buffer.from("Approved synthetic document\n"),
    ).mime,
    "text/plain",
  );
  for (const [name, bytes] of [
    ["bad.exe", pdf],
    ["bad.pdf", Buffer.from("not PDF")],
    ["bad.txt", Buffer.from([0xff])],
    ["bad.txt", Buffer.from([0])],
    ["empty.pdf", Buffer.alloc(0)],
    ["large.txt", Buffer.alloc(core.MAX_RESOURCE_BYTES + 1)],
  ] as [string, Buffer][])
    assert.throws(() => core.validateResourceFile(name, bytes));
  for (const active of [
    "/JavaScript",
    "/JS",
    "/Launch",
    "/EmbeddedFile",
    "/#4AavaScript",
    "/OpenAction",
  ])
    assert.throws(() =>
      core.validateResourceFile(
        "bad.pdf",
        Buffer.from(`%PDF-1.4\n${active} true\n%%EOF`),
      ),
    );
});
function zip(entries: [string, string][]) {
  const files: Buffer[] = [],
    directory: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const n = Buffer.from(name),
      b = Buffer.from(content),
      local = Buffer.alloc(30),
      central = Buffer.alloc(46);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(b.length, 18);
    local.writeUInt32LE(b.length, 22);
    local.writeUInt16LE(n.length, 26);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(b.length, 20);
    central.writeUInt32LE(b.length, 24);
    central.writeUInt16LE(n.length, 28);
    central.writeUInt32LE(offset, 42);
    files.push(local, n, b);
    directory.push(central, n);
    offset += local.length + n.length + b.length;
  }
  const d = Buffer.concat(directory),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(d.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...files, d, end]);
}
const docxEntries: [string, string][] = [
  [
    "[Content_Types].xml",
    '<Types><Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" /></Types>',
  ],
  [
    "word/document.xml",
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body /></w:document>',
  ],
];
test("DOCX requires Word structure and rejects archives, macros, traversal, external links, XML entities", () => {
  assert.equal(
    core.validateResourceFile("Training.docx", zip(docxEntries)).mime,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  for (const extra of [
    ["word/vbaProject.bin", "macro"],
    ["../escape.txt", "no"],
    [
      "word/_rels/document.xml.rels",
      '<Relationship TargetMode="External" Target="https://example.invalid"/>',
    ],
    [
      "word/_rels/document.xml.rels",
      '<Relationship TargetMode="E&#x78;ternal"/>',
    ],
    ["word/document2.xml", '<!DOCTYPE x [<!ENTITY y "z">]><x/>'],
  ] as [string, string][])
    assert.throws(() =>
      core.validateResourceFile("bad.docx", zip([...docxEntries, extra])),
    );
  assert.throws(() =>
    core.validateResourceFile(
      "archive.docx",
      zip([["notword.txt", "not DOCX"]]),
    ),
  );
  const corrupt = zip(docxEntries);
  corrupt.writeUInt32LE(0xffffffff, corrupt.length - 6);
  assert.throws(() => core.validateResourceFile("corrupt.docx", corrupt));
});
test("download filename cannot inject response headers or paths", () =>
  assert.equal(
    core.safeDownloadName('bad\r\nX-Test: yes/..\\file".pdf'),
    "bad__X-Test: yes_.._file_.pdf",
  ));

type MockServer = {
  downloadResource: (
    id: string,
    version: string | null,
  ) => Promise<{ blob: Blob; filename: string }>;
  adminResources: () => Promise<unknown>;
};
function loadServer(
  options: {
    approved?: boolean;
    admin?: boolean;
    published?: boolean;
    target?: string | null;
    revokeDuringDownload?: boolean;
    suspendDuringDownload?: boolean;
  } = {},
) {
  const loaded: { exports: unknown } = { exports: {} };
  let databaseCalls = 0,
    storageCalls = 0,
    partnerChecks = 0,
    rowChecks = 0;
  const row = {
    ...resource,
    published: options.published ?? true,
    target_partner_id: options.target ?? null,
  };
  const context = {
    user: { id: otherId },
    partner: { id: partnerId, status: "approved" },
  };
  const db = {
    from(table: string) {
      databaseCalls++;
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        async maybeSingle() {
          if (table === "partner_resources") {
            rowChecks++;
            return {
              data: {
                ...row,
                published:
                  row.published &&
                  !(options.revokeDuringDownload && rowChecks > 1),
              },
              error: null,
            };
          }
          return {
            data: {
              id: versionId,
              resource_id: resourceId,
              file_path: "private/path.pdf",
              original_filename: "Synthetic.pdf",
            },
            error: null,
          };
        },
      };
    },
    storage: {
      from() {
        return {
          async download() {
            storageCalls++;
            return { data: new Blob(["synthetic"]), error: null };
          },
        };
      },
    },
  };
  const deps = {
    getFullyAuthorizedAdminUser: async () =>
      options.admin ? { id: otherId } : null,
    getFullyAuthorizedPartner: async () => {
      partnerChecks++;
      return options.approved &&
        !(options.suspendDuringDownload && partnerChecks > 1)
        ? context
        : null;
    },
    createAdminSupabaseClient: () => db,
  };
  const nativeRequire = createRequire(
      path.resolve("tests/partner-resources.test.ts"),
    ),
    source = fs.readFileSync(
      path.resolve("lib/partner-resources/server.ts"),
      "utf8",
    );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports: loaded.exports,
    module: loaded,
    require: (name: string) =>
      name === "server-only"
        ? {}
        : name === "@/lib/supabase/server"
          ? deps
          : name === "./core"
            ? core
            : nativeRequire(name),
    Buffer,
    File,
    Blob,
    FormData,
  });
  return {
    server: loaded.exports as MockServer,
    counters: () => ({ databaseCalls, storageCalls }),
  };
}
test("unauthorized resource operations stop before database and storage access", async () => {
  const mock = loadServer();
  await assert.rejects(
    mock.server.downloadResource(resourceId, null),
    /Approved access/,
  );
  await assert.rejects(mock.server.adminResources(), /Administrator access/);
  assert.deepEqual(mock.counters(), { databaseCalls: 0, storageCalls: 0 });
});
test("stream download rejects unpublished, cross-partner and historical versions", async () => {
  for (const mock of [
    loadServer({ approved: true, published: false }),
    loadServer({ approved: true, target: otherId }),
  ]) {
    await assert.rejects(
      mock.server.downloadResource(resourceId, null),
      /unavailable/,
    );
    assert.equal(mock.counters().storageCalls, 0);
  }
  const historical = loadServer({ approved: true });
  await assert.rejects(
    historical.server.downloadResource(resourceId, otherId),
    /unavailable/,
  );
  assert.equal(historical.counters().storageCalls, 0);
});
test("unpublish and partner suspension are rechecked after private storage read", async () => {
  for (const mock of [
    loadServer({ approved: true, revokeDuringDownload: true }),
    loadServer({ approved: true, suspendDuringDownload: true }),
  ]) {
    await assert.rejects(
      mock.server.downloadResource(resourceId, null),
      /unavailable/,
    );
    assert.equal(mock.counters().storageCalls, 1);
  }
  const allowed = loadServer({ approved: true });
  assert.equal(
    (await allowed.server.downloadResource(resourceId, null)).filename,
    "Synthetic.pdf",
  );
});
