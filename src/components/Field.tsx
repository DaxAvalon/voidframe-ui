"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { useId } from "../hooks/useId";
import { createSafeContext } from "../utils/createSafeContext";
import { cx } from "../utils/cx";
import { Label } from "./Text";

interface FieldContextValue {
  id: string;
  labelId: string;
  helpId: string;
  errorId: string;
  hasError: boolean;
  hasHelp: boolean;
  required: boolean;
  disabled: boolean;
}

const [FieldProvider, useFieldContext] = createSafeContext<FieldContextValue>({
  name: "Field",
});

// ── Field.Root ────────────────────────────────────────────────

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  /** When true, marks the rendered control as invalid via context. */
  invalid?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Compound form field wrapper. Auto-wires `htmlFor`, `aria-describedby`,
 * `aria-invalid`, and `aria-required` across its subcomponents via context.
 *
 * @example
 * <Field required>
 *   <Field.Label>Email</Field.Label>
 *   <Field.Control><Input type="email" /></Field.Control>
 *   <Field.Help>We'll never share it.</Field.Help>
 *   <Field.Error>{errors.email}</Field.Error>
 * </Field>
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, required = false, disabled = false, invalid = false, children, className, style, ...props },
  ref
) {
  const fieldId = useId(id);

  // Walk children once to detect whether help/error are present. We do this
  // via child inspection (rather than forcing a parent prop) so consumers
  // can conditionally render <Field.Error /> based on validation state.
  const childArray = toArray(children);
  const hasError =
    invalid || childArray.some((c) => isFieldSubcomponent(c, FieldError));
  const hasHelp = childArray.some((c) => isFieldSubcomponent(c, FieldHelp));

  const ctx: FieldContextValue = {
    id: fieldId,
    labelId: `${fieldId}-label`,
    helpId: `${fieldId}-help`,
    errorId: `${fieldId}-error`,
    hasError,
    hasHelp,
    required,
    disabled,
  };

  return (
    <FieldProvider value={ctx}>
      <div
        ref={ref}
        className={cx("vf-field", className)}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={hasError ? "true" : undefined}
        style={style}
        {...props}
      >
        {children}
      </div>
    </FieldProvider>
  );
}) as ForwardRefExoticWithSub<HTMLDivElement, FieldProps>;
(Field as unknown as { displayName?: string }).displayName = "Field";

// ── Field.Label ───────────────────────────────────────────────

export interface FieldLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

/**
 * Label slot for `Field`. Auto-wires `htmlFor` to the nested control.
 */
export const FieldLabel = forwardRef<HTMLElement, FieldLabelProps>(
  function FieldLabel({ children, className, ...props }, ref) {
    const ctx = useFieldContext("Field.Label");
    return (
      <Label
        ref={ref}
        as="label"
        id={ctx.labelId}
        htmlFor={ctx.id}
        className={className}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
        {ctx.required && (
          <span aria-hidden="true" className="vf-form-field__required">
            *
          </span>
        )}
      </Label>
    );
  }
);
FieldLabel.displayName = "Field.Label";

// ── Field.Control ─────────────────────────────────────────────

export interface FieldControlProps {
  children: ReactElement;
}

/**
 * Wires a single form control (Input / Textarea / Select / ...) to the
 * surrounding `<Field>` — injects `id`, `aria-describedby`, `aria-invalid`,
 * `aria-required`, and `disabled`.
 */
export function FieldControl({ children }: FieldControlProps) {
  const ctx = useFieldContext("Field.Control");
  if (!isValidElement(children)) return null;

  const describedBy =
    [ctx.hasError ? ctx.errorId : null, ctx.hasHelp ? ctx.helpId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const existing = (children.props as Record<string, unknown>) ?? {};
  const merged: Record<string, unknown> = {
    id: (existing.id as string | undefined) ?? ctx.id,
    "aria-labelledby":
      (existing["aria-labelledby"] as string | undefined) ?? ctx.labelId,
    "aria-describedby":
      (existing["aria-describedby"] as string | undefined) ?? describedBy,
    "aria-invalid":
      (existing["aria-invalid"] as boolean | "true" | "false" | undefined) ??
      (ctx.hasError || undefined),
    "aria-required":
      (existing["aria-required"] as boolean | "true" | "false" | undefined) ??
      (ctx.required || undefined),
    disabled:
      (existing.disabled as boolean | undefined) ?? (ctx.disabled || undefined),
  };

  return cloneElement(children, merged as never);
}
FieldControl.displayName = "Field.Control";

// ── Field.Help ────────────────────────────────────────────────

export interface FieldHelpProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

/**
 * Help-text slot for `Field`. Auto-wired to the control via
 * `aria-describedby`.
 */
export const FieldHelp = forwardRef<HTMLSpanElement, FieldHelpProps>(
  function FieldHelp({ children, className, ...props }, ref) {
    const ctx = useFieldContext("Field.Help");
    // Error takes precedence — don't render help when error is active.
    if (ctx.hasError) return null;
    return (
      <span
        ref={ref}
        id={ctx.helpId}
        className={cx("vf-form-field__help", className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
FieldHelp.displayName = "Field.Help";

// ── Field.Error ───────────────────────────────────────────────

export interface FieldErrorProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

/**
 * Error slot for `Field`. Renders only when the field's validation state is
 * invalid. Auto-wired to the control via `aria-describedby`.
 */
export const FieldError = forwardRef<HTMLSpanElement, FieldErrorProps>(
  function FieldError({ children, className, ...props }, ref) {
    const ctx = useFieldContext("Field.Error");
    // Let consumers render an empty <Field.Error /> to reserve state without
    // content; still skip when genuinely empty.
    if (!children) return null;
    return (
      <span
        ref={ref}
        id={ctx.errorId}
        role="alert"
        className={cx("vf-form-field__error", className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
FieldError.displayName = "Field.Error";

// Attach compound subcomponents.
type ForwardRefExoticWithSub<E, P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<E>
> & {
  /**
   * Label slot for `Field`. Auto-wires `htmlFor` to the nested control.
   */
  Label: typeof FieldLabel;
  Control: typeof FieldControl;
  /**
   * Help-text slot for `Field`. Auto-wired to the control via
   * `aria-describedby`.
   */
  Help: typeof FieldHelp;
  /**
   * Error slot for `Field`. Renders only when the field's validation state
   * is invalid. Auto-wired to the control via `aria-describedby`.
   */
  Error: typeof FieldError;
};
(Field as ForwardRefExoticWithSub<HTMLDivElement, FieldProps>).Label = FieldLabel;
(Field as ForwardRefExoticWithSub<HTMLDivElement, FieldProps>).Control = FieldControl;
(Field as ForwardRefExoticWithSub<HTMLDivElement, FieldProps>).Help = FieldHelp;
(Field as ForwardRefExoticWithSub<HTMLDivElement, FieldProps>).Error = FieldError;

// ── helpers ───────────────────────────────────────────────────

function toArray(children: ReactNode): ReactNode[] {
  if (children == null) return [];
  return Array.isArray(children) ? children.flat(Infinity) : [children];
}

function isFieldSubcomponent(
  node: ReactNode,
  Sub: { displayName?: string }
): boolean {
  return (
    isValidElement(node) &&
    (node.type as unknown as { displayName?: string }).displayName ===
      Sub.displayName
  );
}
