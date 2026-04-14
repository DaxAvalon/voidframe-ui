import { useCallback, useEffect, useRef, useState } from "react";

export interface UseStopwatchOptions {
  autoStart?: boolean;
  tickMs?: number;
}

export interface StopwatchApi {
  elapsed: number;
  running: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Elapsed-time stopwatch. Starts paused unless `autoStart` is true.
 */
export function useStopwatch({
  autoStart = false,
  tickMs = 100,
}: UseStopwatchOptions = {}): StopwatchApi {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const origin = useRef(autoStart ? Date.now() : 0);
  const baseline = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(baseline.current + (Date.now() - origin.current));
    }, tickMs);
    return () => clearInterval(id);
  }, [running, tickMs]);

  const start = useCallback(() => {
    if (running) return;
    origin.current = Date.now();
    setRunning(true);
  }, [running]);

  const pause = useCallback(() => {
    if (!running) return;
    baseline.current += Date.now() - origin.current;
    setElapsed(baseline.current);
    setRunning(false);
  }, [running]);

  const reset = useCallback(() => {
    baseline.current = 0;
    origin.current = Date.now();
    setElapsed(0);
  }, []);

  return { elapsed, running, start, pause, reset };
}
