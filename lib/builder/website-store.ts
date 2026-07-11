import { promises as fs } from "fs";
import path from "path";

import { createBlankWebsiteContent, defaultWebsiteTheme } from "@/lib/builder/defaults";
import type { CreateWebsiteInput, WebsiteRecord } from "@/lib/builder/types";
import { createId, slugify } from "@/lib/builder/utils";

const localStorePath = path.join(process.cwd(), ".builder-data", "websites.json");

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

function supabaseHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function supabaseRequest<T>(pathName: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${config.url}/rest/v1/${pathName}`, {
    ...init,
    headers: {
      ...supabaseHeaders(config.key),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WEBSITE_SUPABASE_ERROR", response.status, errorText);
    throw new Error(errorText || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function ensureOrganization(organizationId: string) {
  if (!getSupabaseConfig()) {
    return;
  }

  await supabaseRequest("organizations?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify([
      {
        id: organizationId,
        name: "My Business",
        slug: `org-${organizationId.slice(0, 8)}`,
      },
    ]),
  });
}

async function readLocalStore(): Promise<WebsiteRecord[]> {
  try {
    const file = await fs.readFile(localStorePath, "utf8");
    return JSON.parse(file) as WebsiteRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalStore(websites: WebsiteRecord[]) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true });
  await fs.writeFile(localStorePath, JSON.stringify(websites, null, 2), "utf8");
}

function createWebsiteRecord(organizationId: string, input: CreateWebsiteInput): WebsiteRecord {
  const now = new Date().toISOString();
  const name = input.name.trim();

  return {
    id: createId(),
    organization_id: organizationId,
    name,
    slug: slugify(name),
    creation_method: input.creationMethod,
    template_id: input.templateId ?? null,
    status: "draft",
    site_content: input.siteContent ?? createBlankWebsiteContent(name),
    theme: input.theme ?? defaultWebsiteTheme,
    created_at: now,
    updated_at: now,
  };
}

export async function listWebsites(organizationId: string): Promise<WebsiteRecord[]> {
  if (getSupabaseConfig()) {
    return supabaseRequest<WebsiteRecord[]>(
      `websites?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=updated_at.desc`,
    );
  }

  const websites = await readLocalStore();
  return websites
    .filter((website) => website.organization_id === organizationId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getWebsite(
  organizationId: string,
  websiteId: string,
): Promise<WebsiteRecord | null> {
  if (getSupabaseConfig()) {
    const websites = await supabaseRequest<WebsiteRecord[]>(
      `websites?id=eq.${encodeURIComponent(websiteId)}&organization_id=eq.${encodeURIComponent(
        organizationId,
      )}&select=*&limit=1`,
    );

    return websites[0] ?? null;
  }

  const websites = await readLocalStore();
  return (
    websites.find(
      (website) => website.id === websiteId && website.organization_id === organizationId,
    ) ?? null
  );
}

export async function createWebsite(
  organizationId: string,
  input: CreateWebsiteInput,
): Promise<WebsiteRecord> {
  const website = createWebsiteRecord(organizationId, input);

  if (getSupabaseConfig()) {
    await ensureOrganization(organizationId);
    const websites = await supabaseRequest<WebsiteRecord[]>("websites", {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify([website]),
    });

    return websites[0];
  }

  const websites = await readLocalStore();
  websites.push(website);
  await writeLocalStore(websites);
  return website;
}

export async function updateWebsite(
  organizationId: string,
  websiteId: string,
  patch: Partial<Pick<WebsiteRecord, "name" | "site_content" | "theme" | "status">>,
): Promise<WebsiteRecord> {
  const updatedAt = new Date().toISOString();

  if (getSupabaseConfig()) {
    const websites = await supabaseRequest<WebsiteRecord[]>(
      `websites?id=eq.${encodeURIComponent(websiteId)}&organization_id=eq.${encodeURIComponent(
        organizationId,
      )}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...patch,
          updated_at: updatedAt,
        }),
      },
    );

    const website = websites[0];

    if (!website) {
      throw new Error("Website not found.");
    }

    return website;
  }

  const websites = await readLocalStore();
  const index = websites.findIndex(
    (website) => website.id === websiteId && website.organization_id === organizationId,
  );

  if (index === -1) {
    throw new Error("Website not found.");
  }

  websites[index] = {
    ...websites[index],
    ...patch,
    updated_at: updatedAt,
  };
  await writeLocalStore(websites);
  return websites[index];
}

export async function deleteWebsite(organizationId: string, websiteId: string) {
  if (getSupabaseConfig()) {
    await supabaseRequest(
      `websites?id=eq.${encodeURIComponent(websiteId)}&organization_id=eq.${encodeURIComponent(
        organizationId,
      )}`,
      {
        method: "DELETE",
      },
    );
    return;
  }

  const websites = await readLocalStore();
  await writeLocalStore(
    websites.filter(
      (website) => !(website.id === websiteId && website.organization_id === organizationId),
    ),
  );
}
