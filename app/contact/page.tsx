import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";

export default function ContactPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <form className="glass-card mx-auto max-w-2xl p-8 sm:p-10">
          <div className="text-center">
            <p className="section-kicker">Contact</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Send us a message.
            </h1>
            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              Have a question about building your website with Steady Start?
              Send a message and we will follow up.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-white">
              Name
              <input name="name" type="text" required className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Email
              <input name="email" type="email" required className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Message
              <textarea name="message" required className={`${inputClassName} min-h-36 resize-y`} />
            </label>
          </div>

          <button
            type="submit"
            className={`${primaryButtonClass} force-white-btn mt-8 w-full justify-center text-sm`}
          >
            Send Message
          </button>
        </form>
      </PageContainer>
    </section>
  );
}
