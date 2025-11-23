import { NextResponse } from "next/server";
import { z } from "zod";
import { boardShapeSchema } from "@/lib/types/board";
import { requireSession } from "@/lib/auth/session";
import { getBoardForUser, persistSnapshot } from "@/lib/services/board-service";

const snapshotSchema = z.object({
  shapes: z.array(boardShapeSchema),
});

interface RouteContext {
  params: Promise<{ boardId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { boardId } = await context.params;
  const { user } = await requireSession();
  const payload = await getBoardForUser(boardId, user.id).catch(() => null);
  if (!payload) {
    return NextResponse.json({ message: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(payload);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { boardId } = await context.params;
  const { user } = await requireSession();
  const boardExists = await getBoardForUser(boardId, user.id).catch(() => null);
  if (!boardExists) {
    return NextResponse.json({ message: "Board not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = snapshotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  await persistSnapshot({
    boardId,
    shapes: parsed.data.shapes,
  });
  return NextResponse.json({ ok: true });
}
