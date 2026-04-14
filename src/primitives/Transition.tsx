import {
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Presence } from "./Presence";
import { cx } from "../utils/cx";
import { warn } from "../utils/warn";

export type TransitionType =
  | "fade"
  | "scale"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

export interface TransitionProps {
  /** Show the child. When false, the child unmounts after its exit animation completes. */
  show: boolean;
  /** Named animation. Maps to `.vf-transition--*` CSS rules. */
  type?: TransitionType;
  /** Override both enter and exit duration (ms). */
  duration?: number;
  /** Override enter duration only (ms). */
  enterDuration?: number;
  /** Override exit duration only (ms). */
  exitDuration?: number;
  children: ReactNode;
}

/**
 * High-level enter/exit animation wrapper. Composes `<Presence>` with a
 * predefined animation type.
 *
 * The child element receives a merged `className` and `data-state`:
 * - `data-state="open"`  when entering / entered
 * - `data-state="closed"` when exiting / exited
 *
 * CSS rules in `@/css/components/transition.css` target those states per
 * animation type. For custom animations, use `<Presence>` directly and
 * write your own CSS.
 *
 * @example
 * <Transition show={open} type="fade">
 *   <div className="my-panel">hello</div>
 * </Transition>
 */
export function Transition({
  show,
  type = "fade",
  duration,
  enterDuration,
  exitDuration,
  children,
}: TransitionProps) {
  if (!isValidElement(children)) {
    warn(
      false,
      "<Transition> expects a single React element child. Got: " +
        (children == null ? "null/undefined" : typeof children)
    );
    return null;
  }

  const child = children as ReactElement & {
    props: { className?: string; style?: CSSProperties };
  };

  const mergedClassName = cx(
    child.props.className,
    "vf-transition",
    `vf-transition--${type}`
  );

  // Allow per-instance duration overrides via CSS custom properties so the
  // stylesheet can reference `var(--vf-transition-enter-duration)` / exit.
  const durationVars: CSSProperties = {};
  if (enterDuration !== undefined) {
    (durationVars as Record<string, string>)["--vf-transition-enter-duration"] =
      `${enterDuration}ms`;
  }
  if (exitDuration !== undefined) {
    (durationVars as Record<string, string>)["--vf-transition-exit-duration"] =
      `${exitDuration}ms`;
  }
  if (duration !== undefined) {
    (durationVars as Record<string, string>)["--vf-transition-enter-duration"] =
      `${duration}ms`;
    (durationVars as Record<string, string>)["--vf-transition-exit-duration"] =
      `${duration}ms`;
  }

  const mergedStyle: CSSProperties = {
    ...child.props.style,
    ...durationVars,
  };

  const enhanced = cloneElement(child, {
    className: mergedClassName,
    style: mergedStyle,
  } as never);

  return <Presence present={show}>{enhanced}</Presence>;
}
