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
}

interface DiffOp {
  op: "equal" | "insert" | "delete";
  line: string;
}

interface WordSpan {
  text: string;
  type: "equal" | "added" | "removed";
}

/** Word-level diff for a changed line pair using LCS on words. */
function wordDiff(oldLine: string, newLine: string): { oldSpans: WordSpan[]; newSpans: WordSpan[] } {
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
function lineDiff(oldText: string, newText: string): DiffOp[] {
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

    if (kind === "split") {
      type LeftRow = { text: string; type: "equal" | "delete" | "pad"; spans?: WordSpan[] };
      type RightRow = { text: string; type: "equal" | "insert" | "pad"; spans?: WordSpan[] };
      const left: LeftRow[] = [];
      const right: RightRow[] = [];
      for (let idx = 0; idx < ops.length; idx++) {
        const op = ops[idx]!;
        if (op.op === "equal") {
          left.push({ text: op.line, type: "equal" });
          right.push({ text: op.line, type: "equal" });
        } else if (op.op === "delete") {
          const wd = wordDiffs.get(idx);
          if (wd) {
            left.push({ text: op.line, type: "delete", spans: wd.oldSpans });
            right.push({ text: ops[idx + 1]!.line, type: "insert", spans: wd.newSpans });
            idx++; // skip the paired insert
          } else {
            left.push({ text: op.line, type: "delete" });
            right.push({ text: "", type: "pad" });
          }
        } else {
          left.push({ text: "", type: "pad" });
          right.push({ text: op.line, type: "insert" });
        }
      }
      return (
        <div
          ref={ref}
          className={cx("vf-diff", "vf-diff--split", className)}
          data-language={language}
          {...props}
        >
          <div className="vf-diff__col" aria-label="old">
            {left.map((ln, i) => (
              <div key={i} className={cx("vf-diff__line", `vf-diff__line--${ln.type}`)}>
                {showLineNumbers && (
                  <span className="vf-diff__num">{ln.type === "pad" ? "" : i + 1}</span>
                )}
                <span className="vf-diff__text">{ln.spans ? renderWordSpans(ln.spans) : (ln.text || " ")}</span>
              </div>
            ))}
          </div>
          <div className="vf-diff__col" aria-label="new">
            {right.map((ln, i) => (
              <div key={i} className={cx("vf-diff__line", `vf-diff__line--${ln.type}`)}>
                {showLineNumbers && (
                  <span className="vf-diff__num">{ln.type === "pad" ? "" : i + 1}</span>
                )}
                <span className="vf-diff__text">{ln.spans ? renderWordSpans(ln.spans) : (ln.text || " ")}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Unified view with word-level highlighting.
    const unifiedRows: React.ReactNode[] = [];
    for (let idx = 0; idx < ops.length; idx++) {
      const op = ops[idx]!;
      const wd = wordDiffs.get(idx);
      if (wd) {
        // Render paired delete/insert with word spans.
        unifiedRows.push(
          <div key={`${idx}-del`} className={cx("vf-diff__line", "vf-diff__line--delete")}>
            <span className="vf-diff__marker" aria-hidden="true">-</span>
            <span className="vf-diff__text">{renderWordSpans(wd.oldSpans)}</span>
          </div>
        );
        unifiedRows.push(
          <div key={`${idx}-ins`} className={cx("vf-diff__line", "vf-diff__line--insert")}>
            <span className="vf-diff__marker" aria-hidden="true">+</span>
            <span className="vf-diff__text">{renderWordSpans(wd.newSpans)}</span>
          </div>
        );
        idx++; // skip paired insert
      } else {
        unifiedRows.push(
          <div key={idx} className={cx("vf-diff__line", `vf-diff__line--${op.op}`)}>
            <span className="vf-diff__marker" aria-hidden="true">
              {op.op === "insert" ? "+" : op.op === "delete" ? "-" : " "}
            </span>
            <span className="vf-diff__text">{op.line || " "}</span>
          </div>
        );
      }
    }

    return (
      <div
        ref={ref}
        className={cx("vf-diff", "vf-diff--unified", className)}
        data-language={language}
        {...props}
      >
        {unifiedRows}
      </div>
    );
  }
);
DiffViewer.displayName = "DiffViewer";
