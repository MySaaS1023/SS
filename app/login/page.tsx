import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { PageContainer } from "@/components/page-container";

type LoginPageProps = {
  searchParams?: Promise<{ mode?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const isSignup = params?.mode === "signup";
  const nextPath = params?.next ?? "/dashboard";

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-kicker">Login / Sign Up</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Continue to your website builder.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Create an account or log in to access your private Steady Start
              website builder dashboard.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <div className="flex rounded-2xl border border-[var(--line)] bg-white/6 p-1">
              <Link
                href="/login"
                className={`flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold ${
                  isSignup ? "text-[var(--muted)]" : "bg-white/10 text-white"
                }`}
              >
                Login
              </Link>
              <Link
                href="/login?mode=signup"
                className={`flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold ${
                  isSignup ? "bg-white/10 text-white" : "text-[var(--muted)]"
                }`}
              >
                Sign Up
              </Link>
            </div>
            <div className="mt-6">
              <AuthForm isSignup={isSignup} nextPath={nextPath} />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
