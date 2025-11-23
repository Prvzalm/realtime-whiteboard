"use client";

import { type CanvasTool } from "@/components/canvas/whiteboard-canvas";
import { cn } from "@/lib/utils/cn";
import {
  PenSquare,
  StickyNote,
  ArrowUpRight,
  MousePointer,
  Eraser,
  Undo2,
  Redo2,
  Edit3,
} from "lucide-react";

const PALETTE = ["#0f172a", "#2563eb", "#16a34a", "#f59e0b", "#ec4899"];

interface BoardToolbarProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  strokeColor: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onEditNoteShortcut: () => void;
  canEditNoteShortcut: boolean;
  isEditNoteArmed: boolean;
}

export function BoardToolbar({
  activeTool,
  onToolChange,
  strokeColor,
  onColorChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onEditNoteShortcut,
  canEditNoteShortcut,
  isEditNoteArmed,
}: BoardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2">
        <ToolbarButton
          label="Select"
          icon={<MousePointer className="h-4 w-4" />}
          isActive={activeTool === "select"}
          onClick={() => onToolChange("select")}
        />
        <ToolbarButton
          label="Pen"
          icon={<PenSquare className="h-4 w-4" />}
          isActive={activeTool === "pen"}
          onClick={() => onToolChange("pen")}
        />
        <ToolbarButton
          label="Sticky"
          icon={<StickyNote className="h-4 w-4" />}
          isActive={activeTool === "sticky"}
          onClick={() => onToolChange("sticky")}
        />
        <ToolbarButton
          label="Arrow"
          icon={<ArrowUpRight className="h-4 w-4" />}
          isActive={activeTool === "arrow"}
          onClick={() => onToolChange("arrow")}
        />
        <ToolbarButton
          label="Erase"
          icon={<Eraser className="h-4 w-4" />}
          isActive={activeTool === "eraser"}
          onClick={() => onToolChange("eraser")}
        />
      </div>

      <div className="flex items-center gap-2">
        {PALETTE.map((color) => (
          <button
            key={color}
            aria-label={`Use color ${color}`}
            type="button"
            className={cn(
              "h-8 w-8 rounded-full border-2 border-transparent transition cursor-pointer",
              strokeColor === color &&
                "ring-2 ring-sky-400 ring-offset-2 ring-offset-white"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
        <ToolbarButton
          label="Edit note"
          icon={<Edit3 className="h-4 w-4" />}
          isActive={isEditNoteArmed}
          onClick={onEditNoteShortcut}
          disabled={!canEditNoteShortcut}
        />
        <ToolbarButton
          label="Undo"
          icon={<Undo2 className="h-4 w-4" />}
          isActive={false}
          onClick={onUndo}
          disabled={!canUndo}
        />
        <ToolbarButton
          label="Redo"
          icon={<Redo2 className="h-4 w-4" />}
          isActive={false}
          onClick={onRedo}
          disabled={!canRedo}
        />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({
  label,
  icon,
  isActive,
  onClick,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
        isActive
          ? "border-sky-300 bg-sky-50 text-sky-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-700",
        "cursor-pointer",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
    >
      {icon}
      {label}
    </button>
  );
}
