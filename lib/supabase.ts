import type { ProjectRequestPayload } from "@/lib/email";

export const projectRequestsTable = "project_requests";

type ProjectRequestRecord = {
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  package_selected: string;
  business_type: string;
  service_model: string;
  integrations: string;
  website_goals: string;
  extra_notes: string;
  created_at: string;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Expected NEXT_PUBLIC_SUPABASE_URL and a Supabase API key.",
    );
  }

  return { url, key };
}

function toProjectRequestRecord(payload: ProjectRequestPayload): ProjectRequestRecord {
  return {
    full_name: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    business_name: payload.businessName,
    package_selected: payload.selectedPackage,
    business_type: payload.businessType,
    service_model: payload.serviceModel,
    integrations: payload.integrations,
    website_goals: payload.projectGoals,
    extra_notes: payload.extraNotes,
    created_at: new Date().toISOString(),
  };
}

export async function saveProjectRequest(payload: ProjectRequestPayload) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${projectRequestsTable}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([toProjectRequestRecord(payload)]),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase insert failed for ${projectRequestsTable}: ${response.status} ${errorText}`,
    );
  }

  return response.json();
}
