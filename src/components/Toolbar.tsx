"use client";

// Phase 8 — Toolbar (compound)
//
// Horizontal (or vertical) tool strip with roving tabindex. Children can be
// plain `Toolbar.Button`, `Toolbar.Link`, `Toolbar.Separator`, or grouped
// `Toolbar.ToggleGroup` / `Toolbar.ToggleItem`.

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: ToolbarOrientation;
  children?: ReactNode;
}

const ToolbarBase = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { orientation = "horizontal", className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-orientation={orientation}
      className={cx("vf-toolbar", `vf-toolbar--${orientation}`, className)}
      {...props}
    >
      {children}
    </div>
  );
});

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ className, pressed, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        className={cx(
          "vf-toolbar__button",
          pressed && "vf-toolbar__button--pressed",
          className
        )}
        {...props}
      />
    );
  }
);
ToolbarButton.displayName = "ToolbarButton";

export interface ToolbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}
const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  function ToolbarLink({ className, ...props }, ref) {
    return (
      <a ref={ref} className={cx("vf-toolbar__link", className)} {...props} />
    );
  }
);
ToolbarLink.displayName = "ToolbarLink";

function ToolbarSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="separator" className="vf-toolbar__separator" {...props} />
  );
}

// ── ToggleGroup (single or multiple) ──────────────────────────

type ToggleGroupValue = string | string[];

interface ToolbarToggleContextValue {
  type: "single" | "multiple";
  value: ToggleGroupValue;
  toggle: (value: string) => void;
}
const ToolbarToggleContext = createContext<ToolbarToggleContextValue | null>(null);

export interface ToolbarToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  type?: "single" | "multiple";
  value?: ToggleGroupValue;
  defaultValue?: ToggleGroupValue;
  onChange?: (value: ToggleGroupValue) => void;
  children?: ReactNode;
}

function ToolbarToggleGroup({
  type = "single",
  value,
  defaultValue,
  onChange,
  children,
  className,
  ...props
}: ToolbarToggleGroupProps) {
  const [internal, setInternal] = useState<ToggleGroupValue>(
    defaultValue ?? (type === "single" ? "" : [])
  );
  const current = value ?? internal;

  const toggle = (v: string) => {
    let next: ToggleGroupValue;
    if (type === "single") {
      next = current === v ? "" : v;
    } else {
      const arr = Array.isArray(current) ? current : [];
      next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    }
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const ctxValue = useMemo<ToolbarToggleContextValue>(
    () => ({ type, value: current, toggle }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, current]
  );
  return (
    <ToolbarToggleContext.Provider value={ctxValue}>
      <div
        role="group"
        className={cx("vf-toolbar__toggle-group", className)}
        {...props}
      >
        {children}
      </div>
    </ToolbarToggleContext.Provider>
  );
}

export interface ToolbarToggleItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const ToolbarToggleItem = forwardRef<HTMLButtonElement, ToolbarToggleItemProps>(
  function ToolbarToggleItem({ value, className, children, ...props }, ref) {
    const ctx = useContext(ToolbarToggleContext);
    if (!ctx) throw new Error("Toolbar.ToggleItem must be inside Toolbar.ToggleGroup");
    const pressed =
      ctx.type === "single" ? ctx.value === value : Array.isArray(ctx.value) && ctx.value.includes(value);
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        className={cx(
          "vf-toolbar__button",
          pressed && "vf-toolbar__button--pressed",
          className
        )}
        onClick={() => ctx.toggle(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToolbarToggleItem.displayName = "ToolbarToggleItem";

/**
 * Horizontal (or vertical) action strip with WAI-ARIA `role="toolbar"`.
 * Compose with `Toolbar.Button`, `Toolbar.Link`, `Toolbar.Separator`, and
 * `Toolbar.ToggleGroup` + `Toolbar.ToggleItem` for single/multi press
 * state. `aria-orientation` tracks the `orientation` prop.
 */
export const Toolbar = Object.assign(ToolbarBase, {
  Button: ToolbarButton,
  Link: ToolbarLink,
  Separator: ToolbarSeparator,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
});
