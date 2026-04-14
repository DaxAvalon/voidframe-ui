import { useEffect, useRef, useState } from "react";

export interface UseCountdownOptions {
  target: Date | number;
  /** Update interval in ms (default 1000 — one tick per second). */
  tickMs?: number;
  onComplete?: () => void;
}

export interface CountdownValue {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

function compute(target: number): CountdownValue {
  const total = Math.max(0, target - Date.now());
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / 60_000) % 60;
  const hours = Math.floor(total / 3_600_000) % 24;
  const days = Math.floor(total / 86_400_000);
  return { total, days, hours, minutes, seconds, completed: total === 0 };
}

/**
 * Live countdown to a future timestamp.
 */
export function useCountdown({
  target,
  tickMs = 1000,
  onComplete,
}: UseCountdownOptions): CountdownValue {
  const targetTime = typeof target === "number" ? target : target.getTime();
  const [value, setValue] = useState<CountdownValue>(() => compute(targetTime));
  const calledRef = useRef(false);

  useEffect(() => {
    calledRef.current = false;
    setValue(compute(targetTime));
    if (Date.now() >= targetTime) {
      if (!calledRef.current) {
        calledRef.current = true;
        onComplete?.();
      }
      return;
    }
    const id = setInterval(() => {
      const next = compute(targetTime);
      setValue(next);
      if (next.completed && !calledRef.current) {
        calledRef.current = true;
        onComplete?.();
        clearInterval(id);
      }
    }, tickMs);
    return () => clearInterval(id);
  }, [targetTime, tickMs, onComplete]);

  return value;
}
