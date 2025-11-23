import type { Metadata } from "next";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for prototypes and hackathons",
    highlights: [
      "Up to 2 collaborative boards",
      "Edge WebSockets on Vercel",
      "Community support",
    ],
    cta: "Deploy now",
  },
  {
    name: "Product Teams",
    price: "$29",
    description: "Ship rituals for squads and pods",
    highlights: [
      "Unlimited boards & guests",
      "Mongo snapshots + Redis presence",
      "Priority GitHub Issues support",
    ],
    cta: "Start free trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Compliance, governance, and SSO",
    highlights: [
      "Private networking and audit trails",
      "Dedicated Vercel project templates",
      "Solution engineering and SLAs",
    ],
    cta: "Talk to us",
  },
];

export const metadata: Metadata = {
  title: "Realtime Whiteboard – Pricing",
  description:
    "Simple, scalable pricing for teams turning the starter into a production-grade collaborative whiteboard.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Pricing
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          Scale collaboration without surprise overages.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Self-host freely or run on Vercel with predictable tiers that mirror
          how fast-moving SaaS teams grow.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {plan.name}
              </p>
              <p className="mt-4 text-4xl font-bold text-slate-900">
                {plan.price}
                <span className="text-base font-medium text-slate-500">
                  /month
                </span>
              </p>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
            </div>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-slate-600">
              {plan.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-2xl bg-slate-50 px-4 py-3"
                >
                  {highlight}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {plan.cta}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
