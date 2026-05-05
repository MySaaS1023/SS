import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] shadow-[var(--shadow)]">
        <span className="absolute inset-1 rounded-[0.9rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.24),rgba(139,92,246,0.22))] blur-sm" />
        <span className="relative text-lg font-semibold tracking-[-0.08em] text-white">
          SS
        </span>
      </span>
      <span className="flex flex-col">
        <span
          className={`text-sm font-semibold uppercase tracking-[0.32em] text-white ${
            compact ? "sm:text-base" : "sm:text-lg"
          }`}
        >
          Steady Start
        </span>
        {!compact ? (
          <span className="text-xs leading-5 text-[var(--muted)] sm:text-sm">
            Custom websites. Solid foundation. Steady growth.
          </span>
        ) : null}
      </span>
    </Link>
  );
}
