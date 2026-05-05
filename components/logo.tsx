import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="relative inline-flex h-11 w-11 items-center justify-center bg-transparent">
        <span className="absolute h-8 w-8 rounded-full bg-[linear-gradient(135deg,rgba(59,130,246,0.24),rgba(139,92,246,0.2))] blur-xl" />
        <span className="relative text-[1.15rem] font-semibold tracking-[-0.08em] text-white">
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
