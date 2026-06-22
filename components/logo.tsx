import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" aria-label="Steady Start home" className="inline-flex shrink-0 items-center">
      <span
        role="img"
        aria-label="Steady Start Logo"
        className={`aspect-square bg-[linear-gradient(145deg,#C08D90,#A78D80)] [mask-image:url('/logo.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${
          compact ? "w-[62px] sm:w-[68px] md:w-[74px]" : "w-[56px] sm:w-[62px] md:w-[72px]"
        }`}
      />
    </Link>
  );
}
