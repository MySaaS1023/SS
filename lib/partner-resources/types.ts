export const RESOURCE_CATEGORIES = [
  "Policies",
  "Agreements",
  "Tax Documents",
  "Sales Scripts",
  "Training Materials",
  "Other Resources",
] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
export type ResourceMetadata = {
  title: string;
  description: string;
  category: ResourceCategory;
  classification: "general" | "completed_tax";
  targetPartnerId: string | null;
  published: boolean;
  acknowledgmentRequired: boolean;
};
export type ResourceVersion = {
  id: string;
  resource_id: string;
  version_number: number;
  file_path: string;
  original_filename: string;
  mime_type: string;
  byte_size: number;
  sha256: string;
  release_notes: string;
  created_at: string;
};
export type PartnerResource = {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  classification: ResourceMetadata["classification"];
  target_partner_id: string | null;
  published: boolean;
  acknowledgment_required: boolean;
  current_version_id: string;
  revision: number;
  updated_at: string;
  created_at: string;
};
