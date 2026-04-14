import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useMergedRefs } from "../hooks/useMergedRefs";

const FOCUSABLE = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]:not([tabindex="-1"])',
].join(",");

function getFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (n) => !n.hasAttribute("inert") && n.offsetParent !== null
  );
}

export interface FocusScopeProps extends HTMLAttributes<HTMLDivElement> {
  /** When true (default), Tab/Shift+Tab are trapped inside this container. */
  trapped?: boolean;
  /** Loop from last → first (and first → last) when at the boundary. */
  loop?: boolean;
  /** Focus the first focusable child (or `target`) on mount. */
  autoFocus?: boolean;
  /** Return focus to the element that was focused before mount, on unmount. */
  restoreFocus?: boolean;
  children?: ReactNode;
}

/**
 * Trap Tab focus inside a region. Used by Modal, Drawer, Sheet, ConfirmDialog.
 *
 * The rendered `<div>` is the focus boundary. Focusable descendants are
 * discovered via a query selector (see `FOCUSABLE`) plus visibility filtering.
 */
export const FocusScope = forwardRef<HTMLDivElement, FocusScopeProps>(
  function FocusScope(
    {
      trapped = true,
      loop = true,
      autoFocus = true,
      restoreFocus = true,
      children,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, containerRef);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // Save the element that had focus before mount so we can restore on unmount.
    useEffect(() => {
      if (!restoreFocus) return;
      previouslyFocused.current =
        (document.activeElement as HTMLElement | null) ?? null;
      return () => {
        const el = previouslyFocused.current;
        if (el && typeof el.focus === "function") {
          // Defer so React's unmount finishes before focus moves.
          setTimeout(() => el.focus(), 0);
        }
      };
    }, [restoreFocus]);

    // Focus the first focusable descendant on mount.
    useEffect(() => {
      if (!autoFocus) return;
      const el = containerRef.current;
      if (!el) return;
      const [first] = getFocusable(el);
      if (first) first.focus();
      else el.focus();
    }, [autoFocus]);

    // Trap Tab / Shift+Tab.
    useEffect(() => {
      if (!trapped) return;
      const el = containerRef.current;
      if (!el) return;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const focusables = getFocusable(el);
        if (focusables.length === 0) {
          e.preventDefault();
          el.focus();
          return;
        }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !el.contains(active)) {
            e.preventDefault();
            if (loop) last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            if (loop) first.focus();
          }
        }
      };

      el.addEventListener("keydown", onKeyDown);
      return () => el.removeEventListener("keydown", onKeyDown);
    }, [trapped, loop]);

    return (
      <div ref={mergedRef} tabIndex={-1} {...props}>
        {children}
      </div>
    );
  }
);
FocusScope.displayName = "FocusScope";
