"use client";

import { useEffect, useState } from "react";

/**
 * `true` while `key` (KeyboardEvent.key, case-insensitive) is pressed.
 */
export function useKeyPress(key: string): boolean {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const target = key.toLowerCase();
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === target) setPressed(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === target) setPressed(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [key]);

  return pressed;
}
