import { z } from "zod";

export const shapeKinds = [
  "pen",
  "rectangle",
  "ellipse",
  "arrow",
  "text",
  "sticky",
] as const;

export type ShapeKind = (typeof shapeKinds)[number];

export const boardShapeSchema = z.object({
  id: z.string(),
  kind: z.enum(shapeKinds),
  points: z.array(z.number()).default([]),
  text: z.string().optional(),
  textColor: z.string().default("#0f172a"),
  fill: z.string().default("#111827"),
  strokeWidth: z.number().default(3),
  rotation: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  lockedBy: z.string().optional(),
});

export type BoardShape = z.infer<typeof boardShapeSchema>;

export interface BoardSummary {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardSnapshot {
  boardId: string;
  version: number;
  shapes: BoardShape[];
  updatedAt: string;
}

export interface PresenceState {
  userId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  lastSeen: number;
  role: "editor" | "spectator";
}

export type PresenceMap = Record<string, PresenceState>;

export interface BoardShare {
  shareId: string;
  boardId: string;
  createdBy: string;
  createdAt: string;
}

export type RealtimeMessage =
  | { type: "shape:create"; payload: BoardShape }
  | { type: "shape:update"; payload: BoardShape }
  | { type: "shape:delete"; payload: { id: string } }
  | { type: "presence:update"; payload: PresenceState };
