import { notFound } from "next/navigation";
import { getBoardForUser } from "@/lib/services/board-service";
import { BoardExperience } from "@/components/board/board-experience";
import { requireSession } from "@/lib/auth/session";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const { user } = await requireSession();
  const data = await getBoardForUser(boardId, user.id).catch(() => null);

  if (!data) {
    return notFound();
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10">
      <BoardExperience board={data.board} snapshot={data.snapshot} />
    </section>
  );
}
