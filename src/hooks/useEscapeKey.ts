"use client";

import { useEffect, useRef } from "react";

/**
 * Fire `handler` when the user presses Escape.
 * Handler identity changes are tracked — no re-subscription per render.
 */
export function useEscapeKey(
  handler: (e: KeyboardEvent) => void,
  enabled: boolean = true
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlerRef.current(e);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [enabled]);
}
