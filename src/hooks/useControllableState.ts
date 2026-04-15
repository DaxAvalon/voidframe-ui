"use client";

import { useCallback, useRef, useState } from "react";
import { warnOnce } from "../utils/warn";

export interface UseControllableStateOptions<T> {
  /** Controlled value. When defined, the consumer owns state. */
  value?: T;
  /** Uncontrolled initial value. */
  defaultValue?: T;
  /** Callback fired whenever the value changes (controlled or not). */
  onChange?: (next: T) => void;
  /** Component name, used in dev-mode warnings. */
  componentName?: string;
}

/**
 * Controlled-or-uncontrolled state primitive.
 *
 * - When `value` is provided, the component is controlled — internal state
 *   is ignored, and `onChange` is the only way to mutate.
 * - When `value` is undefined, the component is uncontrolled — internal
 *   state seeded from `defaultValue` is used, and `onChange` (if given)
 *   is still notified.
 *
 * Dev-mode warns if a component switches between controlled and uncontrolled.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
  componentName,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue as T);

  const isControlled = value !== undefined;
  const wasControlledRef = useRef(isControlled);

  if (process.env.NODE_ENV !== "production") {
    if (wasControlledRef.current !== isControlled) {
      const who = componentName ? `<${componentName}>` : "A component";
      warnOnce(
        `controllable-switch:${componentName ?? "unknown"}`,
        `${who} switched from ${wasControlledRef.current ? "controlled" : "uncontrolled"} to ${isControlled ? "controlled" : "uncontrolled"}. Components must not change between the two during their lifetime.`
      );
    }
    wasControlledRef.current = isControlled;
  }

  const current = isControlled ? (value as T) : internal;

  // Latest-callback ref so consumers can pass inline `onChange` handlers
  // without forcing a re-render of every memoized child on each render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled]
  );

  return [current, setValue];
}
