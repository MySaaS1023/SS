export type SeoLandingPageContent = {
  slug:
    | "wix-alternative"
    | "shopify-alternative"
    | "squarespace-alternative"
    | "custom-website-vs-wix"
    | "custom-website-vs-shopify"
    | "custom-website-vs-squarespace"
    | "website-without-monthly-fees";
  title: string;
  description: string;
  h1: string;
  intro: string;
  comparisonTitle: string;
  comparisonPoints: string[];
  benefitsTitle: string;
  benefits: string[];
  ctaTitle: string;
  ctaText: string;
};

export const seoPages: Record<SeoLandingPageContent["slug"], SeoLandingPageContent> = {
  "wix-alternative": {
    slug: "wix-alternative",
    title: "Wix Alternative | Done-For-You Business Websites | Steady Start",
    description:
      "Looking for a Wix alternative? Steady Start builds done-for-you business websites for owners who want a professional site without managing a DIY builder.",
    h1: "A cleaner alternative to Wix for business owners who want it done for them.",
    intro:
      "Wix can be useful when you want to experiment, but many business owners outgrow the time, design decisions, and setup work that come with building the site themselves. Steady Start gives you a more direct path: your website gets planned, built, and launch-ready without the drag of figuring everything out alone.",
    comparisonTitle: "Why business owners move on from Wix",
    comparisonPoints: [
      "DIY builders still require you to make design, layout, and messaging decisions on your own.",
      "Template-based pages can make it harder to present your business in a polished, credible way.",
      "A done-for-you build gives you a faster route to a live site without weeks of tweaking.",
    ],
    benefitsTitle: "What you get instead",
    benefits: [
      "A custom site structure built around your actual business goals.",
      "A cleaner launch process without learning a builder or plugin stack.",
      "Support with setup, launch direction, and a more professional online presence.",
    ],
    ctaTitle: "Ready to move past the Wix learning curve?",
    ctaText:
      "Steady Start helps you launch with a simpler done-for-you website process instead of spending more time inside a builder.",
  },
  "shopify-alternative": {
    slug: "shopify-alternative",
    title: "Shopify Alternative | Custom Website Setup for Small Businesses | Steady Start",
    description:
      "Need a Shopify alternative? Steady Start builds custom websites for businesses that want a simple, professional setup without monthly platform dependency.",
    h1: "A practical Shopify alternative for businesses that do not want platform lock-in.",
    intro:
      "Shopify is powerful for certain stores, but it can feel heavy for businesses that mainly need a polished website, simple payments, and a clean way to get online. Steady Start focuses on building the site around what your business actually needs instead of forcing you into a bigger platform than necessary.",
    comparisonTitle: "Where Shopify can become too much",
    comparisonPoints: [
      "Monthly platform costs add up even when your needs are simple.",
      "Store-first tooling can feel excessive for service businesses or early-stage founders.",
      "A custom build can keep your setup lean while still supporting payments and growth.",
    ],
    benefitsTitle: "What a custom alternative looks like",
    benefits: [
      "A more focused website experience tailored to your offers and customer journey.",
      "Payment-ready setup without carrying a full ecommerce platform you may not need.",
      "A launch plan designed for credibility, clarity, and easier long-term control.",
    ],
    ctaTitle: "Want a simpler path than Shopify?",
    ctaText:
      "Steady Start can help you launch a custom business website that feels lighter, cleaner, and easier to manage from day one.",
  },
  "squarespace-alternative": {
    slug: "squarespace-alternative",
    title: "Squarespace Alternative | Custom Websites Without DIY Builders | Steady Start",
    description:
      "Comparing a Squarespace alternative? Steady Start creates done-for-you websites for businesses that want a polished launch without building everything themselves.",
    h1: "A better Squarespace alternative when you want a website built for you.",
    intro:
      "Squarespace can help you get started, but it still expects you to shape the pages, write the content, and make the design choices. If you want a stronger result without carrying all of that yourself, Steady Start offers a done-for-you approach that keeps the process simple and more business-focused.",
    comparisonTitle: "Why some businesses move beyond Squarespace",
    comparisonPoints: [
      "Template edits can still take a lot of time when you are starting from scratch.",
      "The platform gives you tools, but not the strategic guidance behind what should go where.",
      "A custom-built site can feel more intentional, credible, and aligned with your business.",
    ],
    benefitsTitle: "What Steady Start changes",
    benefits: [
      "Your site is mapped to your real services, offers, and conversion goals.",
      "You skip the trial-and-error of styling, layout adjustments, and launch prep.",
      "The process stays simple while the final result feels more polished and professional.",
    ],
    ctaTitle: "Need more than another template edit?",
    ctaText:
      "Steady Start helps you launch a business website that feels clearer, stronger, and more complete than a DIY builder approach.",
  },
  "custom-website-vs-wix": {
    slug: "custom-website-vs-wix",
    title: "Custom Website vs Wix | Which Is Better for Your Business? | Steady Start",
    description:
      "Compare a custom website vs Wix. Steady Start helps business owners choose a simpler, done-for-you path when DIY site builders slow them down.",
    h1: "Custom website vs Wix: what makes more sense for your business?",
    intro:
      "If you are deciding between a custom website and Wix, the real question is how much of the work you want to own yourself. Wix gives you the builder. A custom website gives you a more tailored result and a smoother path when you want someone to handle the structure, setup, and launch direction.",
    comparisonTitle: "The practical difference",
    comparisonPoints: [
      "Wix gives you tools, but you still have to shape the pages and make the design decisions.",
      "A custom website can better reflect your offers, brand, and business goals from the start.",
      "Done-for-you support often saves time and reduces unfinished projects.",
    ],
    benefitsTitle: "Why founders often choose custom",
    benefits: [
      "Better alignment with what your business actually sells or supports.",
      "Less time lost inside template edits, design tweaks, and setup friction.",
      "A more credible site that is ready to launch with fewer compromises.",
    ],
    ctaTitle: "Want the custom route without agency complexity?",
    ctaText:
      "Steady Start gives you a simpler way to move from idea to live business website without handling the build alone.",
  },
  "custom-website-vs-shopify": {
    slug: "custom-website-vs-shopify",
    title: "Custom Website vs Shopify | Better Fit for Small Businesses | Steady Start",
    description:
      "Compare a custom website vs Shopify and find the right setup for your business. Steady Start helps owners launch without getting buried in platform overhead.",
    h1: "Custom website vs Shopify: choose the setup that fits your business stage.",
    intro:
      "Shopify is a strong platform for full ecommerce operations, but not every business needs that level of infrastructure. A custom website can be the better fit when you want a cleaner business presence, simpler payments, or a more flexible build without platform-heavy overhead.",
    comparisonTitle: "How the two paths differ",
    comparisonPoints: [
      "Shopify is built around store operations, while a custom site can be shaped around broader business needs.",
      "A custom build can feel leaner when you need credibility, clarity, and launch support more than platform tooling.",
      "For many founders, the simpler route wins when speed and focus matter most.",
    ],
    benefitsTitle: "Where a custom build helps",
    benefits: [
      "A website built around services, products, or mixed offers without unnecessary complexity.",
      "Cleaner customer journeys for businesses that do not need a full store backend from day one.",
      "A more guided launch process with less platform setup to manage yourself.",
    ],
    ctaTitle: "Need something simpler than Shopify?",
    ctaText:
      "Steady Start can help you launch a custom site that supports your business without committing to more platform than you really need.",
  },
  "custom-website-vs-squarespace": {
    slug: "custom-website-vs-squarespace",
    title: "Custom Website vs Squarespace | Business Website Comparison | Steady Start",
    description:
      "Compare a custom website vs Squarespace and find the right path for your business. Steady Start offers a done-for-you launch alternative to DIY site building.",
    h1: "Custom website vs Squarespace: more support, fewer compromises.",
    intro:
      "Squarespace can help you build something quickly, but it still leaves you responsible for structure, presentation, and launch details. A custom website offers a stronger fit when you want more intention behind the build and less pressure to make every decision yourself.",
    comparisonTitle: "What changes with a custom build",
    comparisonPoints: [
      "Squarespace gives you a starting point, while a custom build is shaped around your business from the beginning.",
      "You spend less time adjusting templates and more time moving toward a finished launch.",
      "A custom process often leads to a site that feels clearer, stronger, and more business-ready.",
    ],
    benefitsTitle: "Why a done-for-you route can win",
    benefits: [
      "Better messaging and page structure for businesses that need credibility fast.",
      "Less guesswork around what to include, how to organize it, and how to launch.",
      "A more guided experience that helps first-time founders get online with confidence.",
    ],
    ctaTitle: "Want more than a polished template?",
    ctaText:
      "Steady Start helps you launch a custom website that feels intentional, professional, and easier to move forward with.",
  },
  "website-without-monthly-fees": {
    slug: "website-without-monthly-fees",
    title: "Website Without Monthly Fees | Custom Business Website Help | Steady Start",
    description:
      "Looking for a website without monthly fees? Steady Start helps business owners launch custom websites without depending on another DIY platform subscription.",
    h1: "How to get a business website without piling on monthly platform fees.",
    intro:
      "Many business owners start with a website builder because it feels simple, then discover the long-term cost of stacking subscriptions, add-ons, and platform dependency. Steady Start offers a more direct path for businesses that want a professional website without building their whole online presence around monthly tools.",
    comparisonTitle: "Why monthly platform fees add friction",
    comparisonPoints: [
      "Recurring platform costs can feel unnecessary when your website needs are straightforward.",
      "Builders often push you toward add-ons, apps, and upgrades just to achieve a polished result.",
      "A custom build can give you a cleaner setup with fewer ongoing platform dependencies.",
    ],
    benefitsTitle: "What a simpler website setup gives you",
    benefits: [
      "A site built around your business goals rather than a platform subscription model.",
      "More clarity on what you are paying for and why it matters.",
      "A smoother launch experience for founders who want to get online without ongoing builder stress.",
    ],
    ctaTitle: "Want a cleaner way to launch online?",
    ctaText:
      "Steady Start helps you move toward a professional website setup without getting buried in another monthly platform stack.",
  },
};
