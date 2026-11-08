import Link from "next/link";

export function HandoffSectionNav({
  selected,
}: {
  selected: "create" | "delivery" | "saved" | "feedback";
}) {
  const items = [
    ["create", "Create Handoff", "/admin/handoffs"],
    ["delivery", "Delivery", "/admin/handoffs?section=delivery"],
    ["saved", "Saved Handoffs", "/admin/handoffs?section=saved"],
    ["feedback", "Customer Feedback", "/admin/handoffs/reviews"],
  ] as const;
  return (
    <nav
      aria-label="Client Handoff sections"
      className="my-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
    >
      {items.map(([key, label, href]) => (
        <Link
          key={key}
          href={href}
          aria-current={key === selected ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-medium focus-visible:outline-2 focus-visible:outline-blue-300 ${key === selected ? "border-blue-300/60 bg-blue-400/15 text-white" : "border-white/15 text-slate-300 hover:bg-white/5"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
