import { useEffect, type ReactNode } from "react";

export interface ScrollLockProps {
  enabled?: boolean;
  children?: ReactNode;
}

// Shared counter so nested ScrollLocks cooperate. The lock is released only
// when every outstanding lock is disabled / unmounted.
let lockCount = 0;
let savedBodyOverflow: string | null = null;
let savedBodyPaddingRight: string | null = null;

function acquire() {
  lockCount++;
  if (lockCount !== 1 || typeof document === "undefined") return;
  const body = document.body;
  // Compensate for the disappearing scrollbar to avoid layout shift.
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  savedBodyOverflow = body.style.overflow;
  savedBodyPaddingRight = body.style.paddingRight;
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + scrollbarWidth}px`;
  }
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0 || typeof document === "undefined") return;
  const body = document.body;
  body.style.overflow = savedBodyOverflow ?? "";
  body.style.paddingRight = savedBodyPaddingRight ?? "";
  savedBodyOverflow = null;
  savedBodyPaddingRight = null;
}

/**
 * Freeze the document body's scroll while mounted (and `enabled`).
 * Composes cleanly under nested locks — all must be released before
 * the body unlocks. Compensates for the scrollbar so content doesn't shift.
 */
export function ScrollLock({ enabled = true, children }: ScrollLockProps) {
  useEffect(() => {
    if (!enabled) return;
    acquire();
    return release;
  }, [enabled]);

  return <>{children}</>;
}
