import React from "react";
import {
  getGoogleReviewUrl,
  getGoogleProfileUrl,
  getHandoffSocialLinks,
  type SocialLinkSettings,
} from "@/lib/social-links";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";
import { PlatformIcon } from "./platform-icon";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300";

export function ConnectContent({ settings }: { settings: SocialLinkSettings }) {
  const reviewUrl = getGoogleReviewUrl(settings);
  const profileUrl = getGoogleProfileUrl(settings);
  const socials = getHandoffSocialLinks(settings);
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mx-auto max-w-2xl text-center">
        <p className="section-kicker">Steady Start</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Leave a Review &amp; Connect With Us
        </h1>
        <p className="mt-5 text-base leading-8 text-slate-300">
          Your feedback means a lot to us! Share your experience on Google and
          stay connected with Steady Start.
        </p>
      </header>
      <section
        aria-labelledby="connect-review-heading"
        className="glass-card relative mt-10 overflow-hidden p-6 sm:p-9"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"
        />
        <div
          aria-hidden="true"
          className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/25 bg-blue-500/10 text-blue-200"
        >
          <PlatformIcon platform="Google" />
        </div>
        <h2
          id="connect-review-heading"
          className="text-2xl font-semibold text-white"
        >
          Review Us on Google
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
          Tell us about your experience with Steady Start. Your honest feedback
          helps others discover our services.
        </p>
        {reviewUrl ? (
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className={`${primaryButtonClass} ${focus} force-white-btn mt-6 min-h-12 w-full gap-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto`}
          >
            <span aria-hidden="true">★</span> Leave a Google Review
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
            <p>Our direct Google review link is not available yet.</p>
            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className={`${secondaryButtonClass} ${focus} mt-4 min-h-11 w-full text-sm sm:w-auto`}
              >
                Visit our Google Business Profile
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        )}
      </section>
      <section aria-labelledby="connect-social-heading" className="mt-9">
        <h2
          id="connect-social-heading"
          className="text-2xl font-semibold text-white"
        >
          Follow Steady Start
        </h2>
        {socials.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className={`${secondaryButtonClass} ${focus} min-h-16 justify-start gap-4 p-5 motion-reduce:transform-none motion-reduce:transition-none`}
              >
                <span className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-blue-200">
                  <PlatformIcon platform={label} />
                </span>
                <span className="text-sm font-medium">
                  {label} — {label === "YouTube" ? "Subscribe" : "Follow Us"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Our business social links will appear here when they are configured.
          </p>
        )}
      </section>
    </div>
  );
}
