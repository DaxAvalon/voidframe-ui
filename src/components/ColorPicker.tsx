// Phase 7.4 — ColorPicker
//
// HSL sliders + hex input + optional preset swatches. Emits a hex string
// (#rrggbb) for easy persistence. Converts internally between HSL and hex.
//
// ARIA: sliders are native range inputs with labels; hex field is a text input.

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface ColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Hex color string like "#3366ff". */
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  label?: string;
  /** Preset hex swatches. */
  swatches?: string[];
  /** Show the alpha slider. Value becomes "#rrggbbaa" when alpha < 1. */
  allowAlpha?: boolean;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}

interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

// ── conversions ────────────────────────────────────────────────

export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } | null {
  const m = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(m)) {
    const [r, g, b] = [m[0]!, m[1]!, m[2]!].map((c) => parseInt(c + c, 16));
    return { r: r!, g: g!, b: b!, a: 1 };
  }
  if (/^[0-9a-f]{6}$/i.test(m)) {
    return {
      r: parseInt(m.slice(0, 2), 16),
      g: parseInt(m.slice(2, 4), 16),
      b: parseInt(m.slice(4, 6), 16),
      a: 1,
    };
  }
  if (/^[0-9a-f]{8}$/i.test(m)) {
    return {
      r: parseInt(m.slice(0, 2), 16),
      g: parseInt(m.slice(2, 4), 16),
      b: parseInt(m.slice(4, 6), 16),
      a: parseInt(m.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

export function rgbaToHex({
  r,
  g,
  b,
  a,
}: {
  r: number;
  g: number;
  b: number;
  a: number;
}): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const base = `#${h(r)}${h(g)}${h(b)}`;
  if (a < 1) return base + h(a * 255);
  return base;
}

export function rgbaToHsla({
  r,
  g,
  b,
  a,
}: {
  r: number;
  g: number;
  b: number;
  a: number;
}): HSLA {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      case bn:
        h = ((rn - gn) / d + 4) * 60;
        break;
    }
  }
  return { h, s: s * 100, l: l * 100, a };
}

export function hslaToRgba({ h, s, l, a }: HSLA): { r: number; g: number; b: number; a: number } {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (0 <= hh && hh < 1) [rn, gn, bn] = [c, x, 0];
  else if (1 <= hh && hh < 2) [rn, gn, bn] = [x, c, 0];
  else if (2 <= hh && hh < 3) [rn, gn, bn] = [0, c, x];
  else if (3 <= hh && hh < 4) [rn, gn, bn] = [0, x, c];
  else if (4 <= hh && hh < 5) [rn, gn, bn] = [x, 0, c];
  else if (5 <= hh && hh < 6) [rn, gn, bn] = [c, 0, x];
  const m = ln - c / 2;
  return {
    r: (rn + m) * 255,
    g: (gn + m) * 255,
    b: (bn + m) * 255,
    a,
  };
}

function hexToHsla(hex: string): HSLA | null {
  const rgba = hexToRgba(hex);
  return rgba ? rgbaToHsla(rgba) : null;
}

function hslaToHex(hsla: HSLA): string {
  return rgbaToHex(hslaToRgba(hsla));
}

// ── component ──────────────────────────────────────────────────

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    {
      value,
      defaultValue = "#000000",
      onChange,
      label,
      swatches,
      allowAlpha,
      disabled,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue,
      onChange,
      componentName: "ColorPicker",
    });

    const baseId = useId(id);
    const [hsla, setHsla] = useState<HSLA>(
      () => hexToHsla(current) ?? { h: 0, s: 0, l: 0, a: 1 }
    );
    const [hexDraft, setHexDraft] = useState<string>(current);
    // Track our own writes so the sync effect doesn't clobber the draft while
    // the user is typing in the hex field.
    const lastOwnWrite = useRef<string>(current);

    useEffect(() => {
      if (current === lastOwnWrite.current) return;
      const parsed = hexToHsla(current);
      if (parsed) {
        setHsla(parsed);
        setHexDraft(current);
        lastOwnWrite.current = current;
      }
    }, [current]);

    const push = useCallback(
      (next: HSLA) => {
        setHsla(next);
        const hex = hslaToHex(next);
        setHexDraft(hex);
        lastOwnWrite.current = hex;
        setCurrent(hex);
      },
      [setCurrent]
    );

    const onChannel = (key: keyof HSLA) => (e: ChangeEvent<HTMLInputElement>) =>
      push({ ...hsla, [key]: Number(e.target.value) });

    const onHexInput = (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setHexDraft(raw);
      const parsed = hexToHsla(raw);
      if (parsed) {
        setHsla(parsed);
        const canonical = hslaToHex(parsed);
        lastOwnWrite.current = canonical;
        setCurrent(canonical);
      }
    };

    return (
      <div
        ref={ref}
        className={cx("vf-color-picker", className)}
        style={style}
        {...props}
      >
        {label && <Label>{label}</Label>}
        <div className="vf-color-picker__row">
          <div
            className="vf-color-picker__swatch"
            aria-label={`Current color ${hexDraft}`}
            role="img"
            style={{ background: hexDraft }}
          />
          <input
            id={baseId}
            type="text"
            className="vf-input vf-color-picker__hex"
            value={hexDraft}
            onChange={onHexInput}
            aria-label="Hex color"
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
        <div className="vf-color-picker__sliders">
          <label className="vf-color-picker__slider">
            <span className="vf-color-picker__slider-label">Hue</span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={Math.round(hsla.h)}
              onChange={onChannel("h")}
              aria-label="Hue"
              disabled={disabled}
            />
            <span className="vf-color-picker__slider-value">{Math.round(hsla.h)}°</span>
          </label>
          <label className="vf-color-picker__slider">
            <span className="vf-color-picker__slider-label">Saturation</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(hsla.s)}
              onChange={onChannel("s")}
              aria-label="Saturation"
              disabled={disabled}
            />
            <span className="vf-color-picker__slider-value">{Math.round(hsla.s)}%</span>
          </label>
          <label className="vf-color-picker__slider">
            <span className="vf-color-picker__slider-label">Lightness</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(hsla.l)}
              onChange={onChannel("l")}
              aria-label="Lightness"
              disabled={disabled}
            />
            <span className="vf-color-picker__slider-value">{Math.round(hsla.l)}%</span>
          </label>
          {allowAlpha && (
            <label className="vf-color-picker__slider">
              <span className="vf-color-picker__slider-label">Alpha</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={hsla.a}
                onChange={onChannel("a")}
                aria-label="Alpha"
                disabled={disabled}
              />
              <span className="vf-color-picker__slider-value">{hsla.a.toFixed(2)}</span>
            </label>
          )}
        </div>
        {swatches && swatches.length > 0 && (
          <div
            role="group"
            aria-label="Color swatches"
            className="vf-color-picker__swatches"
          >
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                className="vf-color-picker__swatch-btn"
                aria-label={hex}
                style={{ background: hex }}
                disabled={disabled}
                onClick={() => {
                  const parsed = hexToHsla(hex);
                  if (parsed) push(parsed);
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
ColorPicker.displayName = "ColorPicker";
