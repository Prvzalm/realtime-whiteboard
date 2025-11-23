import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Realtime Whiteboard – Contact",
  description:
    "Talk with the maintainers, request enterprise onboarding, or ask for custom integrations.",
};

const contacts = [
  {
    title: "Support",
    detail: "support@realtimewhiteboard.dev",
    body: "Day-one setup help, bug reports, and guidance on deploying to Vercel.",
  },
  {
    title: "Enterprise",
    detail: "sales@realtimewhiteboard.dev",
    body: "Procurement, security reviews, and white-glove rollouts across regions.",
  },
  {
    title: "Community",
    detail: "https://github.com/vercel",
    body: "Open-source discussions, roadmap requests, and contribution guidelines.",
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Contact
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          We ship with your team.
        </h1>
        <p className="text-lg text-slate-600">
          Reach out for enterprise onboarding, partnership opportunities, or to
          show off what you built on the realtime stack.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {contacts.map((contact) => (
          <article
            key={contact.title}
            className="rounded-3xl border border-slate-100 bg-white p-6 text-left"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {contact.title}
            </p>
            <a
              href={
                contact.detail.startsWith("http")
                  ? contact.detail
                  : `mailto:${contact.detail}`
              }
              target={contact.detail.startsWith("http") ? "_blank" : undefined}
              rel={contact.detail.startsWith("http") ? "noreferrer" : undefined}
              className="mt-3 block text-lg font-semibold text-slate-900 hover:underline"
            >
              {contact.detail}
            </a>
            <p className="mt-2 text-sm text-slate-600">{contact.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
