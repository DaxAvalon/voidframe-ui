"use client";

import { cloneElement, forwardRef, isValidElement, memo } from "react";
import type { MouseEvent, ReactElement } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { cx } from "../utils/cx";
import { warn } from "../utils/warn";
import { buttonDisabledAttrs } from "../utils/buttonDisabledAttrs";
import { toneAttrs } from "../utils/toneAttrs";

/**
 * Button visual variant. `"destructive"` is a shadcn-compat shorthand
 * for `variant="solid" tone="danger"` — not an independent variant.
 */
export type ButtonVariant = "solid" | "outline" | "ghost" | "subtle" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";
export type ButtonTone =
  | "neutral"
  | "info"
  | "success"
  | "danger"
  | "warning";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: ButtonVariant;
  /** Accent color for `solid` and `subtle` variants. Sets `--vf-accent`. */
  accent?: string;
  /**
   * Semantic tone. Adds `data-tone="…"` + `vf-button--tone-…` class and, for
   * `danger`/`warning`/`success`, primes `--vf-accent` to the matching token
   * so solid/subtle variants render in-tone without manual `accent=`.
   * Mirrors the Badge/AlertV2/Card tone vocabulary.
   */
  tone?: ButtonTone;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  /** When true, renders a spinner before children and disables the button. */
  loading?: boolean;
  /** Icon rendered before children. Replaced by spinner when loading. */
  iconLeft?: ReactNode;
  /** Icon rendered after children. */
  iconRight?: ReactNode;
  /**
   * Click handler. Receives the native `MouseEvent` so consumers can call
   * `stopPropagation()` / `preventDefault()` when the button is nested inside
   * a clickable row or card. (Prior to 1.1.0 the signature was `() => void`;
   * the event param is additive — existing zero-arg handlers keep working.)
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Render through `<Slot>` and merge styles onto a single child element. */
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

const ButtonImpl = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "outline",
    accent,
    tone,
    size = "md",
    active,
    disabled,
    loading,
    iconLeft,
    iconRight,
    onClick,
    asChild,
    className,
    style,
    ...props
  },
  ref
) {
  // `variant="destructive"` is an alias for `tone="danger"` + solid visual —
  // matches the shadcn/Radix migration vocabulary without forking.
  const resolvedTone: ButtonTone | undefined =
    variant === "destructive" ? "danger" : tone;
  const resolvedVariant: ButtonVariant =
    variant === "destructive" ? "solid" : variant;
  const composedStyle: CSSProperties = {
    ...(accent ? ({ "--vf-accent": accent } as CSSProperties) : {}),
    // Tone primes --vf-accent when no explicit accent is supplied, so solid
    // and subtle variants pick up the semantic color automatically.
    ...(!accent && resolvedTone && resolvedTone !== "neutral"
      ? ({ "--vf-accent": `var(--vf-${resolvedTone})` } as CSSProperties)
      : {}),
    ...style,
  };
  const ta = toneAttrs("vf-button", {
    variant: resolvedVariant,
    size,
    tone: resolvedTone,
  });
  const composedClass = cx(ta.className, className);
  const isDisabled = disabled || loading;
  const dataAttrs = {
    ...ta.attrs,
    "data-active": active ? "true" : undefined,
    "data-disabled": isDisabled ? "true" : undefined,
  };

  if (asChild) {
    warn(
      typeof children !== "string",
      "<Button asChild> expects a single React element child (not a plain string)."
    );
    // Decorate the child element: inject icons/spinner around its existing
    // children, then pass the decorated child to Slot for prop merging.
    let decoratedChild = children;
    if (isValidElement(children)) {
      const childEl = children as ReactElement<{ children?: React.ReactNode }>;
      decoratedChild = cloneElement(childEl, {
        children: (
          <>
            {loading ? (
              <span className="vf-button__spinner" aria-hidden="true">&#x27F3;</span>
            ) : iconLeft ? (
              <span className="vf-button__icon vf-button__icon--left">{iconLeft}</span>
            ) : null}
            {childEl.props.children}
            {iconRight && (
              <span className="vf-button__icon vf-button__icon--right">{iconRight}</span>
            )}
          </>
        ),
      });
    }
    return (
      <Slot
        ref={ref as never}
        onClick={isDisabled ? undefined : onClick}
        className={composedClass}
        style={composedStyle}
        {...dataAttrs}
        {...props}
      >
        {decoratedChild}
      </Slot>
    );
  }

  const { type: typeProp, ...restProps } = props as { type?: "button" | "submit" | "reset" };
  return (
    <button
      ref={ref}
      type={typeProp ?? "button"}
      onClick={isDisabled ? undefined : onClick}
      {...buttonDisabledAttrs(isDisabled)}
      className={composedClass}
      style={composedStyle}
      {...dataAttrs}
      {...restProps}
    >
      {loading ? (
        <span className="vf-button__spinner" aria-hidden="true">&#x27F3;</span>
      ) : iconLeft ? (
        <span className="vf-button__icon vf-button__icon--left">{iconLeft}</span>
      ) : null}
      {children}
      {iconRight && <span className="vf-button__icon vf-button__icon--right">{iconRight}</span>}
    </button>
  );
});
ButtonImpl.displayName = "Button";
/**
 * Primary interactive button. Five variants (`solid`, `outline`, `ghost`,
 * `subtle`, `destructive`), four sizes including `icon` (square 1:1 aspect),
 * tone vocabulary (`neutral` / `info` / `success` / `danger` / `warning`)
 * mirroring Badge/AlertV2/Card, optional `iconLeft` / `iconRight`, loading
 * spinner, and polymorphic `asChild` for slot-style composition. Memoized so
 * re-renders are skipped when props are referentially stable.
 *
 * @remarks
 * **Disabled behavior** — when `disabled` (or `loading`) is true, voidframe
 * emits BOTH the native `disabled` attribute AND `aria-disabled="true"`,
 * and strips the `onClick` handler. Native `disabled` makes
 * `button:disabled` CSS, `<form>` submission suppression, and
 * `expect(btn).toHaveAttribute("disabled")` test assertions all work as
 * native HTML expects. This dual-emit pattern is shared with `IconButton`,
 * `CopyButton`, `SplitButton`, `ToggleGroup`, `Toolbar`, and
 * `SegmentedControl` via the `buttonDisabledAttrs` shared helper.
 *
 * **`onClick` event arg** — receives the native `MouseEvent` so handlers
 * can call `stopPropagation()` / `preventDefault()` without wrapping the
 * Button in a span (common when nested inside a clickable card / row).
 *
 * **`variant="destructive"`** is an alias that maps to `tone="danger"` +
 * solid visual — provides drop-in compatibility with shadcn/Radix call
 * sites that use that variant name.
 */
export const Button = memo(ButtonImpl);
(Button as unknown as { displayName: string }).displayName = "Button";

export interface ButtonGroupOption {
  key: string;
  label: ReactNode;
  /** Optional leading icon rendered before the label. */
  icon?: ReactNode;
  /** Disable this individual option. */
  disabled?: boolean;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onValueChange: (key: string) => void;
  accent?: string;
  size?: ButtonSize;
  className?: string;
  style?: CSSProperties;
}

/**
 * Horizontal group of buttons with unified borders. Accepts `Button` or
 * `IconButton` children and exposes `attached` / `size` / `variant` props.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ options, value, onValueChange, accent, size, className, style }, ref) {
    return (
      <div ref={ref} className={cx("vf-button-group", className)} style={style}>
        {options.map((o) => (
          <Button
            key={o.key}
            active={value === o.key}
            onClick={() => { if (!o.disabled) onValueChange(o.key); }}
            accent={accent}
            size={size}
            variant={accent ? "subtle" : "outline"}
            disabled={o.disabled}
          >
            {o.icon && <span className="vf-button__icon">{o.icon}</span>}
            {o.label}
          </Button>
        ))}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";
