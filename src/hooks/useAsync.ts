import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  status: AsyncStatus;
  loading: boolean;
}

export interface UseAsyncReturn<T, A extends unknown[]> extends AsyncState<T> {
  run: (...args: A) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Manage an async function's lifecycle — pending / success / error.
 * `run()` returns the resolved value (or undefined if cancelled by unmount).
 * Stale results are discarded after unmount.
 */
export function useAsync<T, A extends unknown[] = []>(
  fn: (...args: A) => Promise<T>
): UseAsyncReturn<T, A> {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    error: undefined,
    status: "idle",
    loading: false,
  });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const run = useCallback(async (...args: A): Promise<T | undefined> => {
    setState({
      data: undefined,
      error: undefined,
      status: "pending",
      loading: true,
    });
    try {
      const data = await fnRef.current(...args);
      if (!mounted.current) return undefined;
      setState({ data, error: undefined, status: "success", loading: false });
      return data;
    } catch (e) {
      if (!mounted.current) return undefined;
      const err = e instanceof Error ? e : new Error(String(e));
      setState({ data: undefined, error: err, status: "error", loading: false });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: undefined,
      status: "idle",
      loading: false,
    });
  }, []);

  return { ...state, run, reset };
}
