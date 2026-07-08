"use client";

import { FormEvent, useState } from "react";

import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type AuthFormProps = {
  isSignup: boolean;
  nextPath: string;
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";

function createTemporarySession(nextPath: string) {
  document.cookie = "steady_start_session=local-preview; path=/; max-age=86400; SameSite=Lax";
  window.location.assign(nextPath || "/dashboard");
}

export function AuthForm({ isSignup, nextPath }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    createTemporarySession(nextPath);
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="button"
        onClick={() => createTemporarySession(nextPath)}
        className={`${secondaryButtonClass} w-full justify-center text-sm`}
      >
        Continue with Google
      </button>

      <div className="my-6 h-px bg-[var(--line)]" />

      {isSignup ? (
        <label className="block text-sm font-medium text-white">
          Name
          <input name="name" type="text" className={inputClassName} />
        </label>
      ) : null}
      <label className={`block text-sm font-medium text-white ${isSignup ? "mt-5" : ""}`}>
        Email
        <input name="email" type="email" required className={inputClassName} />
      </label>
      <label className="mt-5 block text-sm font-medium text-white">
        Password
        <input name="password" type="password" required className={inputClassName} />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${primaryButtonClass} force-white-btn mt-8 w-full justify-center text-sm disabled:opacity-80`}
      >
        {isSubmitting ? "Continuing..." : isSignup ? "Create Account" : "Log In"}
      </button>

      <p className="mt-5 text-center text-xs leading-6 text-[var(--muted)]">
        This preview login opens the protected builder dashboard. Supabase auth can
        replace it with production email/password and Google sign-in.
      </p>
    </form>
  );
}
