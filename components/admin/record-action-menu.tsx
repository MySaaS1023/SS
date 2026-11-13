"use client";

import { useEffect, useRef, type ReactNode } from "react";

// A native disclosure, rather than an ARIA menu: its links, confirmations and
// forms retain their normal keyboard behavior and existing server actions.
export function RecordActionMenu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !disclosure.current?.contains(event.target)
      ) {
        disclosure.current?.removeAttribute("open");
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <details
      ref={disclosure}
      className="record-action-menu"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          disclosure.current?.removeAttribute("open");
          disclosure.current?.querySelector("summary")?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          event.currentTarget.removeAttribute("open");
        }
      }}
    >
      <summary
        aria-label={`More actions for ${label}`}
        title={`More actions for ${label}`}
      >
        <span aria-hidden="true">⋯</span>
      </summary>
      <div
        className="record-action-menu-panel"
        role="group"
        aria-label={`Actions for ${label}`}
      >
        {children}
      </div>
    </details>
  );
}

export function RecordDetailsAction({
  targetId,
  edit = false,
}: {
  targetId: string;
  edit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        const target = document.getElementById(targetId);
        if (!(target instanceof HTMLDetailsElement)) return;
        target.open = true;
        event.currentTarget
          .closest("details.record-action-menu")
          ?.removeAttribute("open");
        const summary = target.querySelector<HTMLElement>("summary");
        // Some existing editors (including application review) use a div and
        // server-action buttons rather than a form. Match editable controls
        // themselves; :enabled also excludes a disabled ancestor fieldset.
        const focus =
          (edit
            ? target.querySelector<HTMLElement>(
                'textarea:enabled:not([readonly]), input:enabled:not([readonly]):not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select:enabled',
              )
            : summary) ?? summary;
        focus?.focus();
        focus?.scrollIntoView({ block: "nearest", behavior: "instant" });
      }}
    >
      {edit ? "Edit" : "View details"}
    </button>
  );
}
