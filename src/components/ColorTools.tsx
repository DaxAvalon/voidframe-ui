"use client";

// Phase 13 — ColorSwatch + Palette

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export interface ColorSwatchProps
  extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  color: string;
  size?: number | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  /** Explicit disabled state. Defaults to `!onSelect` when interactive. */
  disabled?: boolean;
}

const SIZE_MAP = { sm: 16, md: 24, lg: 36 } as const;

function resolveSize(size: number | "sm" | "md" | "lg"): number {
  if (typeof size === "number") return size;
  return SIZE_MAP[size];
}

/**
 * Labelled colour chip used in palettes, legend entries, and form controls.
 * Renders a coloured square plus label.
 */
export const ColorSwatch = forwardRef<HTMLElement, ColorSwatchProps>(
  function ColorSwatch(
    {
      color,
      size = "md",
      showLabel = false,
      label,
      selected,
      onSelect,
      disabled,
      className,
      style,
      ...props
    },
    ref
  ) {
    const dim = resolveSize(size);
    const displayLabel = label ?? color;
    const isInteractive = !!onSelect;
    const isDisabled = disabled ?? (isInteractive ? false : undefined);

    if (!isInteractive) {
      // Display-only: render a non-interactive container.
      return (
        <div
          ref={ref as unknown as React.Ref<HTMLDivElement>}
          aria-label={
            typeof displayLabel === "string" ? displayLabel : undefined
          }
          className={cx(
            "vf-color-swatch",
            "vf-color-swatch--display",
            selected && "vf-color-swatch--selected",
            showLabel && "vf-color-swatch--with-label",
            className
          )}
          style={style}
          data-disabled={isDisabled ? "true" : undefined}
          {...(props as HTMLAttributes<HTMLDivElement>)}
        >
          <span
            className="vf-color-swatch__chip"
            style={{ background: color, width: dim, height: dim }}
            aria-hidden="true"
          />
          {showLabel && (
            <span className="vf-color-swatch__label">{displayLabel}</span>
          )}
        </div>
      );
    }

    return (
      <button
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        type="button"
        aria-pressed={selected ? "true" : undefined}
        aria-label={
          typeof displayLabel === "string" ? displayLabel : undefined
        }
        className={cx(
          "vf-color-swatch",
          selected && "vf-color-swatch--selected",
          showLabel && "vf-color-swatch--with-label",
          className
        )}
        onClick={onSelect}
        disabled={isDisabled}
        style={style}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        <span
          className="vf-color-swatch__chip"
          style={{ background: color, width: dim, height: dim }}
          aria-hidden="true"
        />
        {showLabel && (
          <span className="vf-color-swatch__label">{displayLabel}</span>
        )}
      </button>
    );
  }
);
ColorSwatch.displayName = "ColorSwatch";

export interface PaletteColor {
  color: string;
  label?: ReactNode;
  id?: string;
}

export interface PaletteProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  colors: (PaletteColor | string)[];
  value?: string;
  onSelect?: (color: string, i: number) => void;
  size?: number | "sm" | "md" | "lg";
  showLabels?: boolean;
  columns?: number;
}

/**
 * Displays a palette (array of colours) with optional labels and
 * copy-on-click.
 */
export const Palette = forwardRef<HTMLDivElement, PaletteProps>(
  function Palette(
    {
      colors,
      value,
      onSelect,
      size = "md",
      showLabels = false,
      columns,
      className,
      style,
      ...props
    },
    ref
  ) {
    const normalized = colors.map((c, i) =>
      typeof c === "string" ? { color: c, id: `c-${i}` } : c
    );
    const gridStyle = {
      ...style,
      ...(columns
        ? { gridTemplateColumns: `repeat(${columns}, auto)` }
        : {}),
    };
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Color palette"
        className={cx("vf-palette", className)}
        style={gridStyle}
        {...props}
      >
        {normalized.map((c, i) => (
          <ColorSwatch
            key={c.id ?? `${c.color}-${i}`}
            color={c.color}
            label={c.label}
            size={size}
            showLabel={showLabels}
            selected={value === c.color}
            onSelect={onSelect ? () => onSelect(c.color, i) : undefined}
          />
        ))}
      </div>
    );
  }
);
Palette.displayName = "Palette";
