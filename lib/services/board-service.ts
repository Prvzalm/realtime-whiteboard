import { randomUUID } from "crypto";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db/mongo";
import type {
  BoardShape,
  BoardShare,
  BoardSnapshot,
  BoardSummary,
} from "@/lib/types/board";
import { serverEnv } from "@/lib/config/env";

const BOARD_COLLECTION = "boards";
const SNAPSHOT_COLLECTION = "board_snapshots";
const SHARE_COLLECTION = "board_shares";

const fallbackBoard: BoardSummary = {
  id: "demo-board",
  name: "Product Strategy Sprint",
  slug: "product-strategy-sprint",
  ownerId: "demo-user",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const fallbackSnapshot: BoardSnapshot = {
  boardId: fallbackBoard.id,
  version: 1,
  shapes: [],
  updatedAt: new Date().toISOString(),
};

function stripMongoId<T extends Record<string, unknown>>(
  doc: T | null
): T | null {
  if (!doc) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = doc as T & { _id?: unknown };
  return rest as T;
}

export async function listBoards(ownerId: string): Promise<BoardSummary[]> {
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;

  if (!db) {
    return [fallbackBoard];
  }

  const boards = await db
    .collection<BoardSummary>(BOARD_COLLECTION)
    .find({ ownerId }, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();

  return boards;
}

export async function getBoard(
  boardId: string
): Promise<{ board: BoardSummary; snapshot: BoardSnapshot }> {
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;

  if (!db) {
    return { board: fallbackBoard, snapshot: fallbackSnapshot };
  }

  const boardDoc = await db
    .collection<BoardSummary>(BOARD_COLLECTION)
    .findOne({ id: boardId });
  const board = stripMongoId(boardDoc);
  if (!board) {
    throw new Error("BOARD_NOT_FOUND");
  }

  const snapshotDoc = await db
    .collection<BoardSnapshot>(SNAPSHOT_COLLECTION)
    .find({ boardId })
    .sort({ version: -1 })
    .limit(1)
    .next();
  const snapshot = stripMongoId(snapshotDoc);

  return {
    board,
    snapshot: snapshot ?? { ...fallbackSnapshot, boardId },
  };
}

export async function getBoardForUser(boardId: string, ownerId: string) {
  const payload = await getBoard(boardId);
  if (payload.board.ownerId !== ownerId) {
    throw new Error("BOARD_FORBIDDEN");
  }
  return payload;
}

interface CreateBoardPayload {
  name: string;
  ownerId: string;
}

export async function createBoard(payload: CreateBoardPayload) {
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;
  if (!db) {
    return { ...fallbackBoard, name: payload.name };
  }
  const now = new Date().toISOString();
  const board: BoardSummary = {
    id: randomUUID(),
    name: payload.name,
    slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
    ownerId: payload.ownerId,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(BOARD_COLLECTION).insertOne(board);
  await db.collection(SNAPSHOT_COLLECTION).insertOne({
    boardId: board.id,
    version: 1,
    shapes: [] as BoardShape[],
    updatedAt: now,
  });

  return board;
}

interface SaveSnapshotPayload {
  boardId: string;
  shapes: BoardShape[];
}

export async function persistSnapshot({
  boardId,
  shapes,
}: SaveSnapshotPayload) {
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;
  if (!db) {
    return;
  }
  const latest = await db
    .collection(SNAPSHOT_COLLECTION)
    .find({ boardId })
    .sort({ version: -1 })
    .limit(1)
    .next();

  const version = (latest?.version ?? 0) + 1;
  await db.collection(SNAPSHOT_COLLECTION).insertOne({
    boardId,
    version,
    shapes,
    updatedAt: new Date().toISOString(),
  });

  await db
    .collection(BOARD_COLLECTION)
    .updateOne(
      { id: boardId },
      { $set: { updatedAt: new Date().toISOString() } }
    );
}

export async function createBoardShare(
  boardId: string,
  ownerId: string
): Promise<BoardShare> {
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;
  if (!db) {
    return {
      shareId: "demo-share",
      boardId: fallbackBoard.id,
      createdBy: ownerId,
      createdAt: new Date().toISOString(),
    };
  }

  await getBoardForUser(boardId, ownerId);

  const share: BoardShare = {
    shareId: nanoid(12),
    boardId,
    createdBy: ownerId,
    createdAt: new Date().toISOString(),
  };

  await db.collection(SHARE_COLLECTION).insertOne(share);
  return share;
}

export async function getBoardByShare(shareId: string) {
  const db = serverEnv.MONGODB_URI ? await getDb().catch(() => null) : null;
  if (!db) {
    if (shareId === "demo-share") {
      return { board: fallbackBoard, snapshot: fallbackSnapshot };
    }
    throw new Error("SHARE_NOT_FOUND");
  }

  const share = await db
    .collection<BoardShare>(SHARE_COLLECTION)
    .findOne({ shareId });
  if (!share) {
    throw new Error("SHARE_NOT_FOUND");
  }

  return getBoard(share.boardId);
}
