import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center overflow-hidden ${
        compact ? "h-[36px] w-[94px] sm:h-[40px] sm:w-[110px]" : "h-[42px] w-[118px] sm:h-[48px] sm:w-[132px] md:h-[56px] md:w-[170px]"
      }`}
    >
      <Image
        src="/logo.png"
        alt="Steady Start Logo"
        width={180}
        height={64}
        priority
        className={`h-auto max-w-none object-contain object-left ${
          compact
            ? "w-[126px] -translate-x-2 scale-[1.22] sm:w-[144px] sm:-translate-x-2.5 sm:scale-[1.2]"
            : "w-[152px] -translate-x-2 scale-[1.2] sm:w-[168px] sm:-translate-x-2.5 md:w-[208px] md:-translate-x-3"
        }`}
      />
    </Link>
  );
}
