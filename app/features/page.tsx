import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Realtime Whiteboard – Features",
  description:
    "Discover the multiplayer canvas, realtime presence, and integrations that ship with the Realtime Whiteboard starter.",
};

const features = [
  {
    title: "Realtime canvas",
    body: "Edge WebSockets keep every stroke, sticky, and frame synchronized across browsers with single-digit latency.",
  },
  {
    title: "Persistent history",
    body: "Mongo snapshots and versioning ensure boards recover instantly after deploys, cold starts, or client refreshes.",
  },
  {
    title: "Presence indicators",
    body: "Redis streams broadcast cursors, selection state, and avatar stacks so distributed teams feel co-located.",
  },
  {
    title: "Auth-ready",
    body: "Drop in your preferred provider (Clerk, Auth.js, Supabase) – routing and server actions are scoped for multi-tenant teams.",
  },
  {
    title: "Extensibility",
    body: "Bring your own widgets for Jira, Linear, or Notion. The board store exposes hooks for custom layers and tools.",
  },
  {
    title: "DX obsessed",
    body: "Type-safe services, ergonomic hooks, and Tailwind primitives keep shipping velocity high for small teams.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Product Capabilities
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Everything teams need to think in real time.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Built for product reviews, sprint rituals, and async strategy jams.
          The starter ships with batteries included so you can extend instead of
          reinvent.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {feature.title}
            </h2>
            <p className="mt-3 text-sm text-slate-600">{feature.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
