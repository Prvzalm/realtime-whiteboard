import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listBoards } from "@/lib/services/board-service";

const marketingRoutes = [
  {
    href: "/features",
    title: "Product features",
    description:
      "Explore the realtime canvas, cursor presence, and extensible toolbars.",
  },
  {
    href: "/solutions",
    title: "Team solutions",
    description:
      "Run planning rituals, critiques, and async workshops from one canvas.",
  },
  {
    href: "/pricing",
    title: "Predictable pricing",
    description:
      "Start free, then upgrade to unlock governance and enterprise tooling.",
  },
  {
    href: "/docs",
    title: "API & SDK",
    description:
      "Connect boards to your stack using REST endpoints and realtime channels.",
  },
  {
    href: "/contact",
    title: "Talk to humans",
    description:
      "Partner with us for bespoke integrations or white-glove onboarding.",
  },
];

const systemHighlights = [
  {
    title: "Vercel-native deployment",
    body: "App Router, Edge WebSockets, and KV-ready env vars make deploys zero-config across regions.",
    badge: "Deploy",
  },
  {
    title: "Resilient realtime core",
    body: "Zustand buffers optimism while Mongo snapshots + Redis events recover boards instantly.",
    badge: "Realtime",
  },
  {
    title: "Extensible services",
    body: "Typed services, hooks, and API routes welcome custom templates, auth, and workflows.",
    badge: "Build",
  },
];

export default async function Home() {
  const session = await getSession();
  const boards = session ? await listBoards(session.user.id) : [];
  const primaryCtaHref = session ? "/boards" : "/login";
  const primaryCtaLabel = session ? "Launch a board" : "Sign in to continue";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="grid gap-10 rounded-3xl bg-linear-to-br from-white via-sky-50 to-blue-100 p-10 text-slate-900 shadow-2xl md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Realtime Collaboration
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            Build diagrams, brainstorm, and align teams inside your browser.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Powered by Vercel Edge WebSockets, Mongo snapshots, and Redis
            presence streams for globally distributed product teams.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={primaryCtaHref}
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500"
            >
              {primaryCtaLabel}
            </Link>
            <Link
              href="/features"
              className="rounded-full border border-sky-200 px-6 py-3 text-sm font-semibold text-sky-900 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Explore features
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Need docs? Head to{" "}
            <Link href="/docs" className="font-semibold text-sky-700">
              /docs
            </Link>{" "}
            or ping us via{" "}
            <Link href="/contact" className="font-semibold text-sky-700">
              /contact
            </Link>
            .
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-slate-500">
            <span>Pinned boards</span>
            <Link
              href="/boards"
              className="text-xs font-semibold text-slate-700 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {session ? (
              boards.length > 0 ? (
                boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span>{board.name}</span>
                    <span className="text-xs text-slate-500">Open →</span>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No boards yet. Deploy the project, then create your first
                  canvas via the API route.
                </p>
              )
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                <p>Sign in to pin your boards here and jump back in faster.</p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Go to login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {marketingRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              {route.title}
            </span>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {route.description}
            </p>
            <span className="mt-6 text-sm font-semibold text-slate-900">
              Visit {route.href} →
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systemHighlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">
              {highlight.badge}
            </span>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {highlight.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{highlight.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-linear-to-br from-white via-slate-50 to-sky-100 p-10 text-center shadow-lg">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Ready to collaborate?
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-900">
          Deploy to Vercel, invite your team, and start sketching ideas in under
          5 minutes.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/boards"
            className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500"
          >
            Open the boards hub
          </Link>
          <Link
            href="/docs"
            className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
          >
            Read the docs
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
