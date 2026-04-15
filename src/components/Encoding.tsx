// Phase 13 — Encoding: QRCode + Barcode.
//
// Both components support a "renderMatrix" / "renderBars" escape hatch
// that accepts pre-computed binary output. For real QR or barcode
// encoding you bring your own peer dep (e.g. `qrcode-generator`,
// `jsbarcode`) and pipe its output in. When no matrix is provided, the
// components render a deterministic placeholder pattern derived from
// the `value` so layouts are still testable and visible in the demo.

import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

export interface QRCodeProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  size?: number;
  ecc?: QRErrorCorrection;
  /** Provide a NxN boolean matrix. Takes precedence over placeholder. */
  matrix?: boolean[][];
  /** Optional logo overlay (rendered centered, 20% size). */
  logo?: ReactNode;
  foreground?: string;
  background?: string;
}

export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  {
    value,
    size = 160,
    ecc = "L",
    matrix,
    logo,
    foreground = "var(--vf-text-0)",
    background = "var(--vf-bg-0)",
    className,
    style,
    ...props
  },
  ref
) {
  const grid = useMemo(
    () => matrix ?? placeholderMatrix(value, 25),
    [matrix, value]
  );
  const dim = grid.length;
  const cell = Math.max(2, Math.floor(size / dim));
  const total = cell * dim;
  const composed: CSSProperties = {
    width: total,
    height: total,
    background,
    display: "inline-grid",
    gridTemplateColumns: `repeat(${dim}, ${cell}px)`,
    gridTemplateRows: `repeat(${dim}, ${cell}px)`,
    position: "relative",
    ...style,
  };
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`QR code encoding ${value}`}
      data-ecc={ecc}
      className={cx("vf-qrcode", className)}
      style={composed}
      {...props}
    >
      {grid.flat().map((on, i) => (
        <span
          key={i}
          style={{ background: on ? foreground : background }}
        />
      ))}
      {logo && (
        <div
          className="vf-qrcode__logo"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background,
            padding: 4,
          }}
        >
          {logo}
        </div>
      )}
    </div>
  );
});
QRCode.displayName = "QRCode";

function placeholderMatrix(input: string, size: number): boolean[][] {
  // Fast hash → deterministic pseudo-QR for layout/preview. NOT a valid
  // QR code.
  let seed = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    seed ^= input.charCodeAt(i);
    seed = (seed * 0x01000193) >>> 0;
  }
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };
  const g: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(rand() > 0.5);
    }
    g.push(row);
  }
  // Finder squares to make it look like a QR.
  const stamp = (ox: number, oy: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const rr = oy + r;
        const cc = ox + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        g[rr]![cc] = edge || inner;
      }
    }
  };
  stamp(0, 0);
  stamp(size - 7, 0);
  stamp(0, size - 7);
  return g;
}

// ── Barcode ─────────────────────────────────────────────────

export type BarcodeFormat =
  | "code128"
  | "code39"
  | "ean13"
  | "ean8"
  | "upc"
  | "itf"
  | "custom";

export interface BarcodeProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  format?: BarcodeFormat;
  /** Height in px. */
  height?: number;
  /** Pixel width per "unit" bar. Default 2. */
  barWidth?: number;
  /**
   * Pre-computed binary bar pattern (1 = bar, 0 = gap). When omitted, a
   * deterministic placeholder pattern derived from `value` is used.
   */
  pattern?: number[];
  showText?: boolean;
  foreground?: string;
  background?: string;
}

export const Barcode = forwardRef<HTMLDivElement, BarcodeProps>(function Barcode(
  {
    value,
    format = "code128",
    height = 56,
    barWidth = 2,
    pattern,
    showText = true,
    foreground = "var(--vf-text-0)",
    background = "var(--vf-bg-0)",
    className,
    style,
    ...props
  },
  ref
) {
  const bars = useMemo(() => pattern ?? placeholderBars(value), [pattern, value]);
  const total = bars.length * barWidth;
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Barcode (${format}) encoding ${value}`}
      data-format={format}
      className={cx("vf-barcode", className)}
      style={{ background, display: "inline-flex", flexDirection: "column", ...style }}
      {...props}
    >
      <div
        style={{
          display: "flex",
          width: total,
          height,
          background,
        }}
      >
        {bars.map((bit, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: barWidth,
              height: "100%",
              background: bit ? foreground : background,
            }}
          />
        ))}
      </div>
      {showText && (
        <span className="vf-barcode__text">{value}</span>
      )}
    </div>
  );
});
Barcode.displayName = "Barcode";

function placeholderBars(input: string): number[] {
  const pattern: number[] = [1, 0, 1, 0, 0, 1, 1, 0, 1]; // fake "start"
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    for (let b = 0; b < 8; b++) {
      pattern.push((code >> b) & 1);
    }
    pattern.push(0);
  }
  pattern.push(1, 1, 0, 1, 0, 1, 1); // fake "stop"
  return pattern;
}
