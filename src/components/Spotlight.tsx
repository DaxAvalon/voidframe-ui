"use client";

// Phase 10 — Spotlight (onboarding tour) + CoachMark (single-shot pointer)
//
// Spotlight cuts a transparent hole around a target element via an SVG mask
// and renders a stepped tooltip card. CoachMark is a one-time pointer that
// remembers its dismissal in localStorage by key.

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { Portal } from "../primitives/Portal";
import { cx } from "../utils/cx";

export interface SpotlightStep {
  /** CSS selector or element ref. */
  target: string | RefObject<HTMLElement> | HTMLElement | null;
  title?: ReactNode;
  content?: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  /** Optional padding around the target hole (px). */
  padding?: number;
}

export interface SpotlightProps extends HTMLAttributes<HTMLDivElement> {
  steps: SpotlightStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (n: number) => void;
  onComplete?: () => void;
  allowSkip?: boolean;
  /** Tint color of the surrounding overlay. */
  tint?: string;
}

function resolveTarget(target: SpotlightStep["target"]): HTMLElement | null {
  if (!target) return null;
  if (typeof target === "string") return document.querySelector(target);
  if ("current" in target) return target.current;
  return target;
}

/**
 * Dimmed overlay with a cut-out highlighting a target element. Used by
 * `CoachMark`.
 */
export const Spotlight = forwardRef<HTMLDivElement, SpotlightProps>(function Spotlight(
  {
    steps,
    open,
    defaultOpen,
    onOpenChange,
    step,
    defaultStep = 0,
    onStepChange,
    onComplete,
    allowSkip = true,
    tint = "rgba(0, 0, 0, 0.65)",
    className,
    ...props
  },
  ref
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  const [internalStep, setInternalStep] = useState(defaultStep);
  const currentStep = step ?? internalStep;
  const setStep = useCallback(
    (next: number) => {
      if (step === undefined) setInternalStep(next);
      onStepChange?.(next);
    },
    [step, onStepChange]
  );

  const stepObj = steps[currentStep];
  const [rect, setRect] = useState<DOMRect | null>(null);
  const maskId = useId();

  useEffect(() => {
    if (!isOpen || !stepObj) return;
    const update = () => {
      const el = resolveTarget(stepObj.target);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }
    return;
  }, [isOpen, stepObj]);

  if (!isOpen || !stepObj) return null;
  const padding = stepObj.padding ?? 6;

  const next = () => {
    if (currentStep + 1 >= steps.length) {
      onComplete?.();
      setOpen(false);
    } else {
      setStep(currentStep + 1);
    }
  };
  const prev = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };
  const skip = () => {
    setOpen(false);
  };

  // Compute card position outside the hole.
  const card = (() => {
    if (!rect) return { top: 16, left: 16 };
    const placement = stepObj.placement ?? "bottom";
    const offset = 12;
    const top =
      placement === "top"
        ? rect.top - offset - 160
        : placement === "bottom"
          ? rect.bottom + offset
          : rect.top;
    const left =
      placement === "left"
        ? rect.left - offset - 320
        : placement === "right"
          ? rect.right + offset
          : rect.left;
    return { top: Math.max(8, top), left: Math.max(8, left) };
  })();

  return (
    <Portal>
      <div
        ref={ref}
        className={cx("vf-spotlight", className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof stepObj.title === "string" ? stepObj.title : "Tour"}
        {...props}
      >
        <svg
          className="vf-spotlight__mask"
          aria-hidden="true"
          width="100%"
          height="100%"
        >
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={Math.max(0, rect.left - padding)}
                  y={Math.max(0, rect.top - padding)}
                  width={rect.width + padding * 2}
                  height={rect.height + padding * 2}
                  fill="black"
                  rx={4}
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={tint}
            mask={`url(#${maskId})`}
          />
        </svg>
        <div
          className="vf-spotlight__card"
          style={{ top: card.top, left: card.left }}
        >
          {stepObj.title && (
            <h2 className="vf-spotlight__title">{stepObj.title}</h2>
          )}
          {stepObj.content && (
            <div className="vf-spotlight__content">{stepObj.content}</div>
          )}
          <div className="vf-spotlight__nav">
            <span className="vf-spotlight__progress">
              {currentStep + 1} / {steps.length}
            </span>
            <div className="vf-spotlight__actions">
              {allowSkip && (
                <button type="button" className="vf-button vf-button--ghost" onClick={skip}>
                  Skip
                </button>
              )}
              {currentStep > 0 && (
                <button type="button" className="vf-button" onClick={prev}>
                  Back
                </button>
              )}
              <button type="button" className="vf-button" onClick={next}>
                {currentStep + 1 >= steps.length ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
});
Spotlight.displayName = "Spotlight";

// ── CoachMark ────────────────────────────────────────────────

export interface CoachMarkProps extends HTMLAttributes<HTMLDivElement> {
  target: RefObject<HTMLElement> | HTMLElement | null;
  placement?: "top" | "bottom" | "left" | "right";
  /** When set, dismissal is persisted in localStorage under this key and the mark stays hidden across reloads. Omit for mount-scoped dismissal. */
  storageKey?: string;
  children?: ReactNode;
  /** Render even if previously dismissed. Useful for testing. */
  forceShow?: boolean;
  onDismiss?: () => void;
}

function readDismissed(key: string | undefined): boolean {
  if (!key || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`vf-coachmark:${key}`) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(key: string | undefined): void {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`vf-coachmark:${key}`, "1");
  } catch {
    /* noop */
  }
}

/**
 * Spotlight / coach-mark overlay that anchors a tooltip-style card to a
 * target element. Use for onboarding tours.
 */
export const CoachMark = forwardRef<HTMLDivElement, CoachMarkProps>(function CoachMark(
  {
    target,
    placement = "bottom",
    storageKey,
    forceShow,
    onDismiss,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  const [dismissed, setDismissed] = useState<boolean>(() =>
    !forceShow && readDismissed(storageKey)
  );
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = target && "current" in target ? target.current : (target as HTMLElement | null);
    if (!el) return;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }
    return;
  }, [target]);

  if (dismissed || !rect) return null;

  const dismiss = () => {
    setDismissed(true);
    writeDismissed(storageKey);
    onDismiss?.();
  };

  const offset = 8;
  const top =
    placement === "top"
      ? rect.top - offset - 80
      : placement === "bottom"
        ? rect.bottom + offset
        : rect.top + rect.height / 2 - 40;
  const left =
    placement === "left"
      ? rect.left - offset - 240
      : placement === "right"
        ? rect.right + offset
        : rect.left + rect.width / 2 - 120;

  return (
    <Portal>
      <div
        ref={ref}
        role="status"
        className={cx(
          "vf-coachmark",
          `vf-coachmark--${placement}`,
          className
        )}
        style={{
          position: "fixed",
          top: Math.max(8, top),
          left: Math.max(8, left),
          ...style,
        }}
        {...props}
      >
        <div className="vf-coachmark__body">{children}</div>
        <button
          type="button"
          className="vf-coachmark__dismiss"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </Portal>
  );
});
CoachMark.displayName = "CoachMark";

// re-export for tests
export type { CSSProperties as _SpotlightCSSProperties };
