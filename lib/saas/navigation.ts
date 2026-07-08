import type { DashboardSection } from "@/lib/saas/types";

export const dashboardSections: DashboardSection[] = [
  {
    key: "home",
    href: "/dashboard",
    label: "Dashboard",
    description: "Choose how you want to start building your website.",
    resource: "dashboard",
  },
  {
    key: "websites",
    href: "/dashboard/websites",
    label: "My Websites",
    description: "View and manage your websites.",
    resource: "websites",
  },
  {
    key: "templates",
    href: "/dashboard/templates",
    label: "Templates",
    description: "Browse professionally designed website layouts.",
    resource: "templates",
  },
  {
    key: "ai-builder",
    href: "/dashboard/ai-builder",
    label: "AI Builder",
    description: "Generate a complete website from a guided intake.",
    resource: "ai-builder",
  },
  {
    key: "automations",
    href: "/dashboard/automations",
    label: "Automations",
    description: "Prepare AI-powered follow-ups, SEO suggestions, and content workflows.",
    resource: "automations",
  },
  {
    key: "products",
    href: "/dashboard/products",
    label: "Products",
    description: "Organize products for websites with product or shop sections.",
    resource: "products",
  },
  {
    key: "services",
    href: "/dashboard/services",
    label: "Services",
    description: "Organize services for booking, service pages, and website content.",
    resource: "services",
  },
  {
    key: "register-entity",
    href: "/dashboard/register-entity",
    label: "Register Entity",
    description: "Start guided business setup and entity registration support.",
    resource: "register-entity",
  },
  {
    key: "domains",
    href: "/dashboard/domains",
    label: "Domains",
    description: "Connect or prepare your website domain.",
    resource: "domains",
  },
  {
    key: "branding",
    href: "/dashboard/branding",
    label: "Branding",
    description: "Manage colors, fonts, logos, and brand style.",
    resource: "branding",
  },
  {
    key: "media-library",
    href: "/dashboard/media-library",
    label: "Media Library",
    description: "Upload and organize images, logos, and website files.",
    resource: "media-library",
  },
  {
    key: "analytics",
    href: "/dashboard/analytics",
    label: "Analytics",
    description: "Review website visits, leads, forms, and performance insights.",
    resource: "analytics",
  },
  {
    key: "billing",
    href: "/dashboard/billing",
    label: "Plans & Billing",
    description: "Manage your current plan, upgrades, billing history, and subscription.",
    resource: "billing",
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    label: "Settings",
    description: "Manage account, organization, team, notifications, and preferences.",
    resource: "settings",
  },
];

export function getDashboardSection(sectionKey?: string) {
  if (!sectionKey) {
    return dashboardSections[0];
  }

  return dashboardSections.find((section) => section.key === sectionKey);
}
