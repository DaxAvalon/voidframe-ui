"use client";

// Phase 8 — Wizard (multi-step form)
//
// Controlled or uncontrolled step state. Supports per-step validation via a
// `canAdvance` hook; the Next button is disabled when validation fails.

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useMessages } from "../i18n/MessagesProvider";

interface WizardContextValue {
  currentIndex: number;
  total: number;
  currentId: string | undefined;
  goTo: (idOrIndex: string | number) => void;
  next: () => void;
  previous: () => void;
  /** Advance without the `canAdvance` gate; records the step as skipped. */
  skip: () => void;
  canAdvance: boolean;
  /** Whether the current step may be skipped (see `Wizard.Step optional`). */
  canSkip: boolean;
  skipped: ReadonlySet<string>;
  isFirst: boolean;
  isLast: boolean;
}
const WizardContext = createContext<WizardContextValue | null>(null);
function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("Wizard.* must be used inside <Wizard>");
  return ctx;
}

export interface WizardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "value"> {
  /** Controlled current step id. */
  value?: string;
  /** Uncontrolled default step id. Falls back to the first step. */
  defaultValue?: string;
  onValueChange?: (stepId: string) => void;
  /** Called when the final step completes. */
  onComplete?: () => void;
  /** Per-step validation gate. Return `false` to block Next. */
  canAdvance?: (stepId: string) => boolean;
  /** Called when a step is skipped with `Wizard.Skip`. */
  onSkip?: (stepId: string) => void;
  /** Show a built-in step indicator above the content. Default true. */
  showStepper?: boolean;
  children?: ReactNode;
}

const WizardBase = forwardRef<HTMLDivElement, WizardProps>(function Wizard(
  { value, defaultValue, onValueChange, onComplete, canAdvance, onSkip, showStepper = true, className, children, ...props },
  ref
) {
  // Collect step ids and labels from children.
  const steps: string[] = [];
  const stepLabels: Record<string, string> = {};
  const optionalSteps = new Set<string>();
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ id?: string; label?: string; optional?: boolean }>;
    const type = el.type as { displayName?: string };
    if (type.displayName === "WizardStep" && el.props.id) {
      steps.push(el.props.id);
      stepLabels[el.props.id] = el.props.label ?? el.props.id;
      if (el.props.optional) optionalSteps.add(el.props.id);
    }
  });
  const [skipped, setSkipped] = useState<Set<string>>(() => new Set());

  const [internal, setInternal] = useState<string>(
    defaultValue ?? steps[0] ?? ""
  );
  const currentId = value ?? internal;
  const idx = Math.max(0, steps.indexOf(currentId));

  const goTo = useCallback(
    (target: string | number) => {
      const resolvedId =
        typeof target === "number"
          ? steps[Math.max(0, Math.min(steps.length - 1, target))]
          : target;
      if (!resolvedId) return;
      if (value === undefined) setInternal(resolvedId);
      onValueChange?.(resolvedId);
    },
    [value, onValueChange, steps]
  );

  const next = useCallback(() => {
    if (idx >= steps.length - 1) {
      onComplete?.();
      return;
    }
    goTo(idx + 1);
  }, [idx, goTo, steps.length, onComplete]);

  const previous = useCallback(() => {
    if (idx === 0) return;
    goTo(idx - 1);
  }, [idx, goTo]);

  const advance = currentId ? canAdvance?.(currentId) ?? true : false;
  const canSkip = currentId !== undefined && optionalSteps.has(currentId);
  const optionalKey = [...optionalSteps].join("|");

  const skip = useCallback(() => {
    if (!currentId || !optionalSteps.has(currentId)) return;
    setSkipped((prev) => {
      if (prev.has(currentId)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(currentId);
      return nextSet;
    });
    onSkip?.(currentId);
    if (idx >= steps.length - 1) {
      onComplete?.();
      return;
    }
    goTo(idx + 1);
    // optionalKey stands for the optional set's content.
  }, [currentId, idx, steps.length, goTo, onComplete, onSkip, optionalKey]);

  const ctx = useMemo<WizardContextValue>(
    () => ({
      currentIndex: idx,
      total: steps.length,
      currentId,
      goTo,
      next,
      previous,
      skip,
      canAdvance: advance,
      canSkip,
      skipped,
      isFirst: idx === 0,
      isLast: idx === steps.length - 1,
    }),
    [idx, steps.length, currentId, goTo, next, previous, skip, advance, canSkip, skipped]
  );

  return (
    <WizardContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx("vf-wizard", className)}
        {...props}
      >
        {showStepper && steps.length > 0 && (
          <ol className="vf-wizard__stepper">
            {steps.map((stepId, i) => (
              <li
                key={stepId}
                className={cx(
                  "vf-wizard__step-label",
                  i === idx && "vf-wizard__step-label--active",
                  i < idx && "vf-wizard__step-label--completed",
                  skipped.has(stepId) && "vf-wizard__step-label--skipped"
                )}
                aria-current={i === idx ? "step" : undefined}
                data-skipped={skipped.has(stepId) || undefined}
              >
                {stepLabels[stepId]}
              </li>
            ))}
          </ol>
        )}
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;
          const typed = child as ReactElement<{ id?: string; active?: boolean }>;
          const type = typed.type as { displayName?: string };
          if (type.displayName === "WizardStep") {
            return cloneElement(typed, { active: typed.props.id === currentId });
          }
          return child;
        })}
      </div>
    </WizardContext.Provider>
  );
});

export interface WizardStepProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  /** Display label for the step indicator and the step's accessible name. Falls back to `id`. */
  label?: string;
  /** The step may be skipped with `Wizard.Skip`. Default false. */
  optional?: boolean;
  /** @internal */
  active?: boolean;
  children?: ReactNode;
}

const WizardStep = forwardRef<HTMLDivElement, WizardStepProps>(function WizardStep(
  { id, label, optional, active, className, children, ...props },
  ref
) {
  if (!active) return null;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label ?? id}
      data-optional={optional || undefined}
      className={cx("vf-wizard__step", className)}
      {...props}
    >
      {children}
    </div>
  );
});
WizardStep.displayName = "WizardStep";

function WizardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-wizard__footer", className)} {...props} />;
}

const WizardPrevious = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function WizardPrevious({ className, onClick, children, ...props }, ref) {
    const ctx = useWizard();
    const { t } = useMessages();
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-button", "vf-wizard__previous", className)}
        disabled={ctx.isFirst}
        onClick={(e) => {
          onClick?.(e);
          ctx.previous();
        }}
        {...props}
      >
        {children ?? t("wizard.back")}
      </button>
    );
  }
);
WizardPrevious.displayName = "WizardPrevious";

const WizardNext = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function WizardNext({ className, onClick, children, ...props }, ref) {
    const ctx = useWizard();
    const { t } = useMessages();
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-button", "vf-wizard__next", className)}
        disabled={!ctx.canAdvance}
        onClick={(e) => {
          onClick?.(e);
          ctx.next();
        }}
        {...props}
      >
        {children ?? (ctx.isLast ? t("wizard.finish") : t("wizard.next"))}
      </button>
    );
  }
);
WizardNext.displayName = "WizardNext";

/**
 * Skips the current step without its `canAdvance` gate. Renders only while
 * the current step is `optional`; records the step in `skipped` (shown in
 * the indicator) and calls `onSkip`.
 */
const WizardSkip = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function WizardSkip({ className, onClick, children, ...props }, ref) {
    const ctx = useWizard();
    const { t } = useMessages();
    if (!ctx.canSkip) return null;
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-button", "vf-wizard__skip", className)}
        onClick={(e) => {
          onClick?.(e);
          ctx.skip();
        }}
        {...props}
      >
        {children ?? t("wizard.skip")}
      </button>
    );
  }
);
WizardSkip.displayName = "WizardSkip";

function WizardStepIndicator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useWizard();
  const { t } = useMessages();
  return (
    <div
      className={cx("vf-wizard__indicator", className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      {t("wizard.stepOf", { current: ctx.currentIndex + 1, total: ctx.total })}
    </div>
  );
}

/**
 * Multi-step form/workflow container. Compose `Wizard.Step` (one per
 * step) and drive navigation with `Wizard.Previous` / `Wizard.Next` inside
 * `Wizard.Footer`; `Wizard.StepIndicator` shows "Step X of N". Controlled
 * via `value` (step id) + `onValueChange`, or uncontrolled via `defaultValue`.
 * Per-step validation via `canAdvance(id)`; `onComplete` fires from the
 * last step.
 */
export const Wizard = Object.assign(WizardBase, {
  Step: WizardStep,
  Footer: WizardFooter,
  Previous: WizardPrevious,
  Next: WizardNext,
  Skip: WizardSkip,
  StepIndicator: WizardStepIndicator,
});
export { useWizard };
