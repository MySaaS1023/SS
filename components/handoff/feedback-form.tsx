"use client";

import React, { useId, useState } from "react";

export function FeedbackForm({ token }: { token: string }) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<{ ok: boolean; message: string }>({
    ok: false,
    message: "",
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setState({ ok: false, message: "" });
    try {
      const response = await fetch("/api/handoff/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating: Number(form.get("rating")),
          comment: String(form.get("comment") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      if (response.status === 409) {
        setState({
          ok: true,
          message:
            "Thank you! A review has already been submitted for this handoff. Contact Steady Start if you need to update your feedback.",
        });
        return;
      }
      if (!response.ok) throw new Error("submission_failed");
      setState({
        ok: true,
        message:
          "Thank you! Your feedback has been shared privately with Steady Start LLC.",
      });
    } catch {
      setState({
        ok: false,
        message:
          "We couldn't save your feedback. Please try again or contact Steady Start for help.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="mt-8 border-t border-[var(--line)] pt-8"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} className="text-lg font-semibold text-[var(--foreground)]">
        Leave Us a Review
      </h2>
      <p id={`${id}-help`} className="mt-2 text-sm leading-7 text-[var(--muted)]">
        Tell us about your experience. Your rating and written feedback are
        private and will not appear on this page.
      </p>
      {state.ok ? (
        <p role="status" className="mt-4 text-sm leading-7 text-[var(--primary)]">
          {state.message}
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="mt-4"
          aria-describedby={`${id}-help`}
        >
          <fieldset disabled={pending}>
            <legend className="text-sm font-medium text-[var(--muted)]">
              Your rating (required)
            </legend>
            <div className="mt-2 flex max-w-xs justify-between gap-0">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className="relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-[var(--line)] p-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--primary)] has-[:checked]:border-[var(--line)]"
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="rating"
                    value={value}
                    required
                    checked={rating === value}
                    onChange={() => setRating(value)}
                  />
                  <span className="sr-only">
                    {value} {value === 1 ? "star" : "stars"}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`text-2xl ${value <= rating ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
                  >
                    ★
                  </span>
                </label>
              ))}
            </div>
            <label
              htmlFor={`${id}-comment`}
              className="mt-4 block text-sm font-medium text-[var(--muted)]"
            >
              Written feedback (optional)
            </label>
            <textarea
              id={`${id}-comment`}
              name="comment"
              rows={4}
              maxLength={1000}
              aria-describedby={`${id}-limit`}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] focus:outline-2 focus:outline-[var(--primary)]"
            />
            <p
              id={`${id}-limit`}
              className="mt-2 text-xs leading-6 text-[var(--muted)]"
            >
              Up to 1,000 characters. Please do not include passwords or
              sensitive information.
            </p>
            <div hidden aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-4 min-h-11 w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 sm:w-auto"
            >
              {pending ? "Submitting…" : "Submit Review"}
            </button>
          </fieldset>
          {state.message ? (
            <p role="alert" className="mt-4 text-sm leading-7 text-red-800">
              {state.message}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
