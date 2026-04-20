"use client";

import { forwardRef, memo, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface ColorContrastProps extends HTMLAttributes<HTMLDivElement> {
  foreground: string;
  background: string;
  onForegroundChange?: (color: string) => void;
  onBackgroundChange?: (color: string) => void;
  editable?: boolean;
  showPreview?: boolean;
  showDetails?: boolean;
  previewText?: string;
  size?: "sm" | "md";
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const [R, G, B] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * R! + 0.7152 * G! + 0.0722 * B!;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface Criterion {
  label: string;
  threshold: number;
}

const CRITERIA: Criterion[] = [
  { label: "AA Normal", threshold: 4.5 },
  { label: "AA Large", threshold: 3 },
  { label: "AAA Normal", threshold: 7 },
  { label: "AAA Large", threshold: 4.5 },
];

const ColorContrastImpl = forwardRef<HTMLDivElement, ColorContrastProps>(
  function ColorContrast(
    {
      foreground,
      background,
      onForegroundChange,
      onBackgroundChange,
      editable = false,
      showPreview = true,
      showDetails = true,
      previewText = "Sample Text",
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const ratio = contrastRatio(foreground, background);
    const passes = ratio >= 4.5;

    const handleSwap = () => {
      onForegroundChange?.(background);
      onBackgroundChange?.(foreground);
    };

    return (
      <div
        ref={ref}
        className={cx(
          "vf-color-contrast",
          `vf-color-contrast--${size}`,
          className
        )}
        style={style}
        {...props}
      >
        <div className="vf-color-contrast__swatches">
          <div className="vf-color-contrast__swatch">
            <span
              role="img"
              className="vf-color-contrast__swatch-label"
              style={{ backgroundColor: foreground }}
              aria-label={`Foreground: ${foreground}`}
            />
            {editable && (
              <input
                type="color"
                value={foreground}
                onChange={(e) => onForegroundChange?.(e.target.value)}
                aria-label="Foreground color"
              />
            )}
            <span>Foreground</span>
          </div>

          <button
            type="button"
            className="vf-color-contrast__swap"
            aria-label="Swap colors"
            onClick={handleSwap}
          >
            &#x21C4;
          </button>

          <div className="vf-color-contrast__swatch">
            <span
              role="img"
              className="vf-color-contrast__swatch-label"
              style={{ backgroundColor: background }}
              aria-label={`Background: ${background}`}
            />
            {editable && (
              <input
                type="color"
                value={background}
                onChange={(e) => onBackgroundChange?.(e.target.value)}
                aria-label="Background color"
              />
            )}
            <span>Background</span>
          </div>
        </div>

        <div
          className={cx(
            "vf-color-contrast__ratio",
            passes
              ? "vf-color-contrast__ratio--pass"
              : "vf-color-contrast__ratio--fail"
          )}
        >
          {ratio.toFixed(2)}:1
        </div>

        {showDetails && (
          <div className="vf-color-contrast__details">
            {CRITERIA.map((c) => {
              const met = ratio >= c.threshold;
              return (
                <div
                  key={c.label}
                  className={cx(
                    "vf-color-contrast__criterion",
                    met
                      ? "vf-color-contrast__criterion--pass"
                      : "vf-color-contrast__criterion--fail"
                  )}
                >
                  <span>{met ? "\u2713" : "\u2717"}</span>
                  <span>{c.label}</span>
                  <span>{c.threshold}:1</span>
                </div>
              );
            })}
          </div>
        )}

        {showPreview && (
          <div
            className="vf-color-contrast__preview"
            style={{ color: foreground, backgroundColor: background }}
          >
            {previewText}
          </div>
        )}
      </div>
    );
  }
);
ColorContrastImpl.displayName = "ColorContrast";
/**
 * WCAG contrast checker. Enter a foreground + background colour and it
 * reports the ratio plus AA / AAA pass/fail for normal and large text.
 */
export const ColorContrast = memo(ColorContrastImpl);
(ColorContrast as unknown as { displayName: string }).displayName =
  "ColorContrast";
