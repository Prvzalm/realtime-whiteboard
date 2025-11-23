"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BoardShape } from "@/lib/types/board";

interface UpdateShapeOptions {
  skipHistory?: boolean;
}

interface BoardState {
  shapes: BoardShape[];
  selectedShapeId: string | null;
  history: BoardShape[][];
  future: BoardShape[][];
  loadShapes: (shapes: BoardShape[]) => void;
  addShape: (shape: BoardShape) => void;
  updateShape: (shape: BoardShape, options?: UpdateShapeOptions) => void;
  removeShape: (id: string) => void;
  selectShape: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

const HISTORY_LIMIT = 50;

function pushHistory(state: BoardState, previous: BoardShape[]) {
  const nextHistory = [...state.history, previous].slice(-HISTORY_LIMIT);
  return nextHistory;
}

export const useBoardStore = create<BoardState>()(
  devtools((set) => ({
    shapes: [],
    selectedShapeId: null,
    history: [],
    future: [],
    loadShapes: (shapes) => set({ shapes, history: [], future: [] }),
    addShape: (shape) =>
      set((state) => {
        const nextShapes = [
          ...state.shapes.filter((item) => item.id !== shape.id),
          shape,
        ];
        return {
          shapes: nextShapes,
          history: pushHistory(state, state.shapes),
          future: [],
        };
      }),
    updateShape: (shape, options) =>
      set((state) => {
        const nextShapes = state.shapes.map((current) =>
          current.id === shape.id ? { ...current, ...shape } : current
        );
        if (options?.skipHistory) {
          return { shapes: nextShapes };
        }
        return {
          shapes: nextShapes,
          history: pushHistory(state, state.shapes),
          future: [],
        };
      }),
    removeShape: (id) =>
      set((state) => {
        const nextShapes = state.shapes.filter((shape) => shape.id !== id);
        return {
          shapes: nextShapes,
          history: pushHistory(state, state.shapes),
          future: [],
        };
      }),
    selectShape: (id) => set({ selectedShapeId: id }),
    undo: () =>
      set((state) => {
        if (!state.history.length) {
          return state;
        }
        const previous = state.history[state.history.length - 1];
        return {
          shapes: previous,
          history: state.history.slice(0, -1),
          future: [state.shapes, ...state.future].slice(0, HISTORY_LIMIT),
        };
      }),
    redo: () =>
      set((state) => {
        if (!state.future.length) {
          return state;
        }
        const [next, ...rest] = state.future;
        return {
          shapes: next,
          history: [...state.history, state.shapes].slice(-HISTORY_LIMIT),
          future: rest,
        };
      }),
  }))
);
