"use client";

import { useEffect, useRef } from "react";

/**
 * Save the element that had focus when this hook first runs, and restore focus
 * to it on unmount. Used by overlays (Modal, Drawer, Popover) for a11y:
 * the user's focus returns to the trigger after the overlay closes.
 *
 * @param enabled Skip save/restore when false (for cleanly-dismounted overlays
 *   that shouldn't restore — e.g. when the trigger itself was removed).
 */
export function useFocusReturn(enabled: boolean = true): void {
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    previous.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    return () => {
      if (!enabled) return;
      const el = previous.current;
      if (el && typeof el.focus === "function") {
        // Defer to give React a tick to finish any pending unmounts.
        setTimeout(() => el.focus(), 0);
      }
    };
  }, [enabled]);
}
