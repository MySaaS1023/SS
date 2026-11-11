import React from "react";
import {
  getGoogleReviewUrl,
  getGoogleProfileUrl,
  getHandoffSocialLinks,
  type SocialLinkSettings,
} from "@/lib/social-links";
import { secondaryButtonClass } from "@/lib/styles";
import { PlatformIcon } from "./platform-icon";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300";

export function ConnectContent({ settings }: { settings: SocialLinkSettings }) {
  const reviewUrl = getGoogleReviewUrl(settings);
  const profileUrl = getGoogleProfileUrl(settings);
  const socials = getHandoffSocialLinks(settings);
  return (
    <div className="board-connect-content mx-auto max-w-3xl">
      <header>
        <p className="section-kicker">Steady Start</p>
        <h1>Stay Connected</h1>
        <p>
          Your feedback means a lot to us! Share your experience on Google and
          stay connected with Steady Start.
        </p>
      </header>
      <div className="board-connect-grid">
        {reviewUrl ? (
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className={`board-connect-tile ${focus}`}
          >
            <PlatformIcon platform="Google" />
            <span>
              Leave a Google Review
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
        ) : (
          <div className="board-connect-tile">
            <PlatformIcon platform="Google" />
            <p>Our direct Google review link is not available yet.</p>
            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className={`${secondaryButtonClass} ${focus}`}
              >
                Visit our Google Business Profile
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        )}
        {socials.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className={`board-connect-tile ${focus}`}
          >
            <PlatformIcon platform={label} />
            <span>
              {label} — {label === "YouTube" ? "Subscribe" : "Follow Us"}
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
        ))}
      </div>
      {socials.length ? null : (
        <p className="mt-4 text-sm">
          Our business social links will appear here when they are configured.
        </p>
      )}
    </div>
  );
}
