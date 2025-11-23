"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Stage, Layer, Line, Rect, Text, Arrow, Group } from "react-konva";
import type { KonvaEventObject, Node as KonvaNode } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { useBoardStore } from "@/lib/store/board-store";
import type { BoardShape, PresenceState } from "@/lib/types/board";
import { useBoardRealtime } from "@/hooks/use-board-realtime";
import { cn } from "@/lib/utils/cn";

export type CanvasTool = "pen" | "sticky" | "arrow" | "select" | "eraser";

interface WhiteboardCanvasProps {
  boardId: string;
  initialShapes: BoardShape[];
  activeTool: CanvasTool;
  strokeColor: string;
  userName: string;
  editShortcutToken: number;
  onEditShortcutConsumed?: () => void;
  mode?: "editor" | "spectator";
  presenceAlias?: string;
  shareId?: string;
}

const CANVAS_BACKGROUND = "#f8fafc";

const PRESENCE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#e11d48", "#a855f7"];
const PRESENCE_PERSIST_INTERVAL = 350;
const DEFAULT_STICKY_TEXT_COLOR = "#0f172a";
const STICKY_TEXT_COLORS = [
  DEFAULT_STICKY_TEXT_COLOR,
  "#1d4ed8",
  "#0f766e",
  "#15803d",
  "#b45309",
  "#be123c",
  "#6d28d9",
];

export function WhiteboardCanvas({
  boardId,
  initialShapes,
  activeTool,
  strokeColor,
  userName,
  editShortcutToken,
  onEditShortcutConsumed,
  mode = "editor",
  presenceAlias,
  shareId,
}: WhiteboardCanvasProps) {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [draftArrow, setDraftArrow] = useState<BoardShape | null>(null);
  const [editingSticky, setEditingSticky] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fill: string;
    textColor: string;
  } | null>(null);
  const [presence, setPresence] = useState<Record<string, PresenceState>>({});
  const [isQuickEditActive, setIsQuickEditActive] = useState(false);
  const [colorSeed] = useState(
    () => PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)]
  );
  const presenceFrameRef = useRef<number | null>(null);
  const pendingCursorRef = useRef<{ x: number; y: number } | null>(null);
  const lastPresencePersist = useRef(0);
  const editingInputRef = useRef<HTMLTextAreaElement | null>(null);
  const editShortcutRef = useRef(editShortcutToken);
  const stickyRefs = useRef<Record<string, KonvaNode | null>>({});
  const isSpectator = mode === "spectator";
  const realtimeRole: "editor" | "spectator" = isSpectator
    ? "spectator"
    : "editor";
  const broadcastName = presenceAlias ?? userName;

  const shapes = useBoardStore((state) => state.shapes);
  const loadShapes = useBoardStore((state) => state.loadShapes);
  const updateShape = useBoardStore((state) => state.updateShape);
  const addShape = useBoardStore((state) => state.addShape);
  const removeShape = useBoardStore((state) => state.removeShape);
  const selectShape = useBoardStore((state) => state.selectShape);
  const selectedShapeId = useBoardStore((state) => state.selectedShapeId);

  useEffect(() => {
    if (isSpectator) {
      return;
    }
    if (editShortcutToken !== editShortcutRef.current) {
      editShortcutRef.current = editShortcutToken;
      setIsQuickEditActive(true);
    }
  }, [editShortcutToken, isSpectator]);

  useEffect(() => {
    if (activeTool !== "select") {
      selectShape(null);
    }
  }, [activeTool, selectShape]);

  useEffect(() => {
    loadShapes(initialShapes);
  }, [initialShapes, loadShapes]);

  const editingSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (editingSticky) {
      const isNewSession = editingSessionRef.current !== editingSticky.id;
      if (isNewSession) {
        editingSessionRef.current = editingSticky.id;
        requestAnimationFrame(() => {
          editingInputRef.current?.focus();
          editingInputRef.current?.select();
        });
      }
    } else {
      editingSessionRef.current = null;
    }
  }, [editingSticky]);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      setStageSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const { createShape, publishShape, publishPresence, deleteShape, clientId } =
    useBoardRealtime({
      boardId,
      role: realtimeRole,
      onPresence: (incoming) => {
        setPresence((prev) => ({ ...prev, [incoming.userId]: incoming }));
      },
    });

  useEffect(() => {
    const interval = setInterval(() => {
      setPresence((prev) => {
        const next = { ...prev };
        Object.entries(next).forEach(([key, value]) => {
          if (Date.now() - value.lastSeen > 5_000) {
            delete next[key];
          }
        });
        return next;
      });
    }, 2_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPresence = async () => {
      try {
        const response = await fetch(`/api/presence?boardId=${boardId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!cancelled && data.presence) {
          setPresence((prev) => ({ ...prev, ...data.presence }));
        }
      } catch (error) {
        console.warn("[presence] Failed to sync", error);
      }
    };

    loadPresence();
    const interval = setInterval(loadPresence, 5_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [boardId]);

  useEffect(() => {
    if (!isSpectator || !shareId) {
      return;
    }

    let cancelled = false;

    const pollShapes = async () => {
      try {
        const response = await fetch(`/api/shares/${shareId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (!cancelled && data.snapshot?.shapes) {
          loadShapes(data.snapshot.shapes);
        }
      } catch (error) {
        console.warn("[spectator-poll] Failed to fetch shapes", error);
      }
    };

    const interval = setInterval(pollShapes, 1_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [shareId, isSpectator, loadShapes]);

  const persistPresence = useMemo(() => {
    return (payload: Omit<PresenceState, "userId">) => {
      const body = JSON.stringify({ boardId, userId: clientId, ...payload });
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/presence", blob);
      } else {
        fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => undefined);
      }
    };
  }, [boardId, clientId]);

  const visiblePresence = useMemo(() => {
    return Object.values(presence).filter((item) => {
      if (!item.cursor) {
        return false;
      }
      if (!isSpectator && item.role === "spectator") {
        return false;
      }
      return true;
    });
  }, [presence, isSpectator]);

  const getRelativePointer = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    return pointer ?? { x: 0, y: 0 };
  };

  const resolveShapeId = (node: KonvaNode | null): string | null => {
    let current: KonvaNode | null = node;
    while (current) {
      const nodeId =
        typeof current.id === "function" ? current.id() : undefined;
      if (nodeId) {
        return nodeId;
      }
      current = current.getParent();
    }
    return null;
  };

  const eraseAtPointer = (pointer: { x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage) return;
    const hit = stage.getIntersection(pointer);
    const shapeId = resolveShapeId(hit);
    if (!shapeId) return;
    removeShape(shapeId);
    deleteShape(shapeId);
  };

  const focusStickyByNode = (node: KonvaNode | null) => {
    const shapeId = resolveShapeId(node);
    if (!shapeId) return false;
    const sticky = shapes.find(
      (shape) => shape.id === shapeId && shape.kind === "sticky"
    );
    if (!sticky) return false;
    handleStickyDoubleClick(sticky);
    return true;
  };

  const focusStickyAtPointer = (pointer: { x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage) return false;
    const hit = stage.getIntersection(pointer);
    return focusStickyByNode(hit);
  };

  const syncStickyPosition = (
    shapeId: string,
    position: { x: number; y: number },
    commit: boolean
  ) => {
    const currentShape = useBoardStore
      .getState()
      .shapes.find((shape) => shape.id === shapeId && shape.kind === "sticky");
    if (!currentShape) {
      return;
    }
    const nextShape: BoardShape = {
      ...currentShape,
      points: [position.x, position.y],
    };
    updateShape(nextShape, { skipHistory: !commit });
    publishShape(nextShape);
  };

  const getShapeAtPointer = (pointer: { x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const hit = stage.getIntersection(pointer);
    const shapeId = resolveShapeId(hit);
    if (!shapeId) {
      return null;
    }
    return shapes.find((shape) => shape.id === shapeId) ?? null;
  };

  const handleStickyDoubleClick = (shape: BoardShape) => {
    if (isSpectator) return;
    const next = {
      id: shape.id,
      x: shape.points[0] ?? 0,
      y: shape.points[1] ?? 0,
      width: shape.width ?? 180,
      height: shape.height ?? 180,
      text: shape.text ?? "",
      fill: shape.fill ?? "#fef9c3",
      textColor: shape.textColor ?? DEFAULT_STICKY_TEXT_COLOR,
    };
    setEditingSticky(next);
  };

  const commitStickyEdit = () => {
    if (isSpectator) return;
    if (!editingSticky) return;
    const target = shapes.find((shape) => shape.id === editingSticky.id);
    if (!target) {
      setEditingSticky(null);
      return;
    }
    const nextShape: BoardShape = {
      ...target,
      text: editingSticky.text.trim() || "Untitled note",
      textColor: editingSticky.textColor,
    };
    updateShape(nextShape);
    publishShape(nextShape);
    setEditingSticky(null);
  };

  const handleStickyTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (isSpectator) return;
    const value = event.target.value;
    setEditingSticky((current) =>
      current ? { ...current, text: value } : current
    );
  };

  const handleStickyTextKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (isSpectator) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setEditingSticky(null);
      return;
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commitStickyEdit();
    }
  };

  const handleStickyTextColorSelect = (color: string) => {
    if (isSpectator) return;
    setEditingSticky((current) => {
      if (!current || current.textColor === color) {
        return current;
      }
      const target = shapes.find((shape) => shape.id === current.id);
      if (target) {
        const nextShape: BoardShape = { ...target, textColor: color };
        updateShape(nextShape);
        publishShape(nextShape);
      }
      return { ...current, textColor: color };
    });
  };

  const flushPresence = (cursor: { x: number; y: number } | null) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const payload = {
      name: broadcastName,
      color: colorSeed,
      cursor,
      lastSeen: now,
      role: realtimeRole,
    };
    publishPresence(payload);
    if (
      cursor === null ||
      now - lastPresencePersist.current >= PRESENCE_PERSIST_INTERVAL
    ) {
      lastPresencePersist.current = now;
      persistPresence(payload);
    }
  };

  const schedulePresence = (cursor: { x: number; y: number } | null) => {
    pendingCursorRef.current = cursor;
    if (presenceFrameRef.current !== null) {
      return;
    }
    presenceFrameRef.current = requestAnimationFrame(() => {
      presenceFrameRef.current = null;
      const pendingCursor = pendingCursorRef.current;
      pendingCursorRef.current = null;
      flushPresence(pendingCursor ?? null);
    });
  };

  const handlePointerDown = (event: KonvaEventObject<PointerEvent>) => {
    event.evt.preventDefault();
    if (editingSticky) {
      return;
    }

    const pointer = getRelativePointer();

    schedulePresence(pointer);

    if (isSpectator) {
      return;
    }

    if (isQuickEditActive) {
      setIsQuickEditActive(false);
      onEditShortcutConsumed?.();
      const stickyAtPointer = getShapeAtPointer(pointer);
      if (stickyAtPointer?.kind === "sticky") {
        handleStickyDoubleClick(stickyAtPointer);
        return;
      }
    }

    if (activeTool === "select") {
      const shapeId = resolveShapeId(event.target);
      if (!shapeId) {
        selectShape(null);
        return;
      }

      if (shapeId === selectedShapeId) {
        selectShape(null);
        const existing = stickyRefs.current[shapeId];
        const stopDrag = (
          existing as KonvaNode & {
            stopDrag?: () => void;
          }
        )?.stopDrag;
        if (typeof stopDrag === "function") {
          stopDrag.call(existing);
        }
        return;
      }

      selectShape(shapeId);
      requestAnimationFrame(() => {
        const node = stickyRefs.current[shapeId];
        if (!node) {
          return;
        }
        const startDrag = (node as KonvaNode & { startDrag?: () => void })
          ?.startDrag;
        if (typeof startDrag === "function") {
          startDrag.call(node);
        }
      });
      return;
    }

    if (activeTool === "eraser") {
      setIsErasing(true);
      eraseAtPointer(pointer);
      return;
    }

    if (activeTool === "pen") {
      const shape: BoardShape = {
        id: crypto.randomUUID(),
        kind: "pen",
        points: [pointer.x, pointer.y],
        textColor: strokeColor,
        fill: strokeColor,
        strokeWidth: 3,
        rotation: 0,
      };
      addShape(shape);
      createShape(shape);
      setIsDrawing(true);
    }

    if (activeTool === "sticky") {
      const tappedShape = getShapeAtPointer(pointer);
      if (tappedShape?.kind === "sticky") {
        return;
      }
      const shape: BoardShape = {
        id: crypto.randomUUID(),
        kind: "sticky",
        points: [pointer.x, pointer.y],
        text: "Double-click to edit",
        textColor: DEFAULT_STICKY_TEXT_COLOR,
        fill: strokeColor,
        strokeWidth: 0,
        width: 180,
        height: 180,
        rotation: 0,
      };
      addShape(shape);
      createShape(shape);
    }

    if (activeTool === "arrow") {
      const shape: BoardShape = {
        id: crypto.randomUUID(),
        kind: "arrow",
        points: [pointer.x, pointer.y, pointer.x, pointer.y],
        textColor: strokeColor,
        fill: strokeColor,
        strokeWidth: 3,
        rotation: 0,
      };
      setDraftArrow(shape);
      addShape(shape);
      createShape(shape);
      setIsDrawing(true);
    }
  };

  const handleDoubleClick = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (isSpectator || editingSticky) {
      return;
    }
    event.evt.preventDefault();
    const handled = focusStickyByNode(event.target);
    if (handled) {
      return;
    }
    const pointer = getRelativePointer();
    focusStickyAtPointer(pointer);
  };

  const handlePointerMove = () => {
    if (editingSticky) {
      return;
    }

    const pointer = getRelativePointer();
    schedulePresence(pointer);

    if (isSpectator) {
      return;
    }

    if (activeTool === "eraser" && isErasing) {
      eraseAtPointer(pointer);
      return;
    }

    if (!isDrawing) return;

    if (activeTool === "pen") {
      const current = shapes[shapes.length - 1];
      if (!current) return;
      const updated: BoardShape = {
        ...current,
        points: [...current.points, pointer.x, pointer.y],
      };
      updateShape(updated, { skipHistory: true });
      publishShape(updated);
    }

    if (activeTool === "arrow" && draftArrow) {
      const updated: BoardShape = {
        ...draftArrow,
        points: [
          draftArrow.points[0],
          draftArrow.points[1],
          pointer.x,
          pointer.y,
        ],
      };
      setDraftArrow(updated);
      updateShape(updated, { skipHistory: true });
      publishShape(updated);
    }
  };

  const handlePointerUp = () => {
    if (editingSticky) {
      return;
    }

    setIsDrawing(false);
    setDraftArrow(null);
    setIsErasing(false);
  };

  const handlePointerLeave = () => {
    if (editingSticky) {
      return;
    }

    schedulePresence(null);
    setIsDrawing(false);
    setIsErasing(false);
  };

  useEffect(() => {
    if (!shapes.length) {
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shapes }),
      }).catch((error) => console.warn("[autosave] Failed", error));
    }, 2_000);

    return () => clearTimeout(timer);
  }, [boardId, shapes]);

  useEffect(() => {
    return () => {
      if (presenceFrameRef.current !== null) {
        cancelAnimationFrame(presenceFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[calc(100vh-88px)] w-full">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        className="rounded-2xl border border-slate-200 bg-white shadow-inner"
        style={{ backgroundColor: CANVAS_BACKGROUND }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      >
        <Layer>
          {shapes.map((shape) => {
            switch (shape.kind) {
              case "pen":
                return (
                  <Line
                    key={shape.id}
                    id={shape.id}
                    points={shape.points}
                    stroke={shape.fill}
                    strokeWidth={shape.strokeWidth}
                    tension={0.4}
                    lineCap="round"
                    lineJoin="round"
                  />
                );
              case "sticky":
                return (
                  <Group
                    key={shape.id}
                    id={shape.id}
                    ref={(node) => {
                      if (node) {
                        stickyRefs.current[shape.id] = node;
                      } else {
                        delete stickyRefs.current[shape.id];
                      }
                    }}
                    x={shape.points[0] ?? 0}
                    y={shape.points[1] ?? 0}
                    draggable={
                      activeTool === "select" &&
                      shape.id === selectedShapeId &&
                      !isSpectator
                    }
                    onDblClick={() => handleStickyDoubleClick(shape)}
                    onDblTap={() => handleStickyDoubleClick(shape)}
                    onDragMove={(event) =>
                      syncStickyPosition(
                        shape.id,
                        {
                          x: event.target.x(),
                          y: event.target.y(),
                        },
                        false
                      )
                    }
                    onDragEnd={(event) =>
                      syncStickyPosition(
                        shape.id,
                        {
                          x: event.target.x(),
                          y: event.target.y(),
                        },
                        true
                      )
                    }
                  >
                    <Rect
                      x={0}
                      y={0}
                      width={shape.width ?? 180}
                      height={shape.height ?? 180}
                      fill={shape.fill}
                      stroke={
                        shape.id === selectedShapeId ? "#0284c7" : "transparent"
                      }
                      strokeWidth={shape.id === selectedShapeId ? 3 : 0}
                      cornerRadius={16}
                      shadowBlur={12}
                      opacity={0.92}
                    />
                    <Text
                      text={shape.text ?? ""}
                      x={16}
                      y={16}
                      width={(shape.width ?? 180) - 32}
                      fill={shape.textColor ?? DEFAULT_STICKY_TEXT_COLOR}
                      fontSize={16}
                      fontStyle="bold"
                      listening={false}
                    />
                  </Group>
                );
              case "arrow":
                return (
                  <Arrow
                    key={shape.id}
                    id={shape.id}
                    points={shape.points}
                    pointerLength={16}
                    pointerWidth={16}
                    stroke={shape.fill}
                    strokeWidth={shape.strokeWidth}
                    tension={0}
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>

      <div className="pointer-events-none absolute inset-0">
        {visiblePresence.map((item) => {
          const label =
            !isSpectator && item.userId === clientId ? userName : item.name;
          return (
            <div
              key={item.userId}
              className="absolute flex flex-col items-center text-xs font-medium"
              style={{
                transform: `translate(${item.cursor!.x}px, ${
                  item.cursor!.y
                }px)`,
              }}
            >
              <span
                className={cn("mb-1 rounded-full px-2 py-1 text-white")}
                style={{ backgroundColor: item.color }}
              >
                {label}
              </span>
              <span
                className="h-3 w-3 rotate-45"
                style={{ backgroundColor: item.color }}
              />
            </div>
          );
        })}
      </div>

      {!isSpectator && editingSticky && (
        <>
          <div
            className="pointer-events-auto absolute z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 shadow-lg"
            style={{
              left: editingSticky.x,
              top: Math.max(8, editingSticky.y - 56),
            }}
          >
            {STICKY_TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "h-6 w-6 rounded-full border border-transparent transition",
                  editingSticky.textColor === color &&
                    "ring-2 ring-slate-900/40 ring-offset-2 ring-offset-white"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Set text color ${color}`}
                aria-pressed={editingSticky.textColor === color}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleStickyTextColorSelect(color);
                }}
              />
            ))}
          </div>
          <textarea
            ref={editingInputRef}
            className="pointer-events-auto absolute z-40 resize-none rounded-2xl border bg-white/95 p-4 text-base font-semibold shadow-xl outline-none focus:ring-2 focus:ring-slate-500"
            style={{
              left: editingSticky.x,
              top: editingSticky.y,
              width: editingSticky.width,
              height: editingSticky.height,
              borderColor: editingSticky.fill,
              color: editingSticky.textColor,
            }}
            value={editingSticky.text}
            onChange={handleStickyTextChange}
            onBlur={commitStickyEdit}
            onKeyDown={handleStickyTextKeyDown}
            placeholder="Add your note"
          />
        </>
      )}
    </div>
  );
}
