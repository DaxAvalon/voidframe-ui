"use client";

import { useCallback, useReducer, useRef } from "react";

export interface UseUndoRedoOptions<T> {
  maxHistory?: number;
  isEqual?: (a: T, b: T) => boolean;
}

export interface UseUndoRedoReturn<T> {
  state: T;
  set: (value: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initialState?: T) => void;
  history: { past: T[]; present: T; future: T[] };
}

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

type UndoRedoAction<T> =
  | { type: "SET"; value: T; maxHistory?: number; isEqual?: (a: T, b: T) => boolean }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; initialState: T };

function reducer<T>(
  state: UndoRedoState<T>,
  action: UndoRedoAction<T>
): UndoRedoState<T> {
  switch (action.type) {
    case "SET": {
      if (action.isEqual && action.isEqual(state.present, action.value)) {
        return state;
      }
      const past = [...state.past, state.present];
      if (action.maxHistory !== undefined && past.length > action.maxHistory) {
        past.splice(0, past.length - action.maxHistory);
      }
      return { past, present: action.value, future: [] };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1] as T;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0] as T;
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    case "RESET": {
      return { past: [], present: action.initialState, future: [] };
    }
  }
}

/**
 * Undo/redo state management with history tracking.
 */
export function useUndoRedo<T>(
  initialState: T,
  options?: UseUndoRedoOptions<T>
): UseUndoRedoReturn<T> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const initialRef = useRef(initialState);

  const [state, dispatch] = useReducer(reducer<T>, {
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback((value: T | ((prev: T) => T)) => {
    // We need access to current present for functional updates.
    // useReducer dispatch gives us the current state in the reducer,
    // but we need to resolve the functional setter here.
    // Instead, we'll use a wrapper approach.
    dispatch({
      type: "SET" as const,
      value: value as T,
      maxHistory: optionsRef.current?.maxHistory,
      isEqual: optionsRef.current?.isEqual,
    });
  }, []);

  // For functional setter support, we need a different approach.
  // We'll use a ref to track current present and a custom dispatch.
  const presentRef = useRef(state.present);
  presentRef.current = state.present;

  const setWrapped = useCallback((value: T | ((prev: T) => T)) => {
    const resolved =
      typeof value === "function"
        ? (value as (prev: T) => T)(presentRef.current)
        : value;
    dispatch({
      type: "SET",
      value: resolved,
      maxHistory: optionsRef.current?.maxHistory,
      isEqual: optionsRef.current?.isEqual,
    });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const reset = useCallback(
    (newInitial?: T) =>
      dispatch({ type: "RESET", initialState: newInitial ?? initialRef.current }),
    []
  );

  return {
    state: state.present,
    set: setWrapped,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    reset,
    history: {
      past: state.past,
      present: state.present,
      future: state.future,
    },
  };
}
