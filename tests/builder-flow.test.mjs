import { rm } from "node:fs/promises";
import { setTimeout as wait } from "node:timers/promises";
import { spawn } from "node:child_process";

const port = 3210;
const baseUrl = `http://localhost:${port}`;
const cookie =
  "steady_start_session=local-preview; steady_start_org_id=11111111-1111-4111-8111-111111111111";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Cookie: cookie,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return { response, body };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while Next boots.
    }

    await wait(500);
  }

  throw new Error("Next dev server did not become ready.");
}

async function run() {
  await rm(".builder-data", { recursive: true, force: true });

  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(port)], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });

  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer();

    const invalid = await request("/api/websites", {
      method: "POST",
      body: JSON.stringify({ creationMethod: "scratch" }),
    });
    assert(invalid.response.status === 400, "Invalid scratch creation should fail validation.");

    const scratch = await request("/api/websites", {
      method: "POST",
      body: JSON.stringify({ name: "Smoke Scratch Site", creationMethod: "scratch" }),
    });
    assert(scratch.response.ok && scratch.body.success, "Scratch website should be created.");

    const scratchId = scratch.body.website.id;
    const content = scratch.body.website.site_content;
    content.pages[0].heading = "Persisted smoke-test heading";

    const save = await request(`/api/websites/${scratchId}`, {
      method: "PATCH",
      body: JSON.stringify({ siteContent: content, theme: scratch.body.website.theme }),
    });
    assert(save.response.ok && save.body.success, "Website changes should save.");

    const reopened = await request(`/api/websites/${scratchId}`);
    assert(
      reopened.body.website.site_content.pages[0].heading === "Persisted smoke-test heading",
      "Saved heading should persist when reopened.",
    );

    const editorPage = await request(`/dashboard/websites/${scratchId}/edit`);
    assert(editorPage.response.ok, "Editor route should render.");

    const previewPage = await request(`/dashboard/websites/${scratchId}/preview`);
    assert(previewPage.response.ok, "Preview route should render.");

    const template = await request("/api/websites", {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Template Site",
        creationMethod: "template",
        templateId: "service-business",
      }),
    });
    assert(template.response.ok && template.body.success, "Template website should be created.");

    const ai = await request("/api/websites/ai", {
      method: "POST",
      body: JSON.stringify({
        websiteName: "Smoke AI Site",
        businessName: "Smoke Business",
        businessType: "Services",
        industry: "Cleaning",
        businessDescription: "A reliable cleaning company.",
        targetAudience: "busy homeowners",
        productsOrServices: "home cleaning",
        preferredStyle: "modern",
        primaryColor: "#1473FF",
        secondaryColor: "#0F172A",
        pagesNeeded: "Home, Services, Contact",
        contactEmail: "test@example.com",
        phone: "555-555-5555",
        mainCallToAction: "Book Cleaning",
      }),
    });
    assert(ai.response.ok && ai.body.success, "AI website should be created.");

    const list = await request("/api/websites");
    assert(list.response.ok && list.body.websites.length >= 3, "My Websites should list created sites.");

    console.log("Builder milestone smoke test passed.");
  } catch (error) {
    console.error(serverOutput);
    throw error;
  } finally {
    server.kill();
    await rm(".builder-data", { recursive: true, force: true });
  }
}

await run();
