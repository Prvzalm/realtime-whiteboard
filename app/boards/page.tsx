import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { listBoards } from "@/lib/services/board-service";
import { CreateBoardForm } from "@/components/board/create-board-form";

export default async function BoardsPage() {
  const { user } = await requireSession();
  const boards = await listBoards(user.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-500">Boards</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Pick a board to jump back in.
        </h1>
        <p className="text-sm text-slate-500">
          Boards load instantly thanks to Mongo snapshots and realtime sync.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Why teams ship faster
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Launch a canvas, share the link, and keep everyone in sync.
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>• Snapshots auto-save every update so you never lose work.</li>
            <li>
              • Share links let reviewers watch in realtime without editing.
            </li>
            <li>
              • Ownership stays tied to your login for clear accountability.
            </li>
          </ul>
          <p className="mt-5 text-sm text-slate-500">
            Need API control? Hit{" "}
            <Link href="/docs" className="font-semibold text-slate-900">
              /docs
            </Link>{" "}
            for webhook and SDK examples.
          </p>
        </div>
        <CreateBoardForm />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Workspace
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              {board.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Last edited {new Date(board.updatedAt).toLocaleString()}
            </p>
          </Link>
        ))}
        {!boards.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
            No boards yet. Use the form above to create your first canvas.
          </div>
        )}
      </section>
    </main>
  );
}
