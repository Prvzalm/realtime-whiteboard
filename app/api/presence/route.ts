import { NextResponse } from "next/server";
import { z } from "zod";
import { getRedis } from "@/lib/redis/client";

const presenceSchema = z.object({
  boardId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  cursor: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
  lastSeen: z.number(),
  role: z.enum(["editor", "spectator"]),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const boardId = url.searchParams.get("boardId");
  if (!boardId) {
    return NextResponse.json({ message: "Missing boardId" }, { status: 400 });
  }

  try {
    const redis = getRedis();
    const raw = await redis.hgetall(`presence:${boardId}`);
    const presence = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        return [
          key,
          {
            ...parsed,
            role:
              parsed.role === "editor" || parsed.role === "spectator"
                ? parsed.role
                : "editor",
          },
        ];
      })
    );
    return NextResponse.json({ presence });
  } catch (error) {
    console.error("[presence] Failed to load", error);
    return NextResponse.json({ presence: {} });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = presenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    const redis = getRedis();
    const { boardId, userId } = parsed.data;
    await redis.hset(
      `presence:${boardId}`,
      userId,
      JSON.stringify({ ...parsed.data, expiresAt: Date.now() + 8_000 })
    );
    await redis.expire(`presence:${boardId}`, 10);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[presence] Failed to persist", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
