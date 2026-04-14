import { useAsync, type UseAsyncReturn } from "./useAsync";

/** Alias of `useAsync` — use whichever name reads better at the call site. */
export function useAsyncCallback<T, A extends unknown[] = []>(
  fn: (...args: A) => Promise<T>
): UseAsyncReturn<T, A> {
  return useAsync<T, A>(fn);
}
