import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      <Image
        src="/logo.png"
        alt="Steady Start Logo"
        width={72}
        height={72}
        priority
        className={`h-auto object-contain ${
          compact ? "w-[46px] sm:w-[52px] md:w-[56px]" : "w-[56px] sm:w-[62px] md:w-[72px]"
        }`}
      />
    </Link>
  );
}
