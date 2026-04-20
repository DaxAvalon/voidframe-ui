"use client";

// Phase 11 — Clipboard, ShareButton, ScrollIndicator, ReactionPicker

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { cx } from "../utils/cx";

// ── Clipboard ───────────────────────────────────────────────

export interface ClipboardRenderProps {
  copy: () => Promise<void>;
  copied: boolean;
}

export interface ClipboardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onCopy"> {
  value: string;
  /** Render-prop. When omitted, renders a default Copy button. */
  children?: (props: ClipboardRenderProps) => ReactNode;
  onCopy?: (value: string) => void;
  /** Auto-revert "copied" after this many ms. Default 1500. */
  resetMs?: number;
}

/**
 * Copy-to-clipboard affordance with success feedback. Wraps a trigger and
 * announces "Copied" via `LiveRegion` on success.
 */
export const Clipboard = forwardRef<HTMLButtonElement, ClipboardProps>(
  function Clipboard(
    { value, children, onCopy, resetMs = 1500, className, ...props },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const copy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopy?.(value);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      } catch {
        /* clipboard not available */
      }
    }, [value, onCopy, resetMs]);

    useEffect(() => () => {
      if (timer.current) clearTimeout(timer.current);
    }, []);

    if (children) {
      return <>{children({ copy, copied })}</>;
    }
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-clipboard", "vf-button", className)}
        onClick={copy}
        aria-live="polite"
        {...props}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    );
  }
);
Clipboard.displayName = "Clipboard";

// ── ShareButton ─────────────────────────────────────────────

export interface ShareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  url: string;
  title?: string;
  text?: string;
  /** Fallback text shown after copy (when navigator.share is unavailable). */
  copiedLabel?: string;
  label?: ReactNode;
}

/**
 * Button that opens a share sheet / menu with configurable destinations
 * (copy link, email, native share).
 */
export const ShareButton = forwardRef<HTMLButtonElement, ShareButtonProps>(
  function ShareButton(
    {
      url,
      title,
      text,
      copiedLabel = "Link copied",
      label = "Share",
      className,
      ...props
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const handle = async () => {
      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        try {
          await nav.share({ url, title, text });
          return;
        } catch {
          /* user cancelled / not supported — fall through to copy */
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* noop */
      }
    };
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-share-button", "vf-button", className)}
        onClick={handle}
        aria-live="polite"
        {...props}
      >
        {copied ? copiedLabel : label}
      </button>
    );
  }
);
ShareButton.displayName = "ShareButton";

// ── ScrollIndicator ─────────────────────────────────────────

export interface ScrollIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Element whose scroll progress is tracked. Defaults to window. */
  target?: RefObject<HTMLElement> | HTMLElement | null;
  position?: "top" | "bottom";
  thickness?: number;
  color?: string;
}

/**
 * Edge indicator showing there's more content to scroll to. Fades in/out
 * based on scroll position.
 */
export const ScrollIndicator = forwardRef<HTMLDivElement, ScrollIndicatorProps>(
  function ScrollIndicator(
    { target, position = "top", thickness = 2, color, className, style, ...props },
    ref
  ) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const el = (target && "current" in target ? target.current : (target as HTMLElement | null)) ?? null;
      const compute = () => {
        if (el) {
          const max = el.scrollHeight - el.clientHeight;
          setProgress(max > 0 ? el.scrollTop / max : 0);
        } else if (typeof window !== "undefined") {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(max > 0 ? window.scrollY / max : 0);
        }
      };
      compute();
      const node = el ?? window;
      node.addEventListener("scroll", compute, { passive: true });
      window.addEventListener("resize", compute);
      return () => {
        node.removeEventListener("scroll", compute);
        window.removeEventListener("resize", compute);
      };
    }, [target]);

    const merged: CSSProperties = {
      position: "fixed",
      left: 0,
      right: 0,
      [position]: 0,
      height: thickness,
      background: "var(--vf-bg-3)",
      zIndex: 1000,
      ...style,
    };

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={Math.round(progress * 100) / 100}
        aria-label="Scroll progress"
        className={cx("vf-scroll-indicator", className)}
        style={merged}
        {...props}
      >
        <div
          className="vf-scroll-indicator__bar"
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: color ?? "var(--vf-accent, var(--vf-green))",
            transition: "width 0.05s linear",
          }}
        />
      </div>
    );
  }
);
ScrollIndicator.displayName = "ScrollIndicator";

// ── ReactionPicker ──────────────────────────────────────────

export interface Reaction {
  id: string;
  label: string;
  glyph?: string;
}

export interface ReactionPickerProps extends HTMLAttributes<HTMLDivElement> {
  reactions: Reaction[];
  /** Fires with the picked `Reaction.id` (not an emoji). Distinct from
   * `ReactionBar.onReact`, which emits the emoji character directly. */
  onPick: (id: string) => void;
  /** Show recent picks (persisted in component state). */
  recent?: boolean;
  /**
   * Hydrate the recents list from outside the component (e.g. a persisted
   * store). When provided, the component treats recents as controlled and
   * will not mutate local state — instead it emits `onRecentsChange`.
   */
  recents?: string[];
  /** Fired whenever the recents list changes (controlled or uncontrolled). */
  onRecentsChange?: (next: string[]) => void;
  /** Render as a grid (vs. row). */
  grid?: boolean;
  /** Number of recent reactions to remember. Default 5. */
  recentCount?: number;
}

/**
 * Emoji picker popover used to add a reaction. Paired with `ReactionBar`.
 */
export const ReactionPicker = forwardRef<HTMLDivElement, ReactionPickerProps>(
  function ReactionPicker(
    {
      reactions,
      onPick,
      recent,
      recents: controlledRecents,
      onRecentsChange,
      grid,
      recentCount = 5,
      className,
      ...props
    },
    ref
  ) {
    const [internalRecents, setInternalRecents] = useState<string[]>(
      controlledRecents ?? []
    );
    const isRecentsControlled = controlledRecents !== undefined;
    const recents = isRecentsControlled
      ? (controlledRecents as string[])
      : internalRecents;
    const pick = (id: string) => {
      onPick(id);
      if (recent) {
        const without = recents.filter((x) => x !== id);
        const next = [id, ...without].slice(0, recentCount);
        if (!isRecentsControlled) setInternalRecents(next);
        onRecentsChange?.(next);
      }
    };
    const recentIds = new Set(recents);
    const recentReactions = recents
      .map((id) => reactions.find((r) => r.id === id))
      .filter((r): r is Reaction => !!r);
    const others = reactions.filter((r) => !recentIds.has(r.id));

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Reaction picker"
        className={cx(
          "vf-reaction-picker",
          grid && "vf-reaction-picker--grid",
          className
        )}
        {...props}
      >
        {recent && recentReactions.length > 0 && (
          <div className="vf-reaction-picker__recent" aria-label="Recent reactions">
            {recentReactions.map((r) => (
              <button
                key={r.id}
                type="button"
                className="vf-reaction-picker__btn"
                aria-label={r.label}
                onClick={() => pick(r.id)}
              >
                {r.glyph ?? r.label}
              </button>
            ))}
          </div>
        )}
        <div className="vf-reaction-picker__list">
          {others.map((r) => (
            <button
              key={r.id}
              type="button"
              className="vf-reaction-picker__btn"
              aria-label={r.label}
              onClick={() => pick(r.id)}
            >
              {r.glyph ?? r.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
);
ReactionPicker.displayName = "ReactionPicker";
