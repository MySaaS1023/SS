export const roleNames = ["owner", "admin", "employee", "customer"] as const;

export type UserRole = (typeof roleNames)[number];

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

export type OrganizationResource =
  | "dashboard"
  | "users"
  | "leads"
  | "customers"
  | "projects"
  | "orders"
  | "products"
  | "services"
  | "calendar"
  | "invoices"
  | "files"
  | "website"
  | "websites"
  | "templates"
  | "ai-builder"
  | "automations"
  | "domains"
  | "branding"
  | "media-library"
  | "register-entity"
  | "marketing"
  | "ai-assistant"
  | "settings"
  | "billing"
  | "analytics"
  | "brand-settings"
  | "ai-history"
  | "emails"
  | "appointments"
  | "vendors"
  | "availability";

export type Permission = `${OrganizationResource}:${PermissionAction}`;

export type OrganizationScopedRecord = {
  id: string;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
};

export type Organization = OrganizationScopedRecord & {
  name: string;
  slug: string;
  businessModel: "products" | "services" | "both";
  industry?: string;
  location?: string;
  phone?: string;
  email?: string;
  ownerUserId: string;
};

export type OrganizationMembership = OrganizationScopedRecord & {
  userId: string;
  role: UserRole;
  status: "active" | "invited" | "disabled";
};

export type DashboardSectionKey =
  | "home"
  | "leads"
  | "customers"
  | "projects"
  | "orders"
  | "products"
  | "services"
  | "calendar"
  | "invoices"
  | "files"
  | "website"
  | "websites"
  | "templates"
  | "ai-builder"
  | "automations"
  | "marketing"
  | "ai-assistant"
  | "domains"
  | "branding"
  | "media-library"
  | "register-entity"
  | "settings"
  | "billing"
  | "analytics";

export type DashboardSection = {
  key: DashboardSectionKey;
  href: string;
  label: string;
  description: string;
  resource: OrganizationResource;
};

export type SaaSModuleStatus = "foundation" | "planned" | "migrating" | "active";

export type SaaSModule = {
  title: string;
  description: string;
  status: SaaSModuleStatus;
  resource: OrganizationResource;
};
