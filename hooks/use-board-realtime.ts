"use client";

import { useEffect, useMemo } from "react";
import { nanoid } from "nanoid";
import { createRealtimeChannel } from "@/lib/realtime/channel";
import { useBoardStore } from "@/lib/store/board-store";
import type {
  BoardShape,
  PresenceState,
  RealtimeMessage,
} from "@/lib/types/board";

interface UseBoardRealtimeParams {
  boardId: string;
  onPresence?: (presence: PresenceState) => void;
  role?: "editor" | "spectator";
}

interface UseBoardRealtimeResult {
  createShape: (shape: BoardShape) => void;
  publishShape: (shape: BoardShape) => void;
  deleteShape: (shapeId: string) => void;
  publishPresence: (presence: Omit<PresenceState, "userId">) => void;
  clientId: string;
}

export function useBoardRealtime({
  boardId,
  onPresence,
  role = "editor",
}: UseBoardRealtimeParams): UseBoardRealtimeResult {
  const addShape = useBoardStore((state) => state.addShape);
  const removeShape = useBoardStore((state) => state.removeShape);

  const clientId = useMemo(() => nanoid(), []);
  const canEdit = role === "editor";

  const channel = useMemo(
    () => createRealtimeChannel(boardId, { role, clientId }),
    [boardId, role, clientId]
  );

  useEffect(() => {
    const unsubscribe = channel.subscribe((message: RealtimeMessage) => {
      switch (message.type) {
        case "shape:create":
        case "shape:update":
          addShape(message.payload);
          break;
        case "shape:delete":
          removeShape(message.payload.id);
          break;
        case "presence:update":
          onPresence?.(message.payload);
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
      channel.dispose();
    };
  }, [channel, addShape, removeShape, onPresence, boardId, role]);

  const createShape = (shape: BoardShape) => {
    if (!canEdit) return;
    channel.send({ type: "shape:create", payload: shape });
  };

  const publishShape = (shape: BoardShape) => {
    if (!canEdit) return;
    channel.send({ type: "shape:update", payload: shape });
  };

  const deleteShape = (shapeId: string) => {
    if (!canEdit) return;
    channel.send({ type: "shape:delete", payload: { id: shapeId } });
  };

  const publishPresence = (presence: Omit<PresenceState, "userId">) => {
    channel.send({
      type: "presence:update",
      payload: { ...presence, userId: clientId },
    });
  };

  return { createShape, publishShape, deleteShape, publishPresence, clientId };
}
