import Image from "next/image";
import Link from "next/link";

import { primaryButtonClass } from "@/lib/styles";

const supportItems = [
  "Business Setup",
  "Custom-Built Websites",
  "AI Automation",
  "Online Presence & Growth",
];

const personalFacts = [
  "❤️ Mom of 3 (my own girl army.)",
  "🌴 I'm from the Pacific Islands, where we're surrounded by water... and I can't swim to save my life. 😂",
  "💼 Passionate about all things business, entrepreneurship, and financial independence. (Who isn't?)",
  "💻 I find website development and building businesses incredibly rewarding, especially in today's world. Being able to help entrepreneurs bring their ideas to life is one of the most fulfilling parts of what I do.",
  "🤖 Currently building an AI-powered platform for businesses. (Coming soon... I'm still brainstorming and bringing it to life!)",
];

const containerClass = "mx-auto w-[92vw] max-w-[1180px]";
const headingClass =
  "text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.6rem]";

export default function AboutPage() {
  return (
    <>
      <section className="py-16 sm:py-20 lg:py-24">
        <div className={containerClass}>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(390px,0.46fr)_minmax(0,0.54fr)] lg:gap-14 xl:gap-16">
            <figure className="mx-auto w-full max-w-[470px] lg:mx-0">
              <div className="relative h-[620px] overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] shadow-[0_24px_70px_rgba(2,6,23,0.42)] sm:h-[700px] lg:h-[760px]">
                <Image
                  src="/christine-wilson-founder.png"
                  alt="Christine Wilson, Founder of Steady Start LLC"
                  fill
                  priority
                  sizes="(min-width: 1024px) 430px, min(92vw, 470px)"
                  className="object-contain object-[center_top]"
                />
              </div>
              <figcaption className="px-2 pt-4 text-center">
                <p className="text-lg font-semibold text-white">Christine Wilson</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Founder, Steady Start LLC
                </p>
              </figcaption>
            </figure>

            <div className="space-y-7">
              <div className="space-y-5 text-base leading-8 text-[var(--muted)] sm:text-lg lg:pt-1">
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[#7da2ff]">
                  Meet the Owner
                </p>
                <h1 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.35rem]">
                  Hi, I&apos;m Christine Wilson.
                </h1>
                <p>
                  I started Steady Start because I know how overwhelming it can feel
                  to launch a business. Between choosing the right business structure,
                  building a professional website, and figuring out all the moving
                  pieces, it&apos;s easy to feel stuck before you even begin.
                </p>
                <div className="rounded-[1.5rem] border border-[rgba(59,130,246,0.34)] bg-[rgba(59,130,246,0.08)] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7da2ff]">
                    My goal is simple:
                  </p>
                  <p className="mt-3 text-2xl font-semibold leading-snug text-white">
                    To help entrepreneurs launch with confidence.
                  </p>
                </div>
                <p>
                  I want to help entrepreneurs cut down on unnecessary business
                  expenses by offering affordable business setup services and one-time
                  custom-built websites. My goal is to help you establish a
                  professional online presence without the expensive DIY website
                  builder subscriptions, so you can invest more of your time and money
                  into growing your business.
                </p>
                <p>
                  Beyond building your online presence, I help optimize and automate
                  your business using Google and other powerful business tools, so you
                  can spend less time managing everything and more time focusing on
                  what matters most—growing your business.
                </p>
                <p>
                  Whether you&apos;re starting your very first business or you&apos;re
                  ready to grow an existing one, I&apos;m here to make the process
                  simpler, more organized, and a little less overwhelming.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  I help entrepreneurs with:
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {supportItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-semibold text-white"
                    >
                      {item === "AI Automation" ? (
                        <strong className="font-semibold">AI Automation</strong>
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-base leading-8 text-[var(--muted)] sm:text-lg">
                <p>
                  Every business starts somewhere, and I&apos;d love to help you build
                  yours.
                </p>
                <p className="text-xl font-semibold text-white">
                  Let&apos;s build something you&apos;re proud of.
                </p>
              </div>

              <Link
                href="/get-started"
                className={`${primaryButtonClass} force-white-btn text-sm`}
              >
                Work With Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] py-16 sm:py-20 lg:py-24">
        <div className={containerClass}>
          <div className="mx-auto max-w-[940px]">
            <h2 className={`${headingClass} text-center`}>
              Why I Started Steady Start
            </h2>

            <div className="mt-8 space-y-5 text-base leading-8 text-[var(--muted)] sm:text-lg">
              <p>
                I started my journey three years ago as a stay-at-home mom. There were
                so many times I wasn&apos;t sure if I was doing the right thing or
                checking off all the things I needed to do to start a business.
              </p>
              <p>
                As a complete beginner, I quickly discovered that entrepreneurship
                isn&apos;t something most people openly talk about. I realized that
                building a business doesn&apos;t happen overnight—it doesn&apos;t get done
                with the snap of a finger. There are layers to it, and every step
                teaches you something new.
              </p>
              <p>Some days it feels exciting. Other days it feels overwhelming.</p>
              <p>That&apos;s exactly why I created Steady Start.</p>
              <p>
                I wanted entrepreneurs to have someone in their corner—someone who could
                simplify the process, answer the questions I wish I had asked, and
                provide real support from idea to launch.
              </p>
              <p>
                Whether it&apos;s forming your LLC, creating your website, or building your
                online presence, my mission is to help you move forward with clarity and
                confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className={containerClass}>
          <div className="mx-auto max-w-[900px]">
            <h2 className={`${headingClass} text-center`}>
              A Few Things About Me
            </h2>

            <div className="mt-8 grid gap-4">
              {personalFacts.map((fact) => (
                <div
                  key={fact}
                  className="glass-card rounded-xl border border-[rgba(255,255,255,0.18)] p-5 text-base leading-8 text-[var(--muted)] shadow-[var(--shadow)] sm:p-6"
                >
                  {fact}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className={containerClass}>
          <div className="glass-card mx-auto w-full max-w-[860px] rounded-[1.5rem] border border-[rgba(255,255,255,0.18)] p-8 text-center shadow-[var(--shadow)] sm:p-12 lg:p-14">
            <h2 className={headingClass}>Ready to Start?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Whether you need help launching your business, creating a professional
              website, or building your online presence, I&apos;d love to work with you.
            </p>
            <div className="mt-8">
              <Link
                href="/get-started"
                className={`${primaryButtonClass} force-white-btn text-sm`}
              >
                Work With Me
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
