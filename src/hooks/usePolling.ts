"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePollingOptions {
  /** Run the poll. Default true; set false to pause without unmounting. */
  enabled?: boolean;
  /** Run once immediately when enabled. Default true. */
  immediate?: boolean;
  /** Skip ticks while the document is hidden and run once when it becomes visible again. Default true. */
  pauseWhenHidden?: boolean;
}

export interface UsePollingReturn {
  /** Run the function now (also resets the interval). */
  run: () => Promise<void>;
  /** A run is in flight. */
  running: boolean;
  /** Timestamp (ms) of the last completed run. */
  lastRunAt: number | null;
  /** Error thrown or rejected by the last run. */
  error: unknown;
  /** Completed runs so far. */
  count: number;
}

/**
 * Call `fn` every `intervalMs`. Overlapping runs are skipped (a slow poll
 * never stacks), hidden tabs pause by default, and `run()` triggers an
 * immediate poll.
 *
 * ```ts
 * const { lastRunAt } = usePolling(refetch, 15_000, { enabled: status === "running" });
 * ```
 */
export function usePolling(
  fn: () => void | Promise<void>,
  intervalMs: number | null,
  options: UsePollingOptions = {}
): UsePollingReturn {
  const { enabled = true, immediate = true, pauseWhenHidden = true } = options;
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [running, setRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<number | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [count, setCount] = useState(0);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRunning(true);
    try {
      await fnRef.current();
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      inFlight.current = false;
      setRunning(false);
      setLastRunAt(Date.now());
      setCount((c) => c + 1);
    }
  }, []);

  useEffect(() => {
    if (!enabled || intervalMs === null || intervalMs <= 0) return;
    const hidden = () => pauseWhenHidden && typeof document !== "undefined" && document.visibilityState === "hidden";
    if (immediate && !hidden()) void run();
    timer.current = setInterval(() => {
      if (!hidden()) void run();
    }, intervalMs);
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") void run();
    };
    if (pauseWhenHidden && typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      if (pauseWhenHidden && typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, intervalMs, immediate, pauseWhenHidden, run]);

  return { run, running, lastRunAt, error, count };
}
