"use client";

import { useState } from "react";
import { BoardShell } from "@/components/board/board-shell";
import { BoardHeader } from "@/components/board/board-header";
import { BoardToolbar } from "@/components/board/board-toolbar";
import {
  WhiteboardCanvas,
  type CanvasTool,
} from "@/components/canvas/whiteboard-canvas";
import type { BoardSnapshot, BoardSummary } from "@/lib/types/board";
import { useBoardStore } from "@/lib/store/board-store";
import { ShareLinkButton } from "@/components/board/share-link-button";

interface BoardExperienceProps {
  board: BoardSummary;
  snapshot: BoardSnapshot;
}

export function BoardExperience({ board, snapshot }: BoardExperienceProps) {
  const [tool, setTool] = useState<CanvasTool>("pen");
  const [strokeColor, setStrokeColor] = useState("#111827");
  const undo = useBoardStore((state) => state.undo);
  const redo = useBoardStore((state) => state.redo);
  const canUndo = useBoardStore((state) => state.history.length > 0);
  const canRedo = useBoardStore((state) => state.future.length > 0);
  const hasStickyNotes = useBoardStore((state) =>
    state.shapes.some((shape) => shape.kind === "sticky")
  );
  const [editShortcutToken, setEditShortcutToken] = useState(0);
  const [isEditShortcutArmed, setIsEditShortcutArmed] = useState(false);

  const triggerEditShortcut = () => {
    setEditShortcutToken((token) => token + 1);
    setIsEditShortcutArmed(true);
  };

  return (
    <BoardShell
      header={
        <BoardHeader
          name={board.name}
          lastUpdated={new Date(board.updatedAt).toLocaleString()}
          actions={<ShareLinkButton boardId={board.id} />}
        />
      }
      toolbar={
        <BoardToolbar
          activeTool={tool}
          onToolChange={setTool}
          strokeColor={strokeColor}
          onColorChange={setStrokeColor}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onEditNoteShortcut={triggerEditShortcut}
          canEditNoteShortcut={hasStickyNotes}
          isEditNoteArmed={isEditShortcutArmed}
        />
      }
    >
      <WhiteboardCanvas
        boardId={board.id}
        initialShapes={snapshot.shapes ?? []}
        activeTool={tool}
        strokeColor={strokeColor}
        userName="You"
        presenceAlias="Owner"
        editShortcutToken={editShortcutToken}
        onEditShortcutConsumed={() => setIsEditShortcutArmed(false)}
      />
    </BoardShell>
  );
}
