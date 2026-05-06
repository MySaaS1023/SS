import type { ProjectRequestPayload } from "@/lib/email";

export const projectRequestsTable = "project_requests";

type ProjectRequestRecord = {
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  business_type: string;
  website_goals: string;
  extra_notes: string;
  created_at: string;
};

type ProjectRequestVariant =
  | (ProjectRequestRecord & {
      package_selected: string;
      booking_integration_needs: string;
    })
  | (ProjectRequestRecord & {
      selected_package: string;
      booking_integration_needs: string;
    })
  | (ProjectRequestRecord & {
      package_selected: string;
      integrations: string;
    })
  | (ProjectRequestRecord & {
      selected_package: string;
      integrations: string;
    });

export type SavedProjectRequest = ProjectRequestVariant;

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

function getBaseProjectRequestRecord(payload: ProjectRequestPayload): ProjectRequestRecord {
  const businessType = [payload.businessType, payload.serviceModel].filter(Boolean).join(" - ");

  return {
    full_name: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    business_name: payload.businessName,
    business_type: businessType,
    website_goals: payload.projectGoals,
    extra_notes: payload.extraNotes,
    created_at: new Date().toISOString(),
  };
}

function buildProjectRequestVariants(payload: ProjectRequestPayload): ProjectRequestVariant[] {
  const base = getBaseProjectRequestRecord(payload);

  return [
    {
      ...base,
      package_selected: payload.selectedPackage,
      booking_integration_needs: payload.integrations,
    },
    {
      ...base,
      selected_package: payload.selectedPackage,
      booking_integration_needs: payload.integrations,
    },
    {
      ...base,
      package_selected: payload.selectedPackage,
      integrations: payload.integrations,
    },
    {
      ...base,
      selected_package: payload.selectedPackage,
      integrations: payload.integrations,
    },
  ];
}

async function insertProjectRequest(
  url: string,
  key: string,
  record: ProjectRequestVariant,
) {
  const response = await fetch(`${url}/rest/v1/${projectRequestsTable}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([record]),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase insert failed for ${projectRequestsTable}: ${response.status} ${errorText}`,
    );
  }

  const data = (await response.json()) as SavedProjectRequest[];
  return data[0];
}

export async function saveProjectRequest(payload: ProjectRequestPayload) {
  const { url, key } = getSupabaseConfig();
  const variants = buildProjectRequestVariants(payload);
  const errors: string[] = [];

  for (const record of variants) {
    try {
      return await insertProjectRequest(url, key, record);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(errors.join(" | "));
}
