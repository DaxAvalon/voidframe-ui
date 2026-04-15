"use client";

import { useEffect, useState } from "react";

/**
 * Global `:focus-visible` state: `true` when the last interaction was keyboard
 * (or programmatic), `false` for mouse/touch. Matches browser `:focus-visible`.
 *
 * Subscribe once — the state is shared via bubbling DOM events.
 */
export function useFocusVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Modifier-only keypresses don't change focus-visible state.
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      setVisible(true);
    };
    const onPointer = () => setVisible(false);

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("mousedown", onPointer, true);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("touchstart", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("mousedown", onPointer, true);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("touchstart", onPointer, true);
    };
  }, []);

  return visible;
}
