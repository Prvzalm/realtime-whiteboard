"use client";

import { useId, useMemo } from "react";
import { BoardShell } from "@/components/board/board-shell";
import { BoardHeader } from "@/components/board/board-header";
import { WhiteboardCanvas } from "@/components/canvas/whiteboard-canvas";
import type { BoardSnapshot, BoardSummary } from "@/lib/types/board";
import { cn } from "@/lib/utils/cn";

interface SpectatorExperienceProps {
  board: BoardSummary;
  snapshot: BoardSnapshot;
  shareId: string;
}

export function SpectatorExperience({
  board,
  snapshot,
  shareId,
}: SpectatorExperienceProps) {
  const viewerId = useId();
  const viewerName = useMemo(() => {
    const stripped = viewerId.replace(/[^a-zA-Z0-9]/g, "");
    const suffix = stripped.slice(-4) || stripped || "guest";
    return `Viewer-${suffix}`;
  }, [viewerId]);

  return (
    <BoardShell
      header={
        <BoardHeader
          name={board.name}
          workspaceName="Shared board"
          lastUpdated={new Date(board.updatedAt).toLocaleString()}
          actions={<ReadOnlyBadge />}
        />
      }
      toolbar={<SpectatorToolbar shareId={shareId} />}
    >
      <WhiteboardCanvas
        boardId={board.id}
        initialShapes={snapshot.shapes ?? []}
        activeTool="select"
        strokeColor="#0f172a"
        userName={viewerName}
        editShortcutToken={0}
        mode="spectator"
        shareId={shareId}
      />
    </BoardShell>
  );
}

function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
      Read-only
    </span>
  );
}

function SpectatorToolbar({ shareId }: { shareId: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600">
      <span>
        Live mirror of this board. You can follow along but editing is disabled.
      </span>
      <code
        className={cn(
          "rounded-full bg-slate-100 px-3 py-1 text-xs font-mono text-slate-500"
        )}
      >
        share/{shareId}
      </code>
    </div>
  );
}
