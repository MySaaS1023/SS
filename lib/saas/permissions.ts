import type { Permission, PermissionAction, OrganizationResource, UserRole } from "@/lib/saas/types";

const ownerResources: OrganizationResource[] = [
  "dashboard",
  "users",
  "leads",
  "customers",
  "projects",
  "orders",
  "products",
  "services",
  "calendar",
  "invoices",
  "files",
  "website",
  "websites",
  "templates",
  "ai-builder",
  "create-website",
  "automations",
  "domains",
  "branding",
  "media",
  "register-entity",
  "marketing",
  "ai-assistant",
  "settings",
  "billing",
  "analytics",
  "brand-settings",
  "ai-history",
  "emails",
  "appointments",
  "vendors",
  "availability",
];

const adminResources = ownerResources.filter((resource) => resource !== "billing");

const employeeResources: OrganizationResource[] = [
  "dashboard",
  "leads",
  "customers",
  "projects",
  "orders",
  "products",
  "services",
  "calendar",
  "files",
  "websites",
  "templates",
  "ai-builder",
  "create-website",
  "automations",
  "domains",
  "branding",
  "media",
  "emails",
  "appointments",
  "vendors",
  "availability",
  "analytics",
];

const customerResources: OrganizationResource[] = [
  "dashboard",
  "projects",
  "orders",
  "calendar",
  "invoices",
  "files",
  "websites",
];

const allActions: PermissionAction[] = ["create", "read", "update", "delete", "manage"];
const staffActions: PermissionAction[] = ["create", "read", "update"];
const customerActions: PermissionAction[] = ["read"];

function buildPermissions(
  resources: OrganizationResource[],
  actions: PermissionAction[],
): Permission[] {
  return resources.flatMap((resource) =>
    actions.map((action) => `${resource}:${action}` as Permission),
  );
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  owner: buildPermissions(ownerResources, allActions),
  admin: buildPermissions(adminResources, staffActions),
  employee: buildPermissions(employeeResources, staffActions),
  customer: buildPermissions(customerResources, customerActions),
};

export function can(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function canAccessResource(role: UserRole, resource: OrganizationResource) {
  return rolePermissions[role].some((permission) => permission.startsWith(`${resource}:`));
}
