import React from "react";
import {
  getGoogleReviewUrl,
  getHandoffSocialLinks,
  socialLinks as defaultSocialSettings,
  type SocialLinkSettings,
} from "@/lib/social-links";
import { FeedbackForm } from "@/components/handoff/feedback-form";
import { supportEmail } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export type CompletionDetails = {
  businessName: string;
  websiteUrl: string;
  message: string | null;
};

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#93c5fd]";

export function CompletionCard({
  details,
  feedbackToken,
  socialSettings = defaultSocialSettings,
}: {
  details: CompletionDetails;
  feedbackToken?: string;
  socialSettings?: SocialLinkSettings;
}) {
  const reviewUrl = getGoogleReviewUrl(socialSettings);
  const socialLinks = getHandoffSocialLinks(socialSettings);

  return (
    <article className="glass-card mx-auto max-w-3xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]" />
      <div className="p-6 sm:p-10 lg:p-12">
        <div
          aria-hidden="true"
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#60a5fa]/30 bg-[#3b82f6]/15 text-2xl text-[#93c5fd]"
        >
          ✓
        </div>
        <p className="section-kicker">Website complete</p>
        <h1 className="mt-4 break-words text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Your website is ready,
          <br />
          <span className="text-[#bfdbfe]">{details.businessName}.</span>
        </h1>
        <p className="mt-6 text-base leading-8 text-slate-300">
          Thank you for choosing Steady Start LLC. It&apos;s been a pleasure
          bringing your business online. We&apos;re excited to see what you do
          next.
        </p>
        {details.message ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white">
              A note from Steady Start
            </h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
              {details.message}
            </p>
          </div>
        ) : null}
        <div className="mt-8">
          <a
            href={details.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className={`${primaryButtonClass} ${focus} force-white-btn min-h-11 w-full gap-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto`}
          >
            Visit your website <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <p className="mt-3 break-all text-sm text-slate-400">
            {details.websiteUrl}
          </p>
        </div>
        {reviewUrl ? (
          <section
            className="mt-8 border-t border-white/10 pt-8"
            aria-labelledby="review-heading"
          >
            <h2
              id="review-heading"
              className="text-lg font-semibold text-white"
            >
              We&apos;d Love Your Feedback!
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Thank you for choosing Steady Start. We&apos;d love to hear about
              your experience working with us. Your honest feedback helps others
              discover our services.
            </p>
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className={`${primaryButtonClass} ${focus} force-white-btn mt-4 min-h-11 w-full gap-2 text-sm motion-reduce:transform-none motion-reduce:transition-none sm:w-auto`}
            >
              <span aria-hidden="true">★</span> Leave a Google Review
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </section>
        ) : null}
        {feedbackToken ? <FeedbackForm token={feedbackToken} /> : null}
        {socialLinks.length ? (
          <section
            className="mt-8 border-t border-white/10 pt-8"
            aria-labelledby="social-heading"
          >
            <h2
              id="social-heading"
              className="text-lg font-semibold text-white"
            >
              Stay Connected With Us!
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Follow and subscribe to Steady Start LLC for business tips,
              website inspiration, and updates.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className={`${secondaryButtonClass} ${focus} min-h-11 px-4 text-sm motion-reduce:transform-none motion-reduce:transition-none`}
                >
                  {label} — {label === "YouTube" ? "Subscribe" : "Follow Us"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
        <p className="mt-8 text-sm leading-7 text-slate-400">
          Need a hand?{" "}
          <a
            href={`mailto:${supportEmail}`}
            className={`${focus} break-all text-[#bfdbfe] underline underline-offset-4`}
          >
            Contact Steady Start
          </a>
          .
        </p>
      </div>
    </article>
  );
}
