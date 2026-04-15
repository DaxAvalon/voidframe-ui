"use client";

import { useCallback } from "react";
import { cx } from "../utils/cx";

export interface DevErrorFallbackProps {
  error: Error;
  reset: () => void;
  /** Extra className for the fallback wrapper. */
  className?: string;
}

/**
 * Brutalist fallback UI suitable for the `fallback` render prop of
 * `<ErrorBoundary>`. Shows the error name + message + collapsible stack
 * and a Reset button.
 *
 * @example
 * <ErrorBoundary fallback={(err, reset) => <DevErrorFallback error={err} reset={reset} />}>
 *   <App />
 * </ErrorBoundary>
 */
export function DevErrorFallback({
  error,
  reset,
  className,
}: DevErrorFallbackProps) {
  const onReset = useCallback(() => reset(), [reset]);
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cx("vf-error-boundary", className)}
    >
      <div className="vf-error-boundary__head">
        <span className="vf-error-boundary__badge">ERROR</span>
        <span className="vf-error-boundary__name">
          {error.name || "Error"}
        </span>
      </div>
      <pre className="vf-error-boundary__message">{error.message}</pre>
      {error.stack && (
        <details className="vf-error-boundary__details">
          <summary>stack</summary>
          <pre className="vf-error-boundary__stack">{error.stack}</pre>
        </details>
      )}
      <button
        type="button"
        className="vf-error-boundary__reset"
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
DevErrorFallback.displayName = "DevErrorFallback";
