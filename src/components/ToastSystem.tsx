"use client";

// Phase 10 — ToastV2 (compound) + Toaster + Snackbar + useToast
//
// `useToast()` returns an imperative API that pushes/dismisses entries from
// a shared store. `<Toaster>` renders the stack at a fixed position via a
// portal. `<Snackbar>` is a Toaster preset (bottom-center).
//
// Includes `toast.promise(promise, { loading, success, error })` for async
// flows.

import {
  forwardRef,
  useEffect,
  useReducer,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Portal } from "../primitives/Portal";
import { cx } from "../utils/cx";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";
export type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastV2Options {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss after this many ms. 0 disables. Default 4000. */
  duration?: number;
  action?: ReactNode;
  /** Render arbitrary content; if set, takes precedence over title/description. */
  render?: (api: { dismiss: () => void }) => ReactNode;
}

export interface ToastEntry extends ToastV2Options {
  id: string;
  createdAt: number;
}

interface ToastStoreState {
  entries: ToastEntry[];
}

type ToastAction =
  | { type: "add"; entry: ToastEntry }
  | { type: "update"; id: string; patch: Partial<ToastEntry> }
  | { type: "remove"; id: string };

function toastReducer(state: ToastStoreState, action: ToastAction): ToastStoreState {
  if (action.type === "add") {
    return { entries: [...state.entries.filter((e) => e.id !== action.entry.id), action.entry] };
  }
  if (action.type === "update") {
    return {
      entries: state.entries.map((e) =>
        e.id === action.id ? { ...e, ...action.patch } : e
      ),
    };
  }
  return { entries: state.entries.filter((e) => e.id !== action.id) };
}

// Module-level store so multiple components share a single registry.
const listeners = new Set<() => void>();
let storeState: ToastStoreState = { entries: [] };
function dispatch(action: ToastAction): void {
  storeState = toastReducer(storeState, action);
  for (const l of listeners) l();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let toastIdCounter = 0;
function nextId(): string {
  toastIdCounter += 1;
  return `t${Date.now().toString(36)}-${toastIdCounter}`;
}

// ── Public API ──────────────────────────────────────────────

export interface ToastApi {
  (opts: ToastV2Options | string): string;
  success: (opts: Omit<ToastV2Options, "tone"> | string) => string;
  info: (opts: Omit<ToastV2Options, "tone"> | string) => string;
  warning: (opts: Omit<ToastV2Options, "tone"> | string) => string;
  danger: (opts: Omit<ToastV2Options, "tone"> | string) => string;
  dismiss: (id: string) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: ToastV2Options | string;
      success: ((value: T) => ToastV2Options | string) | ToastV2Options | string;
      error: ((reason: unknown) => ToastV2Options | string) | ToastV2Options | string;
    }
  ) => Promise<T>;
}

function normalize(opts: ToastV2Options | string, tone?: ToastTone): ToastV2Options {
  if (typeof opts === "string") return { title: opts, tone };
  return tone ? { ...opts, tone } : opts;
}

function pushToast(opts: ToastV2Options): string {
  const id = opts.id ?? nextId();
  const entry: ToastEntry = {
    id,
    createdAt: Date.now(),
    duration: 4000,
    tone: "neutral",
    ...opts,
  };
  dispatch({ type: "add", entry });
  return id;
}

function updateToast(id: string, patch: Partial<ToastEntry>): void {
  dispatch({ type: "update", id, patch });
}

function dismissToast(id: string): void {
  dispatch({ type: "remove", id });
}

const toastFn = ((opts: ToastV2Options | string) => pushToast(normalize(opts))) as ToastApi;
toastFn.success = (opts) => pushToast(normalize(opts, "success"));
toastFn.info = (opts) => pushToast(normalize(opts, "info"));
toastFn.warning = (opts) => pushToast(normalize(opts, "warning"));
toastFn.danger = (opts) => pushToast(normalize(opts, "danger"));
toastFn.dismiss = dismissToast;
toastFn.promise = async function promiseToast<T>(
  promise: Promise<T>,
  options: {
    loading: ToastV2Options | string;
    success: ((value: T) => ToastV2Options | string) | ToastV2Options | string;
    error: ((reason: unknown) => ToastV2Options | string) | ToastV2Options | string;
  }
): Promise<T> {
  const id = pushToast(normalize(options.loading, "info"));
  try {
    const value = await promise;
    const successOpts =
      typeof options.success === "function"
        ? (options.success as (v: T) => ToastV2Options | string)(value)
        : options.success;
    updateToast(id, {
      ...normalize(successOpts, "success"),
      duration: 4000,
    });
    return value;
  } catch (err) {
    const errOpts =
      typeof options.error === "function"
        ? (options.error as (e: unknown) => ToastV2Options | string)(err)
        : options.error;
    updateToast(id, {
      ...normalize(errOpts, "danger"),
      duration: 6000,
    });
    throw err;
  }
};

export function useToast(): { toast: ToastApi; entries: ToastEntry[] } {
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    return subscribe(force);
  }, []);
  return { toast: toastFn, entries: storeState.entries };
}

export const toast = toastFn;

/**
 * Test-only helper: clear every toast and notify subscribers. Not part of
 * the public API surface; intended to keep test isolation predictable.
 */
export function _resetToastsForTesting(): void {
  storeState = { entries: [] };
  for (const l of listeners) l();
}

// ── Toaster (renders the stack) ─────────────────────────────

export interface ToasterProps extends HTMLAttributes<HTMLDivElement> {
  position?: ToasterPosition;
  max?: number;
  gap?: number;
  /** Render override per-entry. */
  renderToast?: (entry: ToastEntry, api: { dismiss: () => void }) => ReactNode;
  style?: CSSProperties;
}

export const Toaster = forwardRef<HTMLDivElement, ToasterProps>(function Toaster(
  {
    position = "top-right",
    max = 5,
    gap = 8,
    renderToast,
    className,
    style,
    ...props
  },
  ref
) {
  const { toast: toastApi, entries } = useToast();
  const visible = entries.slice(-max);

  // Auto-dismiss timers per entry.
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    for (const entry of visible) {
      if (timers.current.has(entry.id)) continue;
      if (!entry.duration || entry.duration <= 0) continue;
      const t = setTimeout(() => {
        toastApi.dismiss(entry.id);
        timers.current.delete(entry.id);
      }, entry.duration);
      timers.current.set(entry.id, t);
    }
    // Clean up timers for entries no longer visible.
    for (const [id, t] of timers.current.entries()) {
      if (!visible.find((e) => e.id === id)) {
        clearTimeout(t);
        timers.current.delete(id);
      }
    }
  }, [visible, toastApi]);

  return (
    <Portal>
      <div
        ref={ref}
        role="region"
        aria-label="Notifications"
        className={cx("vf-toaster", `vf-toaster--${position}`, className)}
        style={{ gap, ...style }}
        {...props}
      >
        {visible.map((entry) => {
          const api = { dismiss: () => toastApi.dismiss(entry.id) };
          if (renderToast) return renderToast(entry, api);
          return <ToastBubble key={entry.id} entry={entry} dismiss={api.dismiss} />;
        })}
      </div>
    </Portal>
  );
});
Toaster.displayName = "Toaster";

function ToastBubble({
  entry,
  dismiss,
}: {
  entry: ToastEntry;
  dismiss: () => void;
}) {
  const role =
    entry.tone === "danger" || entry.tone === "warning" ? "alert" : "status";
  return (
    <div
      role={role}
      className={cx("vf-toast-v2", `vf-toast-v2--${entry.tone ?? "neutral"}`)}
    >
      {entry.render ? (
        entry.render({ dismiss })
      ) : (
        <>
          <div className="vf-toast-v2__body">
            {entry.title && <div className="vf-toast-v2__title">{entry.title}</div>}
            {entry.description && (
              <div className="vf-toast-v2__desc">{entry.description}</div>
            )}
          </div>
          {entry.action && <div className="vf-toast-v2__action">{entry.action}</div>}
          <button
            type="button"
            className="vf-toast-v2__dismiss"
            aria-label="Dismiss"
            onClick={dismiss}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

// ── Snackbar ──────────────────────────────────────────────────

export interface SnackbarProps extends Omit<ToasterProps, "position"> {}

export function Snackbar(props: SnackbarProps) {
  return <Toaster position="bottom-center" {...props} />;
}

