"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export type AsyncDataStatus = "loading" | "empty" | "error" | "success";

export interface AsyncDataInputs<T> {
  /** Loading flag, as returned by most data hooks. */
  isLoading?: boolean;
  /** Error payload; any value other than `undefined`/`null`/`false` counts. */
  error?: unknown;
  /** The data. */
  data?: T;
  /** Decide emptiness of present data. Default: `null`, `undefined`, `[]` and `{}`. */
  isEmpty?: (data: T) => boolean;
}

function defaultIsEmpty(data: unknown): boolean {
  if (data === undefined || data === null) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object" && Object.getPrototypeOf(data) === Object.prototype)
    return Object.keys(data as object).length === 0;
  return false;
}

/**
 * Derive an `AsyncDataStatus` from the `{ data, isLoading, error }` shape
 * most data hooks return. Loading wins while nothing has arrived yet; an
 * error wins over stale data; otherwise data decides between success and
 * empty.
 */
export function asyncDataStatus<T>({
  isLoading,
  error,
  data,
  isEmpty = defaultIsEmpty,
}: AsyncDataInputs<T>): AsyncDataStatus {
  if (error !== undefined && error !== null && error !== false) return "error";
  if (isLoading) return "loading";
  if (data === undefined || data === null) return "empty";
  return isEmpty(data) ? "empty" : "success";
}

export interface AsyncDataProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    AsyncDataInputs<T> {
  /**
   * The current state. Determines which slot renders. Optional: when
   * omitted it is derived from `isLoading`, `error` and `data` with
   * `asyncDataStatus`.
   */
  status?: AsyncDataStatus;
  /** The data, available when `status === "success"`. */
  data?: T;
  /** Error payload, available when `status === "error"`. */
  error?: unknown;

  /** Render the success state. Receives `data` (non-null). */
  children: (data: T) => ReactNode;
  /** Render while loading. Defaults to a minimal skeleton. */
  loading?: ReactNode;
  /** Render when the dataset is empty. */
  empty?: ReactNode;
  /** Render when loading failed. Receives the error + a retry handle. */
  renderError?: (error: unknown, retry?: () => void) => ReactNode;
  /** Callback wired into the default error UI's retry button. */
  onRetry?: () => void;
}

/**
 * Universal async-data envelope. Eliminates per-component
 * `loading ? <Skeleton /> : data ? <Table /> : <Empty />` boilerplate
 * by routing to the correct slot based on `status`.
 *
 * `status` may be omitted: `<AsyncData isLoading={q.isLoading} error={q.error}
 * data={q.data}>` derives it (see `asyncDataStatus`).
 *
 * @example
 * <AsyncData status={query.status} data={query.data} onRetry={query.refetch}
 *   loading={<Skeleton lines={5} />}
 *   empty={<Text>No records.</Text>}
 * >
 *   {(rows) => <Table data={rows} columns={cols} />}
 * </AsyncData>
 */
export const AsyncData = forwardRef<HTMLDivElement, AsyncDataProps<unknown>>(
  function AsyncData(
    {
      status: statusProp,
      data,
      error,
      isLoading,
      isEmpty,
      children,
      loading,
      empty,
      renderError,
      onRetry,
      className,
      ...props
    },
    ref
  ) {
    const status = statusProp ?? asyncDataStatus({ isLoading, error, data, isEmpty });
    let content: ReactNode;
    switch (status) {
      case "loading":
        content = loading ?? (
          <div className="vf-async-data__loading" aria-busy="true">
            Loading…
          </div>
        );
        break;
      case "empty":
        content = empty ?? (
          <div className="vf-async-data__empty">No data.</div>
        );
        break;
      case "error":
        content = renderError ? (
          renderError(error, onRetry)
        ) : (
          <div className="vf-async-data__error" role="alert">
            <span>
              {error instanceof Error ? error.message : "Something went wrong."}
            </span>
            {onRetry && (
              <button
                type="button"
                className="vf-async-data__retry"
                onClick={onRetry}
              >
                Retry
              </button>
            )}
          </div>
        );
        break;
      case "success":
        if (data !== undefined && data !== null) {
          content = children(data);
        } else {
          content = empty ?? (
            <div className="vf-async-data__empty">No data.</div>
          );
        }
        break;
    }
    return (
      <div
        ref={ref}
        className={cx("vf-async-data", `vf-async-data--${status}`, className)}
        {...props}
      >
        {content}
      </div>
    );
  }
) as <T>(
  props: AsyncDataProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

(AsyncData as { displayName?: string }).displayName = "AsyncData";
