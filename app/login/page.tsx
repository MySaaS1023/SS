import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const nextPath = params?.next;

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-12">
          <p className="section-kicker">Login</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Platform access is coming soon.
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)] sm:text-lg">
            The authenticated Steady Start application is now protected while the
            Supabase login and onboarding flow are being connected.
          </p>
          {nextPath ? (
            <p className="mt-4 rounded-2xl border border-[var(--line)] bg-white/6 px-4 py-3 text-sm text-[var(--muted)]">
              You tried to open <span className="font-semibold text-white">{nextPath}</span>.
              Sign in will route you there once authentication is enabled.
            </p>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/start-free" className={`${primaryButtonClass} force-white-btn text-sm`}>
              Start Free
            </Link>
            <Link href="/" className={`${secondaryButtonClass} text-sm`}>
              Back to Website
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
