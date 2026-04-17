"use client";

import { useEffect, useRef, type RefObject } from "react";

const DEFAULT_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
};

/**
 * Observe DOM mutations on a ref'd element.
 *
 * Uses `useRef` to store the latest callback so the observer
 * doesn't need to be re-created on every render.
 */
export function useMutationObserver(
  ref: RefObject<Element | null>,
  callback: MutationCallback,
  options?: MutationObserverInit
): void {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === "undefined" || typeof MutationObserver === "undefined") {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new MutationObserver((...args) => {
      callbackRef.current(...args);
    });

    observer.observe(element, optionsRef.current ?? DEFAULT_OPTIONS);

    return () => {
      observer.disconnect();
    };
    // Re-subscribe when ref element or serialized options change
  }, [ref, options ? JSON.stringify(options) : ""]);
}
