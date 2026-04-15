"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Throttle a value. The returned value updates at most once per `interval` ms.
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = useState(value);
  const last = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - last.current;
    if (elapsed >= interval) {
      last.current = now;
      setThrottled(value);
      return;
    }
    const timeout = setTimeout(() => {
      last.current = Date.now();
      setThrottled(value);
    }, interval - elapsed);
    return () => clearTimeout(timeout);
  }, [value, interval]);

  return throttled;
}
