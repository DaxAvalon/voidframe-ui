import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createSafeContext } from "../utils/createSafeContext";
import { useMergedRefs } from "../hooks/useMergedRefs";
import type { Orientation } from "../types";

interface RovingFocusContextValue {
  orientation: Orientation;
  loop: boolean;
  currentValue: string | null;
  setCurrentValue: (v: string) => void;
  register: (value: string, element: HTMLElement | null) => () => void;
  /** Invoked by items on keydown to drive arrow-nav. */
  handleKeyDown: (e: ReactKeyboardEvent, itemValue: string) => void;
}

const [RovingFocusProvider, useRovingFocusContext] =
  createSafeContext<RovingFocusContextValue>({ name: "RovingFocusGroup" });

export interface RovingFocusGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  loop?: boolean;
  /** Controlled current-focus value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

/**
 * Coordinates arrow-key navigation across a group of focusable children.
 * Only one child is tab-reachable at a time (the "current" one); arrow keys
 * move focus within the group.
 *
 * Used by Tabs, Menu, Toolbar, RadioGroup, Stepper.
 */
export const RovingFocusGroup = forwardRef<HTMLDivElement, RovingFocusGroupProps>(
  function RovingFocusGroup(
    {
      orientation = "horizontal",
      loop = true,
      value,
      defaultValue,
      onValueChange,
      children,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
    const currentValue = value !== undefined ? value : internal;

    const items = useRef(new Map<string, HTMLElement>());
    // Preserve declaration order so arrow-nav matches visual order.
    const order = useRef<string[]>([]);

    const setCurrent = useCallback(
      (v: string) => {
        if (value === undefined) setInternal(v);
        onValueChange?.(v);
      },
      [value, onValueChange]
    );

    const register = useCallback(
      (itemValue: string, element: HTMLElement | null) => {
        if (element) {
          items.current.set(itemValue, element);
          if (!order.current.includes(itemValue)) {
            order.current.push(itemValue);
          }
        }
        return () => {
          items.current.delete(itemValue);
          order.current = order.current.filter((v) => v !== itemValue);
        };
      },
      []
    );

    const move = useCallback(
      (from: string, direction: -1 | 1) => {
        const list = order.current;
        const i = list.indexOf(from);
        if (i === -1) return;
        let next = i + direction;
        if (next < 0) next = loop ? list.length - 1 : 0;
        if (next >= list.length) next = loop ? 0 : list.length - 1;
        const nextValue = list[next];
        if (!nextValue) return;
        setCurrent(nextValue);
        items.current.get(nextValue)?.focus();
      },
      [loop, setCurrent]
    );

    const handleKeyDown = useCallback(
      (e: ReactKeyboardEvent, itemValue: string) => {
        const isH = orientation === "horizontal";
        const nextKey = isH ? "ArrowRight" : "ArrowDown";
        const prevKey = isH ? "ArrowLeft" : "ArrowUp";
        if (e.key === nextKey) {
          e.preventDefault();
          move(itemValue, 1);
        } else if (e.key === prevKey) {
          e.preventDefault();
          move(itemValue, -1);
        } else if (e.key === "Home") {
          e.preventDefault();
          const first = order.current[0];
          if (first) {
            setCurrent(first);
            items.current.get(first)?.focus();
          }
        } else if (e.key === "End") {
          e.preventDefault();
          const last = order.current[order.current.length - 1];
          if (last) {
            setCurrent(last);
            items.current.get(last)?.focus();
          }
        }
      },
      [orientation, move, setCurrent]
    );

    const ctx = useMemo<RovingFocusContextValue>(
      () => ({
        orientation,
        loop,
        currentValue,
        setCurrentValue: setCurrent,
        register,
        handleKeyDown,
      }),
      [orientation, loop, currentValue, setCurrent, register, handleKeyDown]
    );

    return (
      <RovingFocusProvider value={ctx}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </RovingFocusProvider>
    );
  }
);
RovingFocusGroup.displayName = "RovingFocusGroup";

// ───────────────────────────────────────────────────────────────
// RovingFocusGroup.Item
// ───────────────────────────────────────────────────────────────

export interface RovingFocusItemProps extends HTMLAttributes<HTMLElement> {
  value: string;
  children?: ReactNode;
  /** When false, this item is skipped by arrow-key nav and is not tab-reachable. */
  enabled?: boolean;
}

/**
 * A single rovable item. Spread its props onto the element you want focused.
 */
export const RovingFocusItem = forwardRef<HTMLElement, RovingFocusItemProps>(
  function RovingFocusItem(
    { value, children, enabled = true, onKeyDown, onFocus, tabIndex, ...props },
    ref
  ) {
    const ctx = useRovingFocusContext("RovingFocusItem");
    const internal = useRef<HTMLElement>(null);
    const merged = useMergedRefs<HTMLElement>(ref, internal);

    useEffect(() => {
      if (!enabled) return;
      return ctx.register(value, internal.current);
    }, [ctx, value, enabled]);

    // First registered item becomes the current by default.
    useEffect(() => {
      if (enabled && ctx.currentValue === null && internal.current) {
        ctx.setCurrentValue(value);
      }
    }, [ctx, value, enabled]);

    const isCurrent = ctx.currentValue === value;
    const effectiveTabIndex =
      tabIndex !== undefined ? tabIndex : isCurrent && enabled ? 0 : -1;

    return (
      <div
        ref={merged as React.Ref<HTMLDivElement>}
        tabIndex={effectiveTabIndex}
        data-roving-focus-item=""
        data-current={isCurrent ? "true" : undefined}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!enabled) return;
          ctx.handleKeyDown(e, value);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          if (enabled && !isCurrent) ctx.setCurrentValue(value);
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
RovingFocusItem.displayName = "RovingFocusGroup.Item";

// Attach as compound subcomponent.
(RovingFocusGroup as unknown as { Item: typeof RovingFocusItem }).Item =
  RovingFocusItem;
