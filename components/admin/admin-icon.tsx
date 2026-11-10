import type { SVGProps } from "react";

export type AdminIconName =
  | "people"
  | "calendar"
  | "send"
  | "qr"
  | "chart"
  | "clipboard"
  | "link"
  | "coins"
  | "folder"
  | "check"
  | "close"
  | "rocket"
  | "layers"
  | "info"
  | "logout";

const paths: Record<AdminIconName, React.ReactNode> = {
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18m-13 5h2m4 0h2" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4L22 2ZM11 13 22 2" />
    </>
  ),
  qr: (
    <>
      <path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h2v2h-2zm6 0v3h-3v3h-3m6 0h.01M6 6h.01M18 6h.01M6 18h.01" />
    </>
  ),
  chart: (
    <>
      <path d="M3 21h18M6 17v-6m6 6V3m6 14V7" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="5" rx="2" />
      <path d="M9 12h6m-6 4h6" />
    </>
  ),
  link: (
    <>
      <path d="m10 13 4-4m-6 6-2 2a3.5 3.5 0 0 1-5-5l5-5a3.5 3.5 0 0 1 5 0m2 2 2-2a3.5 3.5 0 0 1 5 5l-5 5a3.5 3.5 0 0 1-5 0" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="9" cy="5" rx="6" ry="3" />
      <path d="M3 5v8c0 4 12 4 12 0V5M3 9c0 4 12 4 12 0m0 1c8-1 8 5 2 6m-2 0v4c6 1 6-3 6-5v-3M3 13v4c0 4 12 4 12 0" />
    </>
  ),
  folder: <path d="M3 5h6l2 2h10v13H3V5Z" />,
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 6-7" />
    </>
  ),
  close: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 5c3-2 6-2 7-2 0 5-2 10-7 13l-6-6c2-4 3-4 6-5ZM8 10l-4 1-2 5 6-1m6 1-1 6 5-2 1-5M6 18l-3 3" />
      <circle cx="16" cy="8" r="1" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9 3H4v18h5m5-15 6 6-6 6M8 12h12" />
    </>
  ),
};

export function AdminIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: AdminIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
