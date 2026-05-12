import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center">
      <Image
        src="/logo.png"
        alt="Steady Start Logo"
        width={180}
        height={64}
        priority
        className={`object-contain h-auto ${
          compact ? "w-[92px] sm:w-[104px]" : "w-[96px] sm:w-[112px] md:w-[152px]"
        }`}
      />
    </Link>
  );
}
