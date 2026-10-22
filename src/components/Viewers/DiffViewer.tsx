"use client";

import React, {
  forwardRef,
  useMemo,
  type HTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";

// ── DiffViewer ───────────────────────────────────────────────

export interface DiffViewerProps extends HTMLAttributes<HTMLDivElement> {
  oldValue: string;
  newValue: string;
  kind?: "unified" | "split";
  language?: string;
  showLineNumbers?: boolean;
  /**
   * Wrap long lines instead of scrolling horizontally. In split mode both
   * sides of a row are siblings in one grid, so a wrapped line on one side
   * stretches the other side's cell and the rows stay aligned.
   */
  wrap?: boolean;
  /** Column titles for split mode (e.g. "Before" / "After"). */
  oldTitle?: React.ReactNode;
  newTitle?: React.ReactNode;
  /** Type size. `sm` is the dense default; `md` for review panes. */
  size?: "sm" | "md";
}

export interface DiffOp {
  op: "equal" | "insert" | "delete";
  line: string;
}

export interface WordSpan {
  text: string;
  type: "equal" | "added" | "removed";
}

/** Word-level diff for a changed line pair using LCS on words. */
/** Word-level diff of a changed line pair. Pure. */
export function wordDiff(oldLine: string, newLine: string): { oldSpans: WordSpan[]; newSpans: WordSpan[] } {
  const a = oldLine.split(/(\s+)/);
  const b = newLine.split(/(\s+)/);
  const m = a.length;
  const n = b.length;
  // LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i]![j] = (dp[i + 1]?.[j + 1] ?? 0) + 1;
      else dp[i]![j] = Math.max(dp[i + 1]?.[j] ?? 0, dp[i]?.[j + 1] ?? 0);
    }
  }
  const oldSpans: WordSpan[] = [];
  const newSpans: WordSpan[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      oldSpans.push({ text: a[i]!, type: "equal" });
      newSpans.push({ text: b[j]!, type: "equal" });
      i++; j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      oldSpans.push({ text: a[i]!, type: "removed" });
      i++;
    } else {
      newSpans.push({ text: b[j]!, type: "added" });
      j++;
    }
  }
  while (i < m) oldSpans.push({ text: a[i++]!, type: "removed" });
  while (j < n) newSpans.push({ text: b[j++]!, type: "added" });
  return { oldSpans, newSpans };
}

function renderWordSpans(spans: WordSpan[]): React.ReactNode {
  return spans.map((s, i) => {
    if (s.type === "added") return <span key={i} className="vf-diff__word--added">{s.text}</span>;
    if (s.type === "removed") return <span key={i} className="vf-diff__word--removed">{s.text}</span>;
    return <span key={i}>{s.text}</span>;
  });
}

// Tiny line-based diff (LCS). Good enough for modest inputs.
/**
 * Line-level diff (LCS) of two texts. Pure; exported so consumers can build
 * their own views or tests on the same algorithm the viewer uses.
 */
export function lineDiff(oldText: string, newText: string): DiffOp[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i]![j] = (dp[i + 1]?.[j + 1] ?? 0) + 1;
      else dp[i]![j] = Math.max(dp[i + 1]?.[j] ?? 0, dp[i]?.[j + 1] ?? 0);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({ op: "equal", line: a[i]! });
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      ops.push({ op: "delete", line: a[i]! });
      i++;
    } else {
      ops.push({ op: "insert", line: b[j]! });
      j++;
    }
  }
  while (i < m) {
    ops.push({ op: "delete", line: a[i++]! });
  }
  while (j < n) {
    ops.push({ op: "insert", line: b[j++]! });
  }
  return ops;
}

/**
 * Unified / side-by-side text diff view with line numbers and hunk
 * navigation. Feed `before` + `after` strings.
 */
export const DiffViewer = forwardRef<HTMLDivElement, DiffViewerProps>(
  function DiffViewer(
    {
      oldValue,
      newValue,
      kind = "unified",
      language,
      showLineNumbers = true,
      wrap = false,
      oldTitle,
      newTitle,
      size = "sm",
      className,
      ...props
    },
    ref
  ) {
    const ops = useMemo(() => lineDiff(oldValue, newValue), [oldValue, newValue]);

    // Pre-compute word diffs for adjacent delete/insert pairs.
    const wordDiffs = useMemo(() => {
      const map = new Map<number, { oldSpans: WordSpan[]; newSpans: WordSpan[] }>();
      for (let i = 0; i < ops.length - 1; i++) {
        if (ops[i]!.op === "delete" && ops[i + 1]!.op === "insert") {
          map.set(i, wordDiff(ops[i]!.line, ops[i + 1]!.line));
        }
      }
      return map;
    }, [ops]);

    const rootClass = (mode: string) =>
      cx(
        "vf-diff",
        `vf-diff--${mode}`,
        size === "md" && "vf-diff--md",
        wrap && "vf-diff--wrap",
        className
      );

    if (kind === "split") {
      // Per-side line numbers: pad rows consume no number on their side.
      type Side = {
        text: string;
        type: "equal" | "delete" | "insert" | "pad";
        num: number | null;
        spans?: WordSpan[];
      };
      const rows: Array<{ left: Side; right: Side }> = [];
      let oldLine = 0;
      let newLine = 0;
      for (let idx = 0; idx < ops.length; idx++) {
        const op = ops[idx]!;
        if (op.op === "equal") {
          oldLine++;
          newLine++;
          rows.push({
            left: { text: op.line, type: "equal", num: oldLine },
            right: { text: op.line, type: "equal", num: newLine },
          });
        } else if (op.op === "delete") {
          const wd = wordDiffs.get(idx);
          oldLine++;
          if (wd) {
            newLine++;
            rows.push({
              left: { text: op.line, type: "delete", num: oldLine, spans: wd.oldSpans },
              right: {
                text: ops[idx + 1]!.line,
                type: "insert",
                num: newLine,
                spans: wd.newSpans,
              },
            });
            idx++; // skip the paired insert
          } else {
            rows.push({
              left: { text: op.line, type: "delete", num: oldLine },
              right: { text: "", type: "pad", num: null },
            });
          }
        } else {
          newLine++;
          rows.push({
            left: { text: "", type: "pad", num: null },
            right: { text: op.line, type: "insert", num: newLine },
          });
        }
      }
      const cell = (side: Side, which: "old" | "new") => (
        <div
          className={cx("vf-diff__line", `vf-diff__line--${side.type}`)}
          data-side={which}
        >
          {showLineNumbers && (
            <span className="vf-diff__num">{side.num ?? ""}</span>
          )}
          <span className="vf-diff__text">
            {side.spans ? renderWordSpans(side.spans) : side.text || " "}
          </span>
        </div>
      );
      const hasTitles = oldTitle !== undefined || newTitle !== undefined;
      return (
        <div ref={ref} className={rootClass("split")} data-language={language} {...props}>
          {hasTitles && (
            <div className="vf-diff__row vf-diff__row--titles">
              <div className="vf-diff__title">{oldTitle}</div>
              <div className="vf-diff__title">{newTitle}</div>
            </div>
          )}
          {rows.map((row, i) => (
            <div key={i} className="vf-diff__row">
              {cell(row.left, "old")}
              {cell(row.right, "new")}
            </div>
          ))}
        </div>
      );
    }

    // Unified view with word-level highlighting.
    const unifiedRows: React.ReactNode[] = [];
    let oldN = 0;
    let newN = 0;
    const nums = (o: number | null, n: number | null) =>
      showLineNumbers ? (
        <>
          <span className="vf-diff__num">{o ?? ""}</span>
          <span className="vf-diff__num">{n ?? ""}</span>
        </>
      ) : null;
    for (let idx = 0; idx < ops.length; idx++) {
      const op = ops[idx]!;
      const wd = wordDiffs.get(idx);
      if (wd) {
        // Render paired delete/insert with word spans.
        oldN++;
        unifiedRows.push(
          <div key={`${idx}-del`} className={cx("vf-diff__line", "vf-diff__line--delete")}>
            {nums(oldN, null)}
            <span className="vf-diff__marker" aria-hidden="true">-</span>
            <span className="vf-diff__text">{renderWordSpans(wd.oldSpans)}</span>
          </div>
        );
        newN++;
        unifiedRows.push(
          <div key={`${idx}-ins`} className={cx("vf-diff__line", "vf-diff__line--insert")}>
            {nums(null, newN)}
            <span className="vf-diff__marker" aria-hidden="true">+</span>
            <span className="vf-diff__text">{renderWordSpans(wd.newSpans)}</span>
          </div>
        );
        idx++; // skip paired insert
      } else {
        if (op.op !== "insert") oldN++;
        if (op.op !== "delete") newN++;
        unifiedRows.push(
          <div key={idx} className={cx("vf-diff__line", `vf-diff__line--${op.op}`)}>
            {nums(op.op === "insert" ? null : oldN, op.op === "delete" ? null : newN)}
            <span className="vf-diff__marker" aria-hidden="true">
              {op.op === "insert" ? "+" : op.op === "delete" ? "-" : " "}
            </span>
            <span className="vf-diff__text">{op.line || " "}</span>
          </div>
        );
      }
    }

    return (
      <div ref={ref} className={rootClass("unified")} data-language={language} {...props}>
        {unifiedRows}
      </div>
    );
  }
);
DiffViewer.displayName = "DiffViewer";
