import type { Metadata } from "next";

const solutions = [
  {
    title: "Product planning",
    description:
      "Map out quarterly plans with multi-layer canvases, embed PRDs, and link to Linear issues directly from the board.",
    metrics: "120+ product orgs",
  },
  {
    title: "Engineering rituals",
    description:
      "Sketch architectures, resolve incidents, and annotate rollout plans with live presence and board history.",
    metrics: "68% faster sign-off",
  },
  {
    title: "Design critiques",
    description:
      "Drop in Figma frames, capture feedback inline, and sync exports automatically via webhooks.",
    metrics: "Trusted by 40 design teams",
  },
];

const workflows = [
  "Enterprise-ready RBAC hooks",
  "Board templates for retros + PI planning",
  "Slack + Teams notifications",
  "Observability via Vercel Web Analytics",
];

export const metadata: Metadata = {
  title: "Realtime Whiteboard – Solutions",
  description:
    "See how the realtime canvas accelerates planning, rituals, and reviews for modern SaaS teams.",
};

export default function SolutionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Use cases
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Orchestrate every ritual from one canvas.
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Realtime Whiteboard unblocks async and hybrid teams. Plug it into your
          existing stack and use the API routes or services folder to automate
          data flows between tools.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {solutions.map((solution) => (
          <article
            key={solution.title}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {solution.title}
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              {solution.description}
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {solution.metrics}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-3xl bg-slate-900 px-8 py-10 text-white">
        <h3 className="text-2xl font-semibold">Workflow accelerators</h3>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          The starter exposes hooks and API endpoints so you can bridge
          whiteboarding to issue trackers, analytics, and governance systems.
        </p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {workflows.map((workflow) => (
            <li
              key={workflow}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              {workflow}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
