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
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Portal } from "../primitives/Portal";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";
export type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Sonner-style action object — `{ label, onClick }` renders as a button
 * inside the toast. Alternatively consumers can pass any ReactNode directly
 * for custom action UI.
 */
export interface ToastActionObject {
  label: ReactNode;
  onClick: () => void;
}

export interface ToastV2Options {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss after this many ms. 0 disables. Default 4000. */
  duration?: number;
  /**
   * Action slot. Accepts either a pre-rendered `ReactNode` or a sonner-shaped
   * `{ label, onClick }` object (which voidframe auto-renders as a button).
   */
  action?: ReactNode | ToastActionObject;
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
  /**
   * Primary signature: single options-or-string argument. A second
   * `ToastV2Options` argument is accepted for sonner compatibility — when the
   * first arg is a string, the options merge as `{ title: message, ...opts }`.
   */
  (opts: ToastV2Options | string, options?: Omit<ToastV2Options, "title">): string;
  success: (
    opts: Omit<ToastV2Options, "tone"> | string,
    options?: Omit<ToastV2Options, "title" | "tone">
  ) => string;
  info: (
    opts: Omit<ToastV2Options, "tone"> | string,
    options?: Omit<ToastV2Options, "title" | "tone">
  ) => string;
  warning: (
    opts: Omit<ToastV2Options, "tone"> | string,
    options?: Omit<ToastV2Options, "title" | "tone">
  ) => string;
  danger: (
    opts: Omit<ToastV2Options, "tone"> | string,
    options?: Omit<ToastV2Options, "title" | "tone">
  ) => string;
  /** Alias of `danger` — matches sonner/react-hot-toast/react-toastify vocabulary. */
  error: (
    opts: Omit<ToastV2Options, "tone"> | string,
    options?: Omit<ToastV2Options, "title" | "tone">
  ) => string;
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

function isToastActionObject(
  action: ReactNode | ToastActionObject | undefined
): action is ToastActionObject {
  return (
    typeof action === "object" &&
    action !== null &&
    "label" in action &&
    "onClick" in action &&
    typeof (action as ToastActionObject).onClick === "function"
  );
}

function normalize(
  opts: ToastV2Options | string,
  tone?: ToastTone,
  extra?: Omit<ToastV2Options, "title">
): ToastV2Options {
  if (typeof opts === "string") {
    return {
      title: opts,
      ...(extra ?? {}),
      ...(tone ? { tone } : {}),
    };
  }
  return {
    ...opts,
    ...(extra ?? {}),
    ...(tone ? { tone } : {}),
  };
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

const toastFn = ((opts: ToastV2Options | string, options?: Omit<ToastV2Options, "title">) =>
  pushToast(normalize(opts, undefined, options))) as ToastApi;
toastFn.success = (opts, options) => pushToast(normalize(opts, "success", options));
toastFn.info = (opts, options) => pushToast(normalize(opts, "info", options));
toastFn.warning = (opts, options) => pushToast(normalize(opts, "warning", options));
toastFn.danger = (opts, options) => pushToast(normalize(opts, "danger", options));
toastFn.error = (opts, options) => pushToast(normalize(opts, "danger", options));
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

/**
 * A portaled queue of transient notifications rendered at a configurable viewport corner.
 * Mount once near the application root; dispatch toasts via the `toast` API or `useToast` hook.
 */
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

  // Auto-dismiss timers per entry with pause-on-hover support.
  // Track { timeout handle, end timestamp, remaining ms } per toast id.
  const timers = useRef(
    new Map<string, { handle: ReturnType<typeof setTimeout>; endTime: number; remaining: number }>()
  );

  const startTimer = useCallback(
    (id: string, ms: number) => {
      const handle = setTimeout(() => {
        toastApi.dismiss(id);
        timers.current.delete(id);
      }, ms);
      timers.current.set(id, { handle, endTime: Date.now() + ms, remaining: ms });
    },
    [toastApi]
  );

  const pauseTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (!t) return;
    clearTimeout(t.handle);
    t.remaining = Math.max(0, t.endTime - Date.now());
  }, []);

  const resumeTimer = useCallback(
    (id: string) => {
      const t = timers.current.get(id);
      if (!t || t.remaining <= 0) return;
      const handle = setTimeout(() => {
        toastApi.dismiss(id);
        timers.current.delete(id);
      }, t.remaining);
      t.handle = handle;
      t.endTime = Date.now() + t.remaining;
    },
    [toastApi]
  );

  useEffect(() => {
    for (const entry of visible) {
      if (timers.current.has(entry.id)) continue;
      if (!entry.duration || entry.duration <= 0) continue;
      startTimer(entry.id, entry.duration);
    }
    // Clean up timers for entries no longer visible.
    for (const [id, t] of timers.current.entries()) {
      if (!visible.find((e) => e.id === id)) {
        clearTimeout(t.handle);
        timers.current.delete(id);
      }
    }
  }, [visible, startTimer]);

  return (
    <Portal>
      <div
        ref={ref}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-relevant="additions"
        data-vf-ignore-outside-click="true"
        className={cx("vf-toaster", `vf-toaster--${position}`, className)}
        style={{ gap, ...style }}
        {...props}
      >
        {visible.map((entry) => {
          const api = { dismiss: () => toastApi.dismiss(entry.id) };
          if (renderToast) return renderToast(entry, api);
          return (
            <ToastBubble
              key={entry.id}
              entry={entry}
              dismiss={api.dismiss}
              onMouseEnter={() => pauseTimer(entry.id)}
              onMouseLeave={() => resumeTimer(entry.id)}
            />
          );
        })}
      </div>
    </Portal>
  );
});
Toaster.displayName = "Toaster";

function ToastBubble({
  entry,
  dismiss,
  onMouseEnter,
  onMouseLeave,
}: {
  entry: ToastEntry;
  dismiss: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const role =
    entry.tone === "danger" || entry.tone === "warning" ? "alert" : "status";
  const ta = toneAttrs("vf-toast-v2", { tone: entry.tone ?? "neutral" });
  return (
    <div
      role={role}
      className={ta.className}
      {...ta.attrs}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
          {entry.action && (
            <div className="vf-toast-v2__action">
              {isToastActionObject(entry.action) ? (
                <button
                  type="button"
                  className="vf-toast-v2__action-button"
                  onClick={() => {
                    entry.action &&
                      (entry.action as ToastActionObject).onClick();
                    dismiss();
                  }}
                >
                  {(entry.action as ToastActionObject).label}
                </button>
              ) : (
                (entry.action as ReactNode)
              )}
            </div>
          )}
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

/**
 * Transient bottom-anchored message with optional action. Lighter than
 * `Toast`; auto-dismisses by default.
 */
export function Snackbar(props: SnackbarProps) {
  return <Toaster position="bottom-center" {...props} />;
}

