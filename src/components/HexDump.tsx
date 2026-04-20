"use client";

import { forwardRef, memo, useCallback, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface HexHighlight {
  start: number;
  end: number;
  color?: string;
  label?: string;
}

export interface HexDumpProps extends HTMLAttributes<HTMLDivElement> {
  data: Uint8Array | number[];
  bytesPerRow?: number;
  showOffset?: boolean;
  showAscii?: boolean;
  offsetBase?: "hex" | "decimal";
  highlightRanges?: HexHighlight[];
  onByteClick?: (offset: number) => void;
  onByteHover?: (offset: number | null) => void;
  selectedRange?: [number, number];
  groupSize?: 1 | 2 | 4 | 8;
  size?: "sm" | "md";
}

function isPrintable(byte: number): boolean {
  return byte >= 32 && byte <= 126;
}

function toHex(n: number, pad: number): string {
  return n.toString(16).toUpperCase().padStart(pad, "0");
}

const HexDumpImpl = forwardRef<HTMLDivElement, HexDumpProps>(function HexDump(
  {
    data,
    bytesPerRow = 16,
    showOffset = true,
    showAscii = true,
    offsetBase = "hex",
    highlightRanges = [],
    onByteClick,
    onByteHover,
    selectedRange,
    groupSize = 1,
    size = "md",
    className,
    style,
    ...props
  },
  ref
) {
  const [hoveredOffset, setHoveredOffset] = useState<number | null>(null);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const totalRows = Math.ceil(bytes.length / bytesPerRow);
  const offsetPad = offsetBase === "hex" ? Math.max(4, bytes.length.toString(16).length) : String(bytes.length).length;

  const getHighlight = useCallback(
    (offset: number): HexHighlight | undefined => {
      return highlightRanges.find((r) => offset >= r.start && offset < r.end);
    },
    [highlightRanges]
  );

  const isSelected = useCallback(
    (offset: number): boolean => {
      if (!selectedRange) return false;
      return offset >= selectedRange[0] && offset <= selectedRange[1];
    },
    [selectedRange]
  );

  const handleByteHover = useCallback(
    (offset: number | null) => {
      setHoveredOffset(offset);
      onByteHover?.(offset);
    },
    [onByteHover]
  );

  const rows: React.ReactNode[] = [];
  for (let row = 0; row < totalRows; row++) {
    const rowStart = row * bytesPerRow;
    const rowBytes: React.ReactNode[] = [];
    const asciiChars: React.ReactNode[] = [];

    for (let col = 0; col < bytesPerRow; col++) {
      const offset = rowStart + col;
      if (offset >= bytes.length) {
        rowBytes.push(
          <span key={`empty-${col}`} className="vf-hex-dump__byte">
            {"  "}
          </span>
        );
        if (showAscii) {
          asciiChars.push(
            <span key={`aempty-${col}`} className="vf-hex-dump__char">
              {" "}
            </span>
          );
        }
        continue;
      }

      const byte = bytes[offset]!;
      const highlight = getHighlight(offset);
      const selected = isSelected(offset);
      const hovered = hoveredOffset === offset;

      const byteClass = cx(
        "vf-hex-dump__byte",
        highlight && "vf-hex-dump__byte--highlighted",
        selected && "vf-hex-dump__byte--selected",
        hovered && "vf-hex-dump__byte--hovered"
      );

      const byteStyle = highlight?.color
        ? ({ "--vf-hex-highlight": highlight.color } as React.CSSProperties)
        : undefined;

      // Insert group separator
      const needsSep = groupSize > 1 && col > 0 && col % groupSize === 0;

      rowBytes.push(
        <span key={`sep-${col}`}>
          {needsSep && <span className="vf-hex-dump__group-sep"> </span>}
          <span
            className={byteClass}
            style={byteStyle}
            data-offset={offset}
            title={highlight?.label}
            onClick={() => onByteClick?.(offset)}
            onMouseEnter={() => handleByteHover(offset)}
            onMouseLeave={() => handleByteHover(null)}
          >
            {toHex(byte, 2)}
          </span>
        </span>
      );

      if (showAscii) {
        const printable = isPrintable(byte);
        asciiChars.push(
          <span
            key={`a-${col}`}
            className={cx(
              "vf-hex-dump__char",
              !printable && "vf-hex-dump__char--nonprintable",
              highlight && "vf-hex-dump__byte--highlighted",
              selected && "vf-hex-dump__byte--selected",
              hovered && "vf-hex-dump__byte--hovered"
            )}
            style={byteStyle}
            data-offset={offset}
            onClick={() => onByteClick?.(offset)}
            onMouseEnter={() => handleByteHover(offset)}
            onMouseLeave={() => handleByteHover(null)}
          >
            {printable ? String.fromCharCode(byte) : "."}
          </span>
        );
      }
    }

    const offsetStr =
      offsetBase === "hex"
        ? toHex(rowStart, offsetPad)
        : String(rowStart).padStart(offsetPad, "0");

    rows.push(
      <div key={row} className="vf-hex-dump__row" data-row={row}>
        {showOffset && (
          <span className="vf-hex-dump__offset">{offsetStr}</span>
        )}
        <span className="vf-hex-dump__hex">{rowBytes}</span>
        {showAscii && (
          <span className="vf-hex-dump__ascii">{asciiChars}</span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cx("vf-hex-dump", `vf-hex-dump--${size}`, className)}
      style={style}
      role="region"
      aria-label="Hex dump"
      {...props}
    >
      <div className="vf-hex-dump__header">
        {showOffset && <span className="vf-hex-dump__offset">Offset</span>}
        <span className="vf-hex-dump__hex">Hex</span>
        {showAscii && <span className="vf-hex-dump__ascii">ASCII</span>}
      </div>
      {rows}
    </div>
  );
});
HexDumpImpl.displayName = "HexDump";
/**
 * Monospace hex+ASCII viewer for a buffer. Configurable bytes-per-row and
 * offset display.
 */
export const HexDump = memo(HexDumpImpl);
(HexDump as unknown as { displayName: string }).displayName = "HexDump";
