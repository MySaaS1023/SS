import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { dashboardSections, getDashboardSection } from "@/lib/saas/navigation";
import { canAccessResource } from "@/lib/saas/permissions";
import type { DashboardSectionKey } from "@/lib/saas/types";

type DashboardSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

const roadmapBySection: Partial<Record<DashboardSectionKey, string[]>> = {
  leads: [
    "Convert website requests and consultation forms into organization-scoped leads.",
    "Track source, status, notes, and next follow-up.",
    "Let AI draft replies and estimate discovery questions.",
  ],
  customers: [
    "Store customer contact details, project history, files, invoices, and portal access.",
    "Connect customer records to leads, appointments, projects, and billing.",
  ],
  projects: [
    "Move current project workflow into organization-scoped jobs with tasks and milestones.",
    "Attach files, vendors, estimates, invoices, and customer communication.",
  ],
  orders: [
    "Connect checkout activity, customer purchases, fulfillment, and order history.",
    "Support product businesses with inventory-aware order records and customer communication.",
  ],
  products: [
    "Manage product catalogs, collections, inventory, reviews, coupons, and product content.",
    "Use AI to draft descriptions, generate categories, improve images, and recommend merchandising changes.",
  ],
  services: [
    "Manage service menus, booking rules, availability, estimates, and proposal generation.",
    "Connect service records to appointments, customers, invoices, files, and follow-up emails.",
  ],
  calendar: [
    "Unify consultation scheduling, business availability, appointments, and job visits.",
    "Support employee assignments and customer-facing booking windows.",
  ],
  invoices: [
    "Prepare estimates and invoices from customer/project records.",
    "Track payment links, payment status, and invoice history.",
  ],
  files: [
    "Store project assets, signed documents, customer uploads, and internal files.",
    "Scope every file to the organization and optional customer/project.",
  ],
  website: [
    "Manage website pages, forms, domain settings, and launch status.",
    "Keep current public website workflows compatible during migration.",
  ],
  marketing: [
    "Organize email follow-ups, review requests, lead nurturing, and local visibility automations.",
    "Connect automations to leads, customers, projects, and AI-generated content.",
  ],
  "ai-assistant": [
    "Assist with customer replies, estimates, project updates, and business operations.",
    "Keep AI context organization-scoped so one business never sees another business's data.",
  ],
  settings: [
    "Manage organization profile, roles, team members, services, branding, and notifications.",
    "Centralize configuration before deeper feature migration.",
  ],
  billing: [
    "Prepare subscription plan, Stripe customer, invoices, and payment method management.",
    "Restrict billing management to Owners by default.",
  ],
  analytics: [
    "Track website, marketing, customer, order, project, and revenue signals by organization.",
    "Use AI to recommend growth improvements and operational next steps.",
  ],
};

export function generateStaticParams() {
  return dashboardSections
    .filter((section) => section.key !== "home")
    .map((section) => ({ section: section.key }));
}

export default async function DashboardSectionPage({ params }: DashboardSectionPageProps) {
  const { section: rawSection } = await params;
  const section = getDashboardSection(rawSection);

  if (!section || section.key === "home") {
    notFound();
  }

  const ownerCanAccess = canAccessResource("owner", section.resource);
  const adminCanAccess = canAccessResource("admin", section.resource);
  const employeeCanAccess = canAccessResource("employee", section.resource);
  const customerCanAccess = canAccessResource("customer", section.resource);
  const roleAccess = [
    { label: "Owner", enabled: ownerCanAccess },
    { label: "Admin", enabled: adminCanAccess },
    { label: "Employee", enabled: employeeCanAccess },
    { label: "Customer", enabled: customerCanAccess },
  ];
  const roadmap = roadmapBySection[section.key] ?? [
    "Connect this module to organization-scoped records.",
    "Add authenticated loading, empty states, and role-aware actions.",
  ];

  return (
    <DashboardShell
      activeSection={section.key}
      title={section.label}
      description={section.description}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <DashboardCard
          title={`${section.label} module`}
          description="This page is intentionally scaffolded as a production-safe SaaS module. Feature data should be loaded by organization ID once authentication is connected."
        >
          <div className="rounded-2xl border border-dashed border-[rgba(148,163,184,0.28)] bg-white/6 p-5">
            <p className="text-sm leading-7 text-[var(--muted)]">
              Next implementation step: add authenticated data loaders and API routes
              that require an active organization before reading or writing records.
            </p>
            <Link
              href="/get-started"
              className="mt-5 inline-flex text-sm font-semibold text-[var(--accent-strong)] hover:text-white"
            >
              Capture a new request
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard title="Role access">
          <div className="grid gap-2">
            {roleAccess.map(({ label, enabled }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/6 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-white">{label}</span>
                <span className={enabled ? "text-[#bfdbfe]" : "text-[var(--muted)]"}>
                  {enabled ? "Allowed" : "Limited"}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Migration roadmap">
        <ul className="grid gap-3 text-sm leading-7 text-[var(--muted)]">
          {roadmap.map((item) => (
            <li key={item} className="rounded-2xl border border-[var(--line)] bg-white/6 p-4">
              {item}
            </li>
          ))}
        </ul>
      </DashboardCard>
    </DashboardShell>
  );
}
