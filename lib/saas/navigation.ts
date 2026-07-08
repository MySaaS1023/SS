import type { DashboardSection, SaaSModule } from "@/lib/saas/types";

export const dashboardSections: DashboardSection[] = [
  {
    key: "home",
    href: "/dashboard",
    label: "Home",
    description: "A command center for business activity, launch progress, and next steps.",
    resource: "dashboard",
  },
  {
    key: "leads",
    href: "/dashboard/leads",
    label: "Leads",
    description: "Track new inquiries, estimate requests, and potential customers.",
    resource: "leads",
  },
  {
    key: "customers",
    href: "/dashboard/customers",
    label: "Customers",
    description: "Manage customer profiles, contact history, notes, and portal access.",
    resource: "customers",
  },
  {
    key: "projects",
    href: "/dashboard/projects",
    label: "Projects",
    description: "Plan jobs, tasks, milestones, files, vendors, and customer deliverables.",
    resource: "projects",
  },
  {
    key: "orders",
    href: "/dashboard/orders",
    label: "Orders",
    description: "Manage product orders, checkout activity, fulfillment, and customer purchases.",
    resource: "orders",
  },
  {
    key: "products",
    href: "/dashboard/products",
    label: "Products",
    description: "Organize products, collections, inventory, coupons, reviews, and product content.",
    resource: "products",
  },
  {
    key: "services",
    href: "/dashboard/services",
    label: "Services",
    description: "Manage services, booking rules, estimates, proposals, and service packages.",
    resource: "services",
  },
  {
    key: "calendar",
    href: "/dashboard/calendar",
    label: "Calendar",
    description: "Coordinate consultations, appointments, availability, and job schedules.",
    resource: "calendar",
  },
  {
    key: "invoices",
    href: "/dashboard/invoices",
    label: "Invoices",
    description: "Prepare estimates, invoices, payment status, and billing records.",
    resource: "invoices",
  },
  {
    key: "files",
    href: "/dashboard/files",
    label: "Files",
    description: "Store contracts, project documents, images, and customer assets.",
    resource: "files",
  },
  {
    key: "website",
    href: "/dashboard/website",
    label: "Website",
    description: "Manage website settings, pages, content, forms, and launch readiness.",
    resource: "website",
  },
  {
    key: "marketing",
    href: "/dashboard/marketing",
    label: "Marketing",
    description: "Prepare follow-ups, email campaigns, automations, and local visibility tools.",
    resource: "marketing",
  },
  {
    key: "ai-assistant",
    href: "/dashboard/ai-assistant",
    label: "AI Assistant",
    description: "Use guided AI support for customer replies, tasks, estimates, and workflows.",
    resource: "ai-assistant",
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    label: "Settings",
    description: "Configure organization details, users, roles, branding, and operating rules.",
    resource: "settings",
  },
  {
    key: "billing",
    href: "/dashboard/billing",
    label: "Billing",
    description: "Manage subscription, invoices, payment methods, and SaaS plan details.",
    resource: "billing",
  },
  {
    key: "analytics",
    href: "/dashboard/analytics",
    label: "Analytics",
    description: "Review website, sales, marketing, customer, and business performance insights.",
    resource: "analytics",
  },
];

export const foundationModules: SaaSModule[] = [
  {
    title: "Multi-tenant organizations",
    description:
      "Every business account owns website, customers, projects, orders, products, services, invoices, files, users, brand settings, AI history, and automations through an organization boundary.",
    status: "foundation",
    resource: "settings",
  },
  {
    title: "Role-based access",
    description:
      "Owner, Admin, Employee, and Customer roles are defined now so permissions can expand without rewriting dashboard code.",
    status: "foundation",
    resource: "users",
  },
  {
    title: "Business management dashboard",
    description:
      "The authenticated application starts from /dashboard, while public marketing pages stay separate and focused on conversion.",
    status: "foundation",
    resource: "dashboard",
  },
  {
    title: "Existing workflow migration",
    description:
      "Contact requests, consultations, project workflow, vendors, availability, and email automation stay compatible while they move behind organization-scoped modules.",
    status: "migrating",
    resource: "projects",
  },
];

export function getDashboardSection(sectionKey?: string) {
  if (!sectionKey) {
    return dashboardSections[0];
  }

  return dashboardSections.find((section) => section.key === sectionKey);
}
