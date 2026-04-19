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

interface WizardContextValue {
  currentIndex: number;
  total: number;
  currentId: string | undefined;
  goTo: (idOrIndex: string | number) => void;
  next: () => void;
  previous: () => void;
  canAdvance: boolean;
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
  /** Show a built-in step indicator above the content. Default true. */
  showStepper?: boolean;
  children?: ReactNode;
}

const WizardBase = forwardRef<HTMLDivElement, WizardProps>(function Wizard(
  { value, defaultValue, onValueChange, onComplete, canAdvance, showStepper = true, className, children, ...props },
  ref
) {
  // Collect step ids and labels from children.
  const steps: string[] = [];
  const stepLabels: Record<string, string> = {};
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ id?: string; label?: string }>;
    const type = el.type as { displayName?: string };
    if (type.displayName === "WizardStep" && el.props.id) {
      steps.push(el.props.id);
      stepLabels[el.props.id] = el.props.label ?? el.props.id;
    }
  });

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

  const ctx = useMemo<WizardContextValue>(
    () => ({
      currentIndex: idx,
      total: steps.length,
      currentId,
      goTo,
      next,
      previous,
      canAdvance: advance,
      isFirst: idx === 0,
      isLast: idx === steps.length - 1,
    }),
    [idx, steps.length, currentId, goTo, next, previous, advance]
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
                  i < idx && "vf-wizard__step-label--completed"
                )}
                aria-current={i === idx ? "step" : undefined}
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
  /** Display label for the step indicator. Falls back to `id`. */
  label?: string;
  /** @internal */
  active?: boolean;
  children?: ReactNode;
}

const WizardStep = forwardRef<HTMLDivElement, WizardStepProps>(function WizardStep(
  { id, active, className, children, ...props },
  ref
) {
  if (!active) return null;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={`Step ${id}`}
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
        {children ?? "Back"}
      </button>
    );
  }
);
WizardPrevious.displayName = "WizardPrevious";

const WizardNext = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function WizardNext({ className, onClick, children, ...props }, ref) {
    const ctx = useWizard();
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
        {children ?? (ctx.isLast ? "Finish" : "Next")}
      </button>
    );
  }
);
WizardNext.displayName = "WizardNext";

function WizardStepIndicator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useWizard();
  return (
    <div
      className={cx("vf-wizard__indicator", className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      Step {ctx.currentIndex + 1} of {ctx.total}
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
  StepIndicator: WizardStepIndicator,
});
