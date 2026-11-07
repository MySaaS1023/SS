import React from "react";

export function PlatformIcon({ platform }: { platform: string }) {
  const common = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    className: "h-6 w-6 shrink-0",
    fill: "currentColor",
  };
  if (platform === "Facebook")
    return (
      <svg {...common}>
        <path d="M13.6 22v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V4.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.3H7.4v3.2h2.8V22h3.4Z" />
      </svg>
    );
  if (platform === "YouTube")
    return (
      <svg {...common}>
        <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    );
  if (platform === "Instagram")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (platform === "TikTok")
    return (
      <svg {...common}>
        <path d="M14.2 3h3a5.2 5.2 0 0 0 4.1 4.2v3a8.2 8.2 0 0 1-4.1-1.5v6.7a6 6 0 1 1-6.9-5.9v3.1a2.9 2.9 0 1 0 3.9 2.8V3Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" />
    </svg>
  );
}
