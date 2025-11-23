import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { listBoards, createBoard } from "@/lib/services/board-service";

const createBoardSchema = z.object({
  name: z.string().min(3),
});

export async function GET() {
  const { user } = await requireSession();
  const boards = await listBoards(user.id);
  return NextResponse.json({ boards });
}

export async function POST(request: Request) {
  const { user } = await requireSession();
  const body = await request.json();
  const parsed = createBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const board = await createBoard({ ...parsed.data, ownerId: user.id });
  return NextResponse.json({ board });
}
