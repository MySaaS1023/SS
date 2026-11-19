import Image from "next/image";
import React, { type ReactNode } from "react";
import type {
  SampleSocialPlatform,
  WebsiteDesign,
} from "@/lib/explore-designs";

function PlatformIcon({ platform }: { platform: SampleSocialPlatform }) {
  const paths: Record<SampleSocialPlatform, ReactNode> = {
    Facebook: (
      <path d="M14 21v-8h3l.5-3H14V8c0-1 .5-1.5 1.5-1.5H18V3h-3c-3 0-5 2-5 5v2H7v3h3v8" />
    ),
    Instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".7" />
      </>
    ),
    Pinterest: (
      <>
        <circle cx="12" cy="10" r="7" />
        <path d="m9 21 3-14m-1 7c5 4 8-5 3-7" />
      </>
    ),
    YouTube: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="m10 9 6 3-6 3Z" />
      </>
    ),
    TikTok: <path d="M13 3v12a4 4 0 1 1-4-4m4-8c0 4 3 6 7 6" />,
    LinkedIn: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4" />
      </>
    ),
    Behance: (
      <>
        <path d="M3 5h5c5 0 5 7 0 7H3m0-7v14h5c5 0 5-7 0-7M16 6h5m-6 8h7c0-6-8-6-8 0 0 5 6 6 8 2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[platform]}
    </svg>
  );
}

function OriginalScene({ kind }: { kind: string }) {
  if (kind === "landscaping")
    return (
      <svg
        viewBox="0 0 600 400"
        role="img"
        aria-label="Original garden illustration with sculpted greenery and a stone path"
      >
        <rect width="600" height="400" fill="#c6d8b5" />
        <path d="M0 160Q170 70 360 150T600 100V400H0Z" fill="#739c5d" />
        <path d="M0 260Q150 130 300 230T600 180V400H0Z" fill="#345d36" />
        <path d="M170 400 320 180h38l90 220" fill="#e6deca" />
        <path
          d="M222 328h200m-160-64h120m-85-49h65"
          stroke="#b3ac97"
          strokeWidth="9"
        />
        <g fill="#224a34">
          <circle cx="70" cy="220" r="65" />
          <circle cx="490" cy="270" r="100" />
          <circle cx="580" cy="190" r="65" />
        </g>
        <g fill="#e1bb76">
          <circle cx="80" cy="300" r="9" />
          <circle cx="116" cy="317" r="6" />
          <circle cx="487" cy="350" r="8" />
        </g>
      </svg>
    );
  if (kind === "restaurant-food")
    return (
      <svg
        viewBox="0 0 600 400"
        role="img"
        aria-label="Original food illustration of a colorful seasonal dish on a ceramic plate"
      >
        <rect width="600" height="400" fill="#6c332b" />
        <path
          d="m0 50 600 300M0 200l420 200M200 0l400 200"
          stroke="#84483b"
          strokeWidth="4"
        />
        <ellipse cx="340" cy="210" rx="190" ry="155" fill="#ead7b4" />
        <ellipse cx="340" cy="210" rx="145" ry="115" fill="#b55c32" />
        <g fill="#e8b247">
          <ellipse
            cx="280"
            cy="175"
            rx="45"
            ry="28"
            transform="rotate(-30 280 175)"
          />
          <ellipse
            cx="365"
            cy="242"
            rx="50"
            ry="25"
            transform="rotate(30 365 242)"
          />
        </g>
        <g fill="#668548">
          <ellipse
            cx="340"
            cy="155"
            rx="26"
            ry="48"
            transform="rotate(40 340 155)"
          />
          <ellipse
            cx="290"
            cy="255"
            rx="24"
            ry="44"
            transform="rotate(-40 290 255)"
          />
        </g>
        <g fill="#e3633e">
          <circle cx="388" cy="177" r="27" />
          <circle cx="258" cy="228" r="22" />
          <circle cx="410" cy="234" r="18" />
        </g>
        <path
          d="M100 90v240m-15-235v60m30-60v60M520 90v240"
          stroke="#d7b992"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
    );
  if (kind === "creator-vlogging")
    return (
      <svg
        viewBox="0 0 600 400"
        role="img"
        aria-label="Original creator studio illustration with a camera and video frame"
      >
        <rect width="600" height="400" fill="#ba8bca" />
        <circle cx="430" cy="70" r="150" fill="#e3b99c" />
        <path d="M0 350 600 160v240H0Z" fill="#665b94" />
        <rect x="160" y="100" width="320" height="210" rx="15" fill="#302b4c" />
        <rect x="175" y="115" width="290" height="180" rx="8" fill="#dfb5c8" />
        <circle cx="320" cy="205" r="55" fill="#62547e" />
        <path d="m305 175 45 30-45 30Z" fill="#f8ece8" />
        <rect x="60" y="220" width="110" height="85" rx="12" fill="#403655" />
        <circle cx="115" cy="262" r="29" fill="#98b1bd" />
        <path d="m115 305-30 80m30-80 30 80" stroke="#302b4c" strokeWidth="9" />
      </svg>
    );
  if (kind === "personal-creative")
    return (
      <svg
        viewBox="0 0 600 400"
        role="img"
        aria-label="Original abstract composition with architectural arches and sculptural forms"
      >
        <rect width="600" height="400" fill="#eddfcc" />
        <path d="M310 400V150a100 100 0 0 1 200 0v250" fill="#ae6f55" />
        <path d="M350 400V155a60 60 0 0 1 120 0v245" fill="#4d675a" />
        <circle cx="185" cy="170" r="95" fill="#dca255" />
        <path d="m60 400 140-200 140 200" fill="#7f93a4" />
        <rect x="0" y="350" width="600" height="50" fill="#d5c4ad" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 600 400"
      role="img"
      aria-label="Original wellness illustration with botanical leaves and balanced stones"
    >
      <rect width="600" height="400" fill="#e0dfca" />
      <circle cx="425" cy="90" r="130" fill="#f5ead5" />
      <path d="M0 330Q200 260 600 330v70H0Z" fill="#b3b49c" />
      <g fill="#64816a">
        <path d="M100 350Q80 130 220 100 230 240 100 350Z" />
        <path d="M110 330Q0 250 35 160 160 190 110 330Z" />
        <path d="M500 330q-70-130 20-190 70 110-20 190Z" />
      </g>
      <ellipse cx="350" cy="320" rx="100" ry="35" fill="#8d9486" />
      <ellipse cx="350" cy="265" rx="75" ry="30" fill="#a7ac99" />
      <ellipse cx="350" cy="215" rx="50" ry="23" fill="#c3c4b1" />
    </svg>
  );
}

function FeatureIllustration({ kind }: { kind: string }) {
  if (kind === "online-store")
    return (
      <svg viewBox="0 0 100 70" aria-hidden="true">
        <rect width="100" height="70" rx="4" fill="#e8dfd4" />
        <path
          d="m35 15-15 13 10 12 7-7v28h29V33l7 7 10-12-15-13-9 7h-15Z"
          fill="#f9f4eb"
        />
      </svg>
    );
  if (kind === "creator-vlogging")
    return (
      <svg viewBox="0 0 100 70" aria-hidden="true">
        <rect width="100" height="70" rx="4" fill="#b79ac4" />
        <circle cx="50" cy="35" r="18" fill="#f4e8ec" />
        <path d="m46 26 13 9-13 9Z" fill="#6a4d7c" />
      </svg>
    );
  if (kind === "personal-creative")
    return (
      <svg viewBox="0 0 100 70" aria-hidden="true">
        <rect width="100" height="70" fill="#d5bca0" />
        <circle cx="70" cy="25" r="18" fill="#a76e52" />
        <path d="m0 70 40-50 40 50" fill="#6c8176" />
      </svg>
    );
  return null;
}

export function SampleWebsite({
  design,
  compact = false,
}: {
  design: WebsiteDesign;
  compact?: boolean;
}) {
  return (
    <div
      data-sample-design={design.id}
      data-compact={compact || undefined}
      className="sample-website"
    >
      <div className="sample-site-nav">
        <strong>{design.brand}</strong>
        <span>Discover&nbsp;&nbsp; About&nbsp;&nbsp; Contact</span>
      </div>
      <div className="sample-hero">
        <div className="sample-art">
          {design.imageSrc ? (
            <Image
              src={design.imageSrc}
              alt={design.imageAlt ?? design.name}
              width={960}
              height={640}
              unoptimized
              loading="lazy"
            />
          ) : (
            <OriginalScene kind={design.id} />
          )}
        </div>
        <div className="sample-copy">
          <p>{design.eyebrow}</p>
          <div className="sample-headline">{design.headline}</div>
          <span className="sample-cta">{design.cta}</span>
        </div>
      </div>
      <div className="sample-features">
        {design.features.map((feature, index) => (
          <span key={feature}>
            <FeatureIllustration kind={design.id} />
            <i>{String(index + 1).padStart(2, "0")}</i>
            {feature}
          </span>
        ))}
      </div>
      <div
        className="sample-socials"
        aria-label="Social media integration examples only"
      >
        {design.socialPlatforms.map((platform) => (
          <span
            key={platform}
            role="img"
            title={`${platform} integration example`}
            aria-label={`${platform} integration example`}
          >
            <PlatformIcon platform={platform} />
          </span>
        ))}
        <small>Social integration examples</small>
      </div>
    </div>
  );
}
