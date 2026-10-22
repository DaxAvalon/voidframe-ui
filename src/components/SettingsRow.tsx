"use client";

// SettingsRow — name and description on the left, a control column on the
// right, stacking under a breakpoint. The layout every settings page
// repeats; the control is whatever form component the consumer passes and
// is labelled by the row's name through `aria-labelledby`.

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useId } from "../hooks/useId";

export interface SettingsRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The setting's name. Rendered as the row's label. */
  label: ReactNode;
  /** What the setting does, under the name. */
  description?: ReactNode;
  /** A status slot after the description: a Badge, a Verdict, "Saved 2 s ago". */
  status?: ReactNode;
  /**
   * Below this breakpoint the control stacks under the text. `"sm"` 640,
   * `"md"` 768 (default), `"lg"` 1024, or `"never"`.
   */
  stackBelow?: "sm" | "md" | "lg" | "never";
  /** Width of the control column when side by side. Default `minmax(200px, 40%)`. */
  controlWidth?: string;
  /** Align the control with the top of the text instead of its centre. */
  alignTop?: boolean;
  /**
   * Label the control with the row's name (`aria-labelledby` on the single
   * child element) when it has no label of its own. Default true.
   */
  labelControl?: boolean;
  /** The control. */
  children?: ReactNode;
}

export const SettingsRow = forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  {
    label,
    description,
    status,
    stackBelow = "md",
    controlWidth,
    alignTop = false,
    labelControl = true,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = description ? `${id}-desc` : undefined;
  const kids = Children.toArray(children);
  const single = kids.length === 1 && isValidElement(kids[0]) ? (kids[0] as ReactElement<Record<string, unknown>>) : null;
  const control =
    labelControl && single && !single.props["aria-label"] && !single.props["aria-labelledby"] && !single.props.label
      ? cloneElement(single, {
          "aria-labelledby": labelId,
          ...(descId && !single.props["aria-describedby"] ? { "aria-describedby": descId } : {}),
        })
      : children;
  return (
    <div
      ref={ref}
      className={cx(
        "vf-settings-row",
        stackBelow !== "never" && `vf-settings-row--stack-${stackBelow}`,
        alignTop && "vf-settings-row--top",
        className
      )}
      style={controlWidth ? { ...style, ["--vf-settings-row-control" as string]: controlWidth } : style}
      {...props}
    >
      <div className="vf-settings-row__text">
        <div id={labelId} className="vf-settings-row__label">
          {label}
        </div>
        {description && (
          <div id={descId} className="vf-settings-row__description">
            {description}
          </div>
        )}
        {status && <div className="vf-settings-row__status">{status}</div>}
      </div>
      <div className="vf-settings-row__control">{control}</div>
    </div>
  );
});
SettingsRow.displayName = "SettingsRow";
