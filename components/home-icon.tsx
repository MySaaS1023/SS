import type { ReactNode } from "react";

export function HomeIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    calendar: (
      <>
        <rect x="4" y="6" width="24" height="23" rx="3" />
        <path d="M10 3v7M22 3v7M4 14h24M10 20h3M19 20h3" />
      </>
    ),
    automation: (
      <>
        <path d="m13 3 6 0 1 4 3 2 4-1 3 5-3 3v3l3 3-3 5-4-1-3 2-1 3h-6l-1-3-3-2-4 1-3-5 3-3v-3l-3-3 3-5 4 1 3-2 1-4Z" />
        <circle cx="16" cy="17" r="5" />
      </>
    ),
    monitor: (
      <>
        <rect x="3" y="3" width="26" height="19" rx="2" />
        <path d="M11 29h10M16 22v7" />
      </>
    ),
    layers: (
      <>
        <path d="m16 3 13 7-13 7L3 10l13-7Z" />
        <path d="m3 16 13 7 13-7M3 22l13 7 13-7" />
      </>
    ),
    rocket: (
      <>
        <path d="M12 20C14 9 21 4 29 3c-1 8-6 15-17 17Z" />
        <path d="m12 12-6 1-3 7h9M20 20l-1 6-7 3v-9M8 24l-4 4" />
        <circle cx="22" cy="10" r="2" />
      </>
    ),
    business: (
      <>
        <rect x="3" y="9" width="26" height="20" rx="3" />
        <path d="M11 9V4h10v5M3 17h26M13 17v4h6v-4" />
      </>
    ),
    bolt: <path d="m18 2-13 17h10l-1 11 13-18H17l1-10Z" />,
    people: (
      <>
        <circle cx="16" cy="9" r="5" />
        <path d="M6 29v-5a10 10 0 0 1 20 0v5M4 6a4 4 0 0 0 0 8M28 6a4 4 0 0 1 0 8M2 25v-4a7 7 0 0 1 4-6M30 25v-4a7 7 0 0 0-4-6" />
      </>
    ),
    growth: <path d="M4 28h4V17H4zM14 28h4V11h-4zM24 28h4V3h-4z" />,
    support: (
      <>
        <path d="M4 19v-3a12 12 0 0 1 24 0v9a5 5 0 0 1-5 5h-5" />
        <rect x="2" y="16" width="6" height="11" rx="2" />
        <rect x="24" y="16" width="6" height="11" rx="2" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="home-icon"
    >
      {paths[kind] ?? paths.monitor}
    </svg>
  );
}
