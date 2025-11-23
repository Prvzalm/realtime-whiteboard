import type { Metadata } from "next";
import Link from "next/link";

const endpoints = [
  {
    method: "GET",
    path: "/api/boards",
    description: "List the most recent boards and metadata for the workspace.",
  },
  {
    method: "POST",
    path: "/api/boards",
    description:
      "Create a new board with the provided name and optional template id.",
  },
  {
    method: "GET",
    path: "/api/boards/[boardId]",
    description:
      "Fetch a specific board snapshot and latest realtime channel id.",
  },
  {
    method: "POST",
    path: "/api/realtime",
    description: "Broker secure channel tokens for Vercel Edge WebSockets.",
  },
];

const guides = [
  {
    title: "Embed the board canvas",
    href: "https://vercel.com/docs/edge-network/edge-middleware",
    body: "Use the whiteboard-canvas component standalone inside any React layout. The Zustand store exports selectors for strokes and cursors.",
  },
  {
    title: "Bring your own auth",
    href: "https://nextjs.org/docs/app/building-your-application/routing/middleware",
    body: "Scope boards per org by swapping the existing board service to read the user session. Middleware examples are provided in the README.",
  },
  {
    title: "Connect to Redis",
    href: "https://vercel.com/docs/storage/vercel-kv",
    body: "Update lib/redis/client.ts with your Upstash token or Vercel KV binding. Presence events flow automatically once credentials exist.",
  },
];

export const metadata: Metadata = {
  title: "Realtime Whiteboard – Docs",
  description:
    "API and integration docs for the collaborative whiteboard starter.",
};

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Docs
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Build on top of the realtime canvas.
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Use REST endpoints for provisioning, then subscribe to WebSockets for
          low-latency collaboration. Everything runs on the Next.js App Router
          and is ready for Vercel.
        </p>
      </header>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          REST API
        </div>
        <div className="divide-y divide-slate-100">
          {endpoints.map((endpoint) => (
            <article
              key={endpoint.path}
              className="flex flex-col gap-2 px-6 py-5 md:flex-row md:items-center md:gap-6"
            >
              <span className="inline-flex w-20 items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {endpoint.method}
              </span>
              <span className="font-mono text-sm text-slate-900">
                {endpoint.path}
              </span>
              <p className="text-sm text-slate-600">{endpoint.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {guides.map((guide) => (
          <article
            key={guide.title}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Guide
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{guide.body}</p>
            <Link
              href={guide.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
