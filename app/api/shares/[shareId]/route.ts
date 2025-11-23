import { NextResponse } from "next/server";
import { getBoardByShare } from "@/lib/services/board-service";

interface RouteContext {
  params: Promise<{ shareId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { shareId } = await context.params;
  try {
    const payload = await getBoardByShare(shareId);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Share link not found" },
      { status: 404 }
    );
  }
}
