import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

const highlights = [
  "Boards stay private to your login",
  "Share links keep spectators read-only",
  "Mongo + Redis keep realtime data synced",
];

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
      <div className="grid w-full gap-10 rounded-3xl bg-linear-to-br from-white via-slate-50 to-sky-100 p-10 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Sign in to continue
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            Access your realtime boards and invite teammates.
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Use your work email so we can keep your canvases, templates, and
            share links scoped to the right workspace.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-600">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  *
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-sm text-slate-600">
            <p>
              Back to marketing site? Head over to{" "}
              <Link href="/" className="font-semibold text-slate-900">
                home
              </Link>
              .
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
