"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAbortControllerReturn {
  signal: AbortSignal;
  abort: (reason?: string) => void;
  reset: () => AbortController;
  isAborted: boolean;
}

/**
 * Manage an `AbortController` tied to a component's lifecycle.
 *
 * The controller is automatically aborted on unmount. Use `reset()` to
 * replace the current controller (aborting the previous one) and `abort()`
 * to cancel the current one in place.
 */
export function useAbortController(): UseAbortControllerReturn {
  const controllerRef = useRef<AbortController>(new AbortController());
  const [isAborted, setIsAborted] = useState(false);

  const abort = useCallback((reason?: string) => {
    controllerRef.current.abort(reason);
    setIsAborted(true);
  }, []);

  const reset = useCallback(() => {
    // Abort the old one first
    if (!controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
    }
    const next = new AbortController();
    controllerRef.current = next;
    setIsAborted(false);
    return next;
  }, []);

  // Auto-abort on unmount
  useEffect(() => {
    const ctrl = controllerRef.current;
    return () => {
      if (!ctrl.signal.aborted) {
        ctrl.abort();
      }
    };
  }, []);

  return {
    signal: controllerRef.current.signal,
    abort,
    reset,
    isAborted,
  };
}
