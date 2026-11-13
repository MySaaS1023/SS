import type { ReactNode } from "react";
import {
  RecordActionMenu,
  RecordDetailsAction,
} from "@/components/admin/record-action-menu";

export function formatRecordDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

export function RecordSection({
  title,
  count,
  standalone = false,
  open = false,
  children,
}: {
  title: string;
  count: number;
  standalone?: boolean;
  open?: boolean;
  children: ReactNode;
}) {
  const content = (
    <div className="referral-section-body">
      {children}
      {count === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          No records in this section.
        </p>
      ) : null}
    </div>
  );
  if (standalone)
    return (
      <section className="referral-record-page">
        <h1 className="mb-5 text-2xl font-semibold">
          {title} <span className="referral-count">{count}</span>
        </h1>
        {content}
      </section>
    );
  return (
    <details className="referral-management-section" open={open}>
      <summary className="referral-section-summary">
        <span>{title}</span>
        <span className="referral-count">{count}</span>
      </summary>
      {content}
    </details>
  );
}

export function RecordDisclosure({
  recordId,
  title,
  status,
  fields,
  children,
  editable = false,
  actions,
}: {
  recordId: string;
  title: string;
  status: string;
  fields: (string | number | null | undefined)[];
  children: ReactNode;
  editable?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="referral-record-row">
      <details id={recordId} className="referral-record">
        <summary className="referral-record-summary">
          <strong>{title}</strong>
          <span className="referral-record-fields">
            {fields
              .filter(
                (field) =>
                  field !== null && field !== undefined && field !== "",
              )
              .map((field, index) => (
                <span key={index}>{field}</span>
              ))}
          </span>
          <span className="referral-record-status">
            {status.replaceAll("_", " ")}
          </span>
        </summary>
        <div className="referral-record-body">{children}</div>
      </details>
      <RecordActionMenu label={title}>
        <RecordDetailsAction targetId={recordId} />
        {editable ? <RecordDetailsAction targetId={recordId} edit /> : null}
        {actions}
      </RecordActionMenu>
    </div>
  );
}
