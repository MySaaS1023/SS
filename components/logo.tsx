import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center">
      <img
        src="/logo.png"
        alt="Steady Start Logo"
        width={140}
        height={50}
        className={`h-auto object-contain ${
          compact ? "w-[100px] sm:w-[110px]" : "w-[120px] sm:w-[140px]"
        }`}
      />
    </Link>
  );
}
