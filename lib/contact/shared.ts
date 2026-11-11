import { serviceOfferings } from "@/lib/site-data";

export const contactProjectTypes = [
  ...serviceOfferings.map(({ key, name }) => ({ value: key, label: name })),
  { value: "not-sure", label: "Not sure yet" },
];

export const contactLimits = {
  fullName: 100,
  email: 254,
  message: 4000,
} as const;

export type ContactResult = {
  ok: boolean;
  status:
    | "accepted"
    | "duplicate"
    | "validation"
    | "blocked"
    | "rate_limited"
    | "pending"
    | "unavailable"
    | "rejected"
    | "indeterminate";
  message: string;
};
