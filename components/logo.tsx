import Link from "next/link";
import { BrandImage } from "@/components/ocean-brand";

type LogoProps = {
  compact?: boolean;
  invert?: boolean;
  iconOnly?: boolean;
};

export function Logo({ compact = false, iconOnly = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Steady Start home"
      className="inline-flex shrink-0 items-center"
    >
      <BrandImage
        className={compact ? "original-brand-compact" : ""}
        priority
        iconOnly={iconOnly}
      />
    </Link>
  );
}
