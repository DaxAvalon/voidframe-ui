"use client";

import { forwardRef, memo, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface CSVViewerProps extends HTMLAttributes<HTMLDivElement> {
  data: string | string[][];
  delimiter?: string;
  hasHeader?: boolean;
  maxRows?: number;
  highlightRow?: number;
  highlightColumn?: number;
  onCellClick?: (row: number, col: number, value: string) => void;
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
  showRowNumbers?: boolean;
  showStats?: boolean;
  size?: "sm" | "md";
}

/** Parse CSV with support for quoted fields containing delimiters and newlines. */
export function parseCSV(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i]!;

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === delimiter) {
        current.push(field);
        field = "";
        i++;
      } else if (ch === "\r") {
        // Handle \r\n or \r
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
        i++;
        if (i < text.length && text[i] === "\n") i++;
      } else if (ch === "\n") {
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Push remaining
  if (field || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

function isNumeric(value: string): boolean {
  if (!value.trim()) return false;
  return !isNaN(Number(value)) && value.trim() !== "";
}

function generateHeaders(count: number): string[] {
  const headers: string[] = [];
  for (let i = 0; i < count; i++) {
    let label = "";
    let n = i;
    do {
      label = String.fromCharCode(65 + (n % 26)) + label;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    headers.push(label);
  }
  return headers;
}

const CSVViewerImpl = forwardRef<HTMLDivElement, CSVViewerProps>(
  function CSVViewer(
    {
      data,
      delimiter = ",",
      hasHeader = true,
      maxRows,
      highlightRow,
      highlightColumn,
      onCellClick,
      stickyHeader = false,
      striped = false,
      compact = false,
      showRowNumbers = true,
      showStats = false,
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const parsed = useMemo(() => {
      if (typeof data === "string") return parseCSV(data, delimiter);
      return data;
    }, [data, delimiter]);

    const headers = useMemo(() => {
      if (hasHeader && parsed.length > 0) return parsed[0]!;
      const maxCols = parsed.reduce((m, r) => Math.max(m, r.length), 0);
      return generateHeaders(maxCols);
    }, [parsed, hasHeader]);

    const bodyRows = useMemo(() => {
      const start = hasHeader ? 1 : 0;
      const allRows = parsed.slice(start);
      if (maxRows !== undefined) return allRows.slice(0, maxRows);
      return allRows;
    }, [parsed, hasHeader, maxRows]);

    const totalRows = bodyRows.length;
    const totalCols = headers.length;

    return (
      <div
        ref={ref}
        className={cx(
          "vf-csv-viewer",
          `vf-csv-viewer--${size}`,
          compact && "vf-csv-viewer--compact",
          className
        )}
        style={style}
        {...props}
      >
        <table className="vf-csv-viewer__table" role="table">
          <thead
            className={cx(
              "vf-csv-viewer__header",
              stickyHeader && "vf-csv-viewer__header--sticky"
            )}
          >
            <tr>
              {showRowNumbers && (
                <th className="vf-csv-viewer__row-number" scope="col">
                  #
                </th>
              )}
              {headers.map((h, ci) => (
                <th
                  key={ci}
                  className={cx(
                    "vf-csv-viewer__header-cell",
                    highlightColumn === ci &&
                      "vf-csv-viewer__cell--highlighted"
                  )}
                  scope="col"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="vf-csv-viewer__body">
            {bodyRows.map((row, ri) => (
              <tr
                key={ri}
                className={cx(
                  "vf-csv-viewer__row",
                  striped && ri % 2 === 1 && "vf-csv-viewer__row--striped",
                  highlightRow === ri && "vf-csv-viewer__row--highlighted"
                )}
              >
                {showRowNumbers && (
                  <td className="vf-csv-viewer__row-number">{ri + 1}</td>
                )}
                {headers.map((_, ci) => {
                  const value = row[ci] ?? "";
                  const numeric = isNumeric(value);
                  return (
                    <td
                      key={ci}
                      className={cx(
                        "vf-csv-viewer__cell",
                        numeric && "vf-csv-viewer__cell--number",
                        highlightColumn === ci &&
                          "vf-csv-viewer__cell--highlighted"
                      )}
                      onClick={() => onCellClick?.(ri, ci, value)}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {showStats && (
          <div className="vf-csv-viewer__footer">
            {totalRows} rows, {totalCols} columns
          </div>
        )}
      </div>
    );
  }
);
CSVViewerImpl.displayName = "CSVViewer";
export const CSVViewer = memo(CSVViewerImpl);
(CSVViewer as unknown as { displayName: string }).displayName = "CSVViewer";
