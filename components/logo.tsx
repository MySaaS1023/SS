import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false, invert = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span
        className={`inline-flex items-center rounded-2xl ${
          invert ? "bg-white px-4 py-3 shadow-[var(--shadow)]" : "rounded-xl"
        }`}
      >
        <img
          src="/steady-start-logo.png"
          alt="Steady Start"
          width={190}
          height={92}
          className={`h-auto ${compact ? "w-[150px] sm:w-[160px]" : "w-[160px] sm:w-[180px]"}`}
        />
      </span>
    </Link>
  );
}
