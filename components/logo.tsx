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
        src="/Untitled_design__1_-removebg-preview.png"
        alt="Steady Start Logo"
        width={140}
        height={50}
        priority
        className="invert brightness-200 object-contain w-[140px] h-auto"
      />
    </Link>
  );
}
