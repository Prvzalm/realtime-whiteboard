import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { createBoardShare } from "@/lib/services/board-service";

interface RouteContext {
  params: Promise<{ boardId: string }>;
}

export async function POST(_: Request, context: RouteContext) {
  const { user } = await requireSession();
  const { boardId } = await context.params;
  try {
    const share = await createBoardShare(boardId, user.id);
    return NextResponse.json({ shareId: share.shareId });
  } catch {
    return NextResponse.json(
      { message: "Unable to generate share link" },
      { status: 400 }
    );
  }
}
