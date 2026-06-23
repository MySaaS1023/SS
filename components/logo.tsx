import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Steady Start home"
      className="inline-flex shrink-0 flex-col items-center"
    >
      <span
        role="img"
        aria-label="Steady Start Logo"
        className={`aspect-square bg-[linear-gradient(145deg,#38BDF8_0%,#3B82F6_48%,#8B5CF6_100%)] [mask-image:url('/logo.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] drop-shadow-[0_8px_18px_rgba(59,130,246,0.2)] ${
          compact ? "w-[48px] sm:w-[52px] md:w-[56px]" : "w-[52px] sm:w-[56px] md:w-[60px]"
        }`}
      />
      <span
        className={`text-center font-semibold uppercase leading-none tracking-[0.12em] text-white ${
          compact ? "mt-0.5 text-[8px] sm:text-[9px]" : "mt-1 text-[9px] sm:text-[10px]"
        }`}
      >
        Steady Start
      </span>
      <span
        className={`text-center font-semibold uppercase leading-none tracking-[0.2em] text-[var(--muted)] ${
          compact ? "mt-0.5 text-[7px] sm:text-[8px]" : "mt-0.5 text-[8px] sm:text-[9px]"
        }`}
      >
        LLC
      </span>
    </Link>
  );
}
