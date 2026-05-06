import type { ProjectRequestPayload } from "@/lib/email";

export const hireUsSubmissionsTable = "hire_us_submissions";

export type ProjectRequestRecord = {
  full_name: string;
  email: string;
  phone: string;
  selected_package: string;
  website_goals: string;
};

export type SavedProjectRequest = ProjectRequestRecord;
export type SavedProjectRequestResult = {
  record: SavedProjectRequest;
  table: string;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("MISSING_SUPABASE_ENV");
    throw new Error("Supabase environment variables are missing.");
  }

  return { url, key };
}

function toInsertData(payload: ProjectRequestPayload): ProjectRequestRecord {
  const insertData = {
    full_name: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    selected_package: payload.selectedPackage,
    website_goals: payload.projectGoals,
  };

  return insertData;
}

async function insertProjectRequest(
  url: string,
  key: string,
  record: ProjectRequestRecord,
) {
  const response = await fetch(`${url}/rest/v1/${hireUsSubmissionsTable}`, {
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
    const error = new Error(
      `Supabase insert failed for ${hireUsSubmissionsTable}: ${response.status} ${errorText}`,
    );

    if (
      response.status === 401 ||
      response.status === 403 ||
      errorText.toLowerCase().includes("row-level security") ||
      errorText.toLowerCase().includes("permission")
    ) {
      console.error("RLS_OR_PERMISSION_ERROR", error);
    }

    throw error;
  }

  const data = (await response.json()) as SavedProjectRequest[];
  return data[0] ?? record;
}

export async function saveProjectRequest(payload: ProjectRequestPayload) {
  const { url, key } = getSupabaseConfig();
  const record = toInsertData(payload);
  const savedRecord = await insertProjectRequest(url, key, record);
  return { record: savedRecord, table: hireUsSubmissionsTable };
}
