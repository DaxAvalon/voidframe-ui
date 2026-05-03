"use client";

// Phase 11 — DragDropContext + Droppable + Draggable + Sortable
//
// Lightweight HTML5-drag based drag/drop primitives plus a higher-level
// `<Sortable>` for ordering a list of items. Includes a keyboard fallback
// (Space picks up, ArrowKeys move, Space drops, Escape cancels) so these
// flows stay accessible without touch/mouse.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { itemKeyAttrs } from "../hooks/useItemKey";
import { cx } from "../utils/cx";

export interface DragEndEvent {
  draggableId: string;
  source: { droppableId: string | null; index: number };
  destination: { droppableId: string; index: number } | null;
}

interface DragDropContextValue {
  registerDroppable: (id: string, list: string[] | null) => void;
  beginDrag: (draggableId: string, fromDroppable: string | null, fromIndex: number) => void;
  endDrag: (event: DragEndEvent) => void;
  draggingId: string | null;
  source: { droppableId: string | null; index: number } | null;
  hover: { droppableId: string; index: number } | null;
  setHover: (h: { droppableId: string; index: number } | null) => void;
}

const DragDropContextCtx = createContext<DragDropContextValue | null>(null);
function useDragDrop(): DragDropContextValue {
  const ctx = useContext(DragDropContextCtx);
  if (!ctx) throw new Error("Draggable / Droppable must be inside <DragDropContext>");
  return ctx;
}

export interface DragDropContextProps {
  onDragStart?: (event: { draggableId: string; source: { droppableId: string | null; index: number } }) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  children?: ReactNode;
}

/**
 * Root provider for the drag-and-drop system. Wraps `Draggable` /
 * `Droppable` children and coordinates drag state.
 */
export function DragDropContext({
  onDragStart,
  onDragEnd,
  children,
}: DragDropContextProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [source, setSource] = useState<DragDropContextValue["source"]>(null);
  const [hover, setHover] = useState<DragDropContextValue["hover"]>(null);
  const droppables = useRef(new Map<string, string[] | null>());

  const registerDroppable = useCallback(
    (id: string, list: string[] | null) => {
      droppables.current.set(id, list);
    },
    []
  );

  const beginDrag = useCallback(
    (draggableId: string, fromDroppable: string | null, fromIndex: number) => {
      const src = { droppableId: fromDroppable, index: fromIndex };
      setSource(src);
      setDraggingId(draggableId);
      onDragStart?.({ draggableId, source: src });
    },
    [onDragStart]
  );

  const endDrag = useCallback(
    (event: DragEndEvent) => {
      onDragEnd?.(event);
      setSource(null);
      setDraggingId(null);
      setHover(null);
    },
    [onDragEnd]
  );

  const value = useMemo<DragDropContextValue>(
    () => ({
      registerDroppable,
      beginDrag,
      endDrag,
      draggingId,
      source,
      hover,
      setHover,
    }),
    [registerDroppable, beginDrag, endDrag, draggingId, source, hover]
  );

  return (
    <DragDropContextCtx.Provider value={value}>
      {children}
    </DragDropContextCtx.Provider>
  );
}

// ── Droppable ────────────────────────────────────────────────

export interface DroppableRenderProps {
  dropRef: (el: HTMLElement | null) => void;
  isOver: boolean;
}

export interface DroppableProps {
  id: string;
  /** Render-prop receives drop ref + over-state. */
  children: (props: DroppableRenderProps) => ReactNode;
}

/**
 * Drop target inside a `DragDropContext`. Emits drop events with the dragged
 * payload.
 */
export function Droppable({ id, children }: DroppableProps) {
  const ctx = useDragDrop();
  const [el, setEl] = useState<HTMLElement | null>(null);

  // Stable ref callback — writes once per element-change, never on re-render,
  // so downstream consumers using `{...p}` don't get a new ref each render.
  const dropRef = useCallback((node: HTMLElement | null) => {
    setEl(node);
  }, []);

  // Latest-ctx ref so the listeners don't need to re-attach every time ctx
  // changes — preserves correct behavior without the per-render leak.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    if (!el) return;
    const onDragOver = (e: Event) => {
      e.preventDefault();
      const de = e as globalThis.DragEvent;
      if (de.dataTransfer) de.dataTransfer.dropEffect = "move";
      ctxRef.current.setHover({ droppableId: id, index: 0 });
    };
    const onDrop = (e: Event) => {
      e.preventDefault();
      const c = ctxRef.current;
      if (!c.source || !c.draggingId) return;
      c.endDrag({
        draggableId: c.draggingId,
        source: c.source,
        destination: c.hover,
      });
    };
    const onDragLeave = (e: Event) => {
      const de = e as globalThis.DragEvent;
      const next = de.relatedTarget as Node | null;
      if (next && el.contains(next)) return;
      ctxRef.current.setHover(null);
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("drop", onDrop);
    el.addEventListener("dragleave", onDragLeave);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("drop", onDrop);
      el.removeEventListener("dragleave", onDragLeave);
    };
  }, [el, id]);

  const isOver = ctx.hover?.droppableId === id;
  return <>{children({ dropRef, isOver })}</>;
}

// ── Draggable ────────────────────────────────────────────────

export interface DraggableRenderProps {
  dragRef: (el: HTMLElement | null) => void;
  isDragging: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
}

export interface DraggableProps {
  id: string;
  /** When inside a Droppable, supply the list index for keyboard fallback. */
  index?: number;
  /** Optional droppable id this draggable belongs to. */
  droppableId?: string | null;
  children: (props: DraggableRenderProps) => ReactNode;
}

/**
 * Wraps a child to make it draggable inside a `DragDropContext`. Emits
 * lifecycle events for drag start, move, end.
 */
export function Draggable({
  id,
  index = 0,
  droppableId = null,
  children,
}: DraggableProps) {
  const ctx = useDragDrop();
  const isDragging = ctx.draggingId === id;
  const elRef = useRef<HTMLElement | null>(null);

  const dragRef = (el: HTMLElement | null) => {
    elRef.current = el;
    if (!el) return;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
      }
      ctx.beginDrag(id, droppableId, index);
    });
    el.addEventListener("dragend", () => {
      if (ctx.draggingId === id) {
        ctx.endDrag({
          draggableId: id,
          source: ctx.source ?? { droppableId: null, index: 0 },
          destination: ctx.hover,
        });
      }
    });
  };

  // Keyboard fallback. `dragHandleProps` is wired by the consumer.
  const [picked, setPicked] = useState(false);
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!picked) {
        setPicked(true);
        ctx.beginDrag(id, droppableId, index);
      } else {
        setPicked(false);
        ctx.endDrag({
          draggableId: id,
          source: ctx.source ?? { droppableId, index },
          destination: ctx.hover,
        });
      }
    } else if (e.key === "Escape" && picked) {
      e.preventDefault();
      setPicked(false);
      ctx.endDrag({
        draggableId: id,
        source: ctx.source ?? { droppableId, index },
        destination: null,
      });
    }
  };

  const dragHandleProps: React.HTMLAttributes<HTMLElement> = {
    role: "button",
    tabIndex: 0,
    "aria-grabbed": picked || isDragging || undefined,
    "aria-label": `Drag handle for ${id}`,
    onKeyDown: onKey,
  };

  return <>{children({ dragRef, isDragging, dragHandleProps })}</>;
}

// ── Sortable (higher-level) ──────────────────────────────────

export type SortStrategy = "vertical" | "horizontal" | "grid";

/**
 * Handle props emitted by voidframe's `Sortable`. Typed with `any` as
 * the element parameter so consumers can spread these onto a `<button>`,
 * `<span>`, `<div>`, or custom polymorphic component without a type cast.
 * Narrowing this via a generic would require threading a second type
 * parameter through `Sortable<T, HandleEl>`, which hurts ergonomics for
 * a prop whose contents are deliberately a structural open set.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SortableDragHandleProps = React.HTMLAttributes<any>;

export interface SortableRenderProps {
  dragHandleProps: SortableDragHandleProps;
  isDragging: boolean;
}

export interface SortableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: T[];
  /** Read a stable id from each item. */
  getKey: (item: T) => string;
  onValueChange: (next: T[]) => void;
  renderItem: (item: T, index: number, render: SortableRenderProps) => ReactNode;
  strategy?: SortStrategy;
  /** When true, only the dragHandleProps element initiates the drag. */
  handle?: boolean;
}

/**
 * Wraps a list to make its items reorderable via drag. Keyboard-reorder with
 * arrow keys after picking.
 */
export function Sortable<T>({
  value: items,
  getKey,
  onValueChange,
  renderItem,
  strategy = "vertical",
  handle,
  className,
  style,
  ...props
}: SortableProps<T>) {
  const [dragging, setDragging] = useState<{ id: string; from: number } | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to) return;
    const copy = items.slice();
    const [removed] = copy.splice(from, 1);
    if (removed === undefined) return;
    copy.splice(to, 0, removed);
    onValueChange(copy);
  };

  const layoutStyle: CSSProperties = {
    display:
      strategy === "horizontal"
        ? "flex"
        : strategy === "grid"
          ? "grid"
          : "flex",
    flexDirection: strategy === "vertical" ? "column" : strategy === "horizontal" ? "row" : undefined,
    gap: 4,
    ...style,
  };

  return (
    <div
      role="list"
      className={cx("vf-sortable", `vf-sortable--${strategy}`, className)}
      style={layoutStyle}
      {...props}
    >
      {items.map((item, i) => {
        const key = getKey(item);
        const isDragging = dragging?.id === key;
        const dragHandleProps: React.HTMLAttributes<HTMLElement> = {
          role: "button",
          tabIndex: 0,
          "aria-label": `Drag ${key}`,
          draggable: true,
          onDragStart: (e: DragEvent<HTMLElement>) => {
            setDragging({ id: key, from: i });
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", key);
            }
          },
          onDragEnd: () => {
            setDragging(null);
            setOver(null);
          },
          onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
            if (
              e.key !== "ArrowUp" &&
              e.key !== "ArrowDown" &&
              e.key !== "ArrowLeft" &&
              e.key !== "ArrowRight"
            )
              return;
            e.preventDefault();
            const dir =
              e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
            const to = i + dir;
            if (to < 0 || to >= items.length) return;
            move(i, to);
          },
        };
        return (
          <div
            key={key}
            role="listitem"
            {...itemKeyAttrs("item", String(key))}
            className={cx(
              "vf-sortable__item",
              isDragging && "vf-sortable__item--dragging",
              over === i && "vf-sortable__item--drop-hint"
            )}
            draggable={!handle}
            onDragStart={
              handle
                ? undefined
                : (e: DragEvent<HTMLDivElement>) => {
                    setDragging({ id: key, from: i });
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
                  }
            }
            onDragOver={(e) => {
              if (!dragging) return;
              e.preventDefault();
              if (over !== i) setOver(i);
            }}
            onDrop={(e) => {
              if (!dragging) return;
              e.preventDefault();
              move(dragging.from, i);
              setDragging(null);
              setOver(null);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
          >
            {renderItem(item, i, { dragHandleProps, isDragging })}
          </div>
        );
      })}
    </div>
  );
}

/** Alias of Sortable with list semantics — same component, different name. */
export const ReorderList = Sortable;

