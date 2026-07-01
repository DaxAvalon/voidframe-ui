"use client";

// Phase 13 — Encoding: QRCode + Barcode.
//
// Both components produce real, scannable output when the matching
// optional peer dependency is installed:
//
//   QRCode   → `qrcode-generator`
//   Barcode  → `jsbarcode`
//
// The peer is loaded lazily on first render via the shared `loadPeer`
// helper. Until it resolves (and forever if it's missing), the
// component renders a clearly-labelled PLACEHOLDER pattern so layouts
// are testable in Storybook-style previews without needing the peer
// installed. The placeholder is NOT scannable — do not ship it.
//
// Consumers can still provide a pre-computed `matrix` (QR) or `pattern`
// (Barcode) to bypass both the peer load and the placeholder entirely.

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { loadPeer, MissingPeerDependencyError } from "../charts/peer";

// ── QRCode ─────────────────────────────────────────────────

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

export interface QRCodeProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  size?: number;
  ecc?: QRErrorCorrection;
  /**
   * Provide a pre-computed NxN boolean matrix to bypass both the
   * peer-dep encoder and the placeholder. Takes precedence when set.
   */
  matrix?: boolean[][];
  /** Optional logo overlay (rendered centered, 20% size). */
  logo?: ReactNode;
}

/**
 * Renders a scannable QR code SVG from a string.
 *
 * Requires the optional peer dependency `qrcode-generator` to produce
 * real output. When the peer is missing OR still loading, the
 * component renders a clearly-labelled placeholder. Bypass both by
 * passing a pre-computed `matrix` prop.
 */
export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  {
    value,
    size = 160,
    ecc = "L",
    matrix,
    logo,
    className,
    style,
    ...props
  },
  ref
) {
  // QR codes MUST render dark-on-light regardless of app theme — inverting
  // would flip the scanner's read of the encoded bits. These are hardcoded.
  const foreground = "#000000";
  const background = "#ffffff";

  // Peer-loaded matrix state. Null means "not attempted yet or peer
  // missing" — use the placeholder path.
  const [computed, setComputed] = useState<boolean[][] | null>(null);
  const [peerMissing, setPeerMissing] = useState(false);

  useEffect(() => {
    if (matrix) return; // consumer-supplied, skip peer load
    let active = true;
    loadPeer("qrcode-generator", "<QRCode>", () => import("qrcode-generator"))
      .then((mod) => {
        if (!active) return;
        // qrcode-generator's default export is `qrcode(typeNumber, ecc)`.
        const qrcode = (mod as { default: unknown }).default as (
          typeNumber: number,
          errorCorrectionLevel: string
        ) => {
          addData(data: string): void;
          make(): void;
          getModuleCount(): number;
          isDark(row: number, col: number): boolean;
        };
        const qr = qrcode(0, ecc); // 0 = auto-detect best version
        qr.addData(value);
        qr.make();
        const n = qr.getModuleCount();
        const g: boolean[][] = [];
        for (let r = 0; r < n; r++) {
          const row: boolean[] = [];
          for (let c = 0; c < n; c++) row.push(qr.isDark(r, c));
          g.push(row);
        }
        setComputed(g);
        setPeerMissing(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof MissingPeerDependencyError) setPeerMissing(true);
        setComputed(null);
      });
    return () => {
      active = false;
    };
  }, [matrix, value, ecc]);

  const grid = useMemo(
    () => matrix ?? computed ?? placeholderMatrix(value, 25),
    [matrix, computed, value]
  );
  const isPlaceholder = !matrix && !computed;
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
      data-placeholder={isPlaceholder || undefined}
      className={cx("vf-qrcode", isPlaceholder && "vf-qrcode--placeholder", className)}
      style={composed}
      {...props}
    >
      {grid.flat().map((on, i) => (
        <span
          key={i}
          style={{ background: on ? foreground : background }}
        />
      ))}
      {isPlaceholder && (
        <div className="vf-qrcode__placeholder-label">
          {/* Static styling lives in specialty.css (optical tokens);
              only the size-derived font scales inline. */}
          <span style={{ fontSize: Math.max(9, Math.floor(size / 16)) }}>
            PLACEHOLDER
            <br />
            {peerMissing ? "install qrcode-generator" : "loading…"}
          </span>
        </div>
      )}
      {logo && !isPlaceholder && (
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
  // QR code. Only used when the peer is missing AND no matrix prop was
  // passed. The "PLACEHOLDER" overlay makes this visually unambiguous.
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

// jsbarcode accepts format strings in uppercase plus variants. This map
// normalises our canonical lowercase prop to what the peer expects.
const JSBARCODE_FORMATS: Record<Exclude<BarcodeFormat, "custom">, string> = {
  code128: "CODE128",
  code39: "CODE39",
  ean13: "EAN13",
  ean8: "EAN8",
  upc: "UPC",
  itf: "ITF",
};

export interface BarcodeProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  format?: BarcodeFormat;
  /** Height in px. */
  height?: number;
  /** Pixel width per "unit" bar. Default 2. */
  barWidth?: number;
  /**
   * Pre-computed binary bar pattern (1 = bar, 0 = gap). Bypasses both
   * the peer-dep encoder and the placeholder. Takes precedence when
   * set.
   */
  pattern?: number[];
  showText?: boolean;
}

/**
 * Renders a scannable 1D barcode from a value.
 *
 * Requires the optional peer dependency `jsbarcode` to produce real
 * output. When the peer is missing OR still loading, the component
 * renders a clearly-labelled placeholder pattern. Bypass both by
 * passing a pre-computed `pattern` prop (1 = bar, 0 = gap).
 */
export const Barcode = forwardRef<HTMLDivElement, BarcodeProps>(function Barcode(
  {
    value,
    format = "code128",
    height = 56,
    barWidth = 2,
    pattern,
    showText = true,
    className,
    style,
    ...props
  },
  ref
) {
  // Barcodes MUST render dark bars on a light background — optical scanners
  // read reflectance, not color; inverting would make the scanner see the
  // gaps as bars and vice-versa.
  const foreground = "#000000";
  const background = "#ffffff";

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [peerRendered, setPeerRendered] = useState(false);
  const [peerMissing, setPeerMissing] = useState(false);

  useEffect(() => {
    if (pattern) return; // consumer-supplied, skip peer load
    if (format === "custom") return; // no jsbarcode format mapping; placeholder path
    const svgEl = svgRef.current;
    if (!svgEl) return;
    let active = true;
    loadPeer("jsbarcode", "<Barcode>", () => import("jsbarcode"))
      .then((mod) => {
        if (!active || !svgRef.current) return;
        const JsBarcode = (mod as { default: unknown }).default as (
          element: SVGSVGElement,
          data: string,
          options?: Record<string, unknown>
        ) => void;
        try {
          JsBarcode(svgRef.current, value, {
            format: JSBARCODE_FORMATS[format],
            height,
            width: barWidth,
            displayValue: showText,
            background,
            lineColor: foreground,
            margin: 0,
          });
          setPeerRendered(true);
          setPeerMissing(false);
        } catch {
          // jsbarcode throws on invalid value-for-format (e.g. EAN13
          // requires 12-13 digits). Fall back to placeholder pattern.
          setPeerRendered(false);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof MissingPeerDependencyError) setPeerMissing(true);
        setPeerRendered(false);
      });
    return () => {
      active = false;
    };
  }, [pattern, value, format, height, barWidth, showText]);

  // If peer rendered, the svg IS the barcode — no fallback overlay.
  // Otherwise: render fallback placeholder + label.
  const bars = useMemo(
    () => pattern ?? placeholderBars(value),
    [pattern, value]
  );
  const total = bars.length * barWidth;
  const isPlaceholder = !pattern && !peerRendered;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Barcode (${format}) encoding ${value}`}
      data-format={format}
      data-placeholder={isPlaceholder || undefined}
      className={cx("vf-barcode", isPlaceholder && "vf-barcode--placeholder", className)}
      style={{
        background,
        display: "inline-flex",
        flexDirection: "column",
        position: "relative",
        ...style,
      }}
      {...props}
    >
      {/* jsbarcode target — always rendered so the ref is stable, but
          hidden when falling back to placeholder. */}
      <svg
        ref={svgRef}
        aria-hidden="true"
        style={{ display: peerRendered && !pattern ? "block" : "none" }}
      />
      {!peerRendered || pattern ? (
        <>
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
          {showText && <span className="vf-barcode__text">{value}</span>}
          {isPlaceholder && (
            <div className="vf-barcode__placeholder-label">
              PLACEHOLDER
              <br />
              {peerMissing ? "install jsbarcode" : "loading…"}
            </div>
          )}
        </>
      ) : null}
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
