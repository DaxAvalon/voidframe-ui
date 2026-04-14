import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FocusEvent,
  type MouseEvent,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";

// ───────────────────────────────────────────────────────────────
// Phase 2 hooks (re-exported)
// ───────────────────────────────────────────────────────────────

export { useId } from "./useId";
export { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
export { useMergedRefs } from "./useMergedRefs";
export {
  useControllableState,
  type UseControllableStateOptions,
} from "./useControllableState";

// Phase 7.5 — form state manager
export { useForm } from "./useForm";
export type {
  FieldBindings,
  FieldHandle,
  FormValidator,
  UseFormOptions,
  UseFormReturn,
  Validator,
} from "./useForm";

// Phase 3 — foundational effect/callback hooks
export { useEvent } from "./useEvent";
export { useMountEffect } from "./useMountEffect";
export { useUnmountEffect } from "./useUnmountEffect";
export { useUpdateEffect } from "./useUpdateEffect";
export { useHasMounted } from "./useHasMounted";

// Phase 3 — timing
export { useTimeout } from "./useTimeout";
export { useDebouncedCallback, type DebouncedFn } from "./useDebouncedCallback";
export { useThrottle } from "./useThrottle";
export { useThrottledCallback } from "./useThrottledCallback";
export {
  useCountdown,
  type UseCountdownOptions,
  type CountdownValue,
} from "./useCountdown";
export {
  useStopwatch,
  type UseStopwatchOptions,
  type StopwatchApi,
} from "./useStopwatch";
export { useRafInterval } from "./useRafInterval";
export { useIdle } from "./useIdle";

// Phase 3 — DOM observation
export { useResizeObserver, type ResizeSize } from "./useResizeObserver";
export {
  useIntersectionObserver,
  type UseIntersectionOptions,
  type IntersectionState,
} from "./useIntersectionObserver";
export { useElementSize } from "./useElementSize";
export { useScrollPosition, type ScrollPos } from "./useScrollPosition";
export {
  useScrollDirection,
  type ScrollDirection,
  type UseScrollDirectionOptions,
} from "./useScrollDirection";
export { useFocusVisible } from "./useFocusVisible";
export { useFocusWithin } from "./useFocusWithin";
export { usePageVisibility, type PageVisibility } from "./usePageVisibility";
export { useNetworkStatus, type NetworkStatus } from "./useNetworkStatus";

// Phase 3 — media/capability
export { usePrefersReducedMotion } from "./usePrefersReducedMotion";
export { usePrefersColorScheme } from "./usePrefersColorScheme";
export {
  useColorScheme,
  type ColorScheme,
  type ResolvedColorScheme,
  type UseColorSchemeReturn,
} from "./useColorScheme";

// Phase 3 — interaction
export { useEscapeKey } from "./useEscapeKey";
export { useKeyPress } from "./useKeyPress";
export {
  useLongPress,
  type UseLongPressOptions,
  type LongPressBindings,
} from "./useLongPress";

// Phase 3 — async
export {
  useAsync,
  type AsyncStatus,
  type AsyncState,
  type UseAsyncReturn,
} from "./useAsync";
export { useAsyncCallback } from "./useAsyncCallback";

// Phase 3 — a11y
export {
  useAnnouncer,
  type AnnouncerApi,
  type AnnouncerPoliteness,
} from "./useAnnouncer";
export { useFocusReturn } from "./useFocusReturn";

// ───────────────────────────────────────────────────────────────
// Hover
// ───────────────────────────────────────────────────────────────

export interface HoverBindings {
  onMouseEnter: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
}

export interface UseHoverReturn {
  hovered: boolean;
  bind: HoverBindings;
}

/**
 * Track hover state. Spread `bind` onto the target element.
 */
export function useHover(): UseHoverReturn {
  const [hovered, setHovered] = useState(false);
  const bind: HoverBindings = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
  return { hovered, bind };
}

// ───────────────────────────────────────────────────────────────
// Focus
// ───────────────────────────────────────────────────────────────

export interface FocusBindings {
  onFocus: (e: FocusEvent) => void;
  onBlur: (e: FocusEvent) => void;
}

export interface UseFocusReturn {
  focused: boolean;
  bind: FocusBindings;
}

/**
 * Track focus state. Spread `bind` onto the target element.
 */
export function useFocus(): UseFocusReturn {
  const [focused, setFocused] = useState(false);
  const bind: FocusBindings = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
  return { focused, bind };
}

// ───────────────────────────────────────────────────────────────
// Toggle
// ───────────────────────────────────────────────────────────────

/**
 * Boolean toggle with optional keyboard shortcut.
 *
 * @param initial Initial value
 * @param key Optional `KeyboardEvent.key` that toggles (e.g. "Escape")
 * @returns `[value, toggle, setValue]`
 */
export function useToggle(
  initial: boolean = false,
  key?: string
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  useEffect(() => {
    if (!key) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === key) toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, toggle]);
  return [value, toggle, setValue];
}

// ───────────────────────────────────────────────────────────────
// Click-outside
// ───────────────────────────────────────────────────────────────

/**
 * Detect clicks outside a ref'd element.
 *
 * @returns A ref to attach to the element whose outside-clicks you want to detect.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  onClickOutside: () => void
): RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClickOutside]);
  return ref;
}

// ───────────────────────────────────────────────────────────────
// Debounce
// ───────────────────────────────────────────────────────────────

/**
 * Debounce a value.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ───────────────────────────────────────────────────────────────
// Media query
// ───────────────────────────────────────────────────────────────

/**
 * Responsive media query hook.
 * @param query e.g. `"(max-width: 768px)"`
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ───────────────────────────────────────────────────────────────
// Local storage
// ───────────────────────────────────────────────────────────────

/**
 * Persist state in localStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const next =
        typeof value === "function" ? (value as (prev: T) => T)(stored) : value;
      setStored(next);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };
  return [stored, setValue];
}

// ───────────────────────────────────────────────────────────────
// Interval
// ───────────────────────────────────────────────────────────────

/**
 * Repeating interval with cleanup.
 * @param delay `null` to pause.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ───────────────────────────────────────────────────────────────
// Keyboard shortcut
// ───────────────────────────────────────────────────────────────

export interface KeyModifiers {
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

/**
 * Register a global keyboard shortcut.
 */
export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  modifiers: KeyModifiers = {}
): void {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (modifiers.ctrl && !e.ctrlKey) return;
      if (modifiers.meta && !e.metaKey) return;
      if (modifiers.shift && !e.shiftKey) return;
      if (modifiers.alt && !e.altKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [key, handler, modifiers]);
}

// ───────────────────────────────────────────────────────────────
// Clipboard
// ───────────────────────────────────────────────────────────────

export interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
}

/**
 * Copy to clipboard with success state that auto-resets.
 */
export function useCopyToClipboard(resetDelay: number = 2000): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      } catch {
        setCopied(false);
      }
    },
    [resetDelay]
  );
  return { copy, copied };
}

// ───────────────────────────────────────────────────────────────
// Scroll
// ───────────────────────────────────────────────────────────────

export interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Track window scroll position.
 */
export function useScroll(): ScrollPosition {
  const [pos, setPos] = useState<ScrollPosition>({ x: 0, y: 0 });
  useEffect(() => {
    const handler = () => setPos({ x: window.scrollX, y: window.scrollY });
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return pos;
}

// ───────────────────────────────────────────────────────────────
// Window size
// ───────────────────────────────────────────────────────────────

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Track window dimensions.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));
  useEffect(() => {
    const handler = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

// ───────────────────────────────────────────────────────────────
// Previous
// ───────────────────────────────────────────────────────────────

/**
 * Previous value of a variable (from last render).
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref: MutableRefObject<T | undefined> = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// ───────────────────────────────────────────────────────────────
// Force update
// ───────────────────────────────────────────────────────────────

/**
 * Force re-render.
 */
export function useForceUpdate(): () => void {
  const [, setState] = useState(0);
  return useCallback(() => setState((n) => n + 1), []);
}
