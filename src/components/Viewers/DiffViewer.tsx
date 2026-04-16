"use client";

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";

// ── DiffViewer ───────────────────────────────────────────────

export interface DiffViewerProps extends HTMLAttributes<HTMLDivElement> {
  oldValue: string;
  newValue: string;
  variant?: "unified" | "split";
  language?: string;
  showLineNumbers?: boolean;
}

interface DiffOp {
  op: "equal" | "insert" | "delete";
  line: string;
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

export const DiffViewer = forwardRef<HTMLDivElement, DiffViewerProps>(
  function DiffViewer(
    {
      oldValue,
      newValue,
      variant = "unified",
      language,
      showLineNumbers = true,
      className,
      ...props
    },
    ref
  ) {
    const ops = useMemo(() => lineDiff(oldValue, newValue), [oldValue, newValue]);
    if (variant === "split") {
      const left: Array<{ text: string; type: "equal" | "delete" | "pad" }> = [];
      const right: Array<{ text: string; type: "equal" | "insert" | "pad" }> = [];
      for (const op of ops) {
        if (op.op === "equal") {
          left.push({ text: op.line, type: "equal" });
          right.push({ text: op.line, type: "equal" });
        } else if (op.op === "delete") {
          left.push({ text: op.line, type: "delete" });
          right.push({ text: "", type: "pad" });
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
                <span className="vf-diff__text">{ln.text || " "}</span>
              </div>
            ))}
          </div>
          <div className="vf-diff__col" aria-label="new">
            {right.map((ln, i) => (
              <div key={i} className={cx("vf-diff__line", `vf-diff__line--${ln.type}`)}>
                {showLineNumbers && (
                  <span className="vf-diff__num">{ln.type === "pad" ? "" : i + 1}</span>
                )}
                <span className="vf-diff__text">{ln.text || " "}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cx("vf-diff", "vf-diff--unified", className)}
        data-language={language}
        {...props}
      >
        {ops.map((op, i) => (
          <div key={i} className={cx("vf-diff__line", `vf-diff__line--${op.op}`)}>
            <span className="vf-diff__marker" aria-hidden="true">
              {op.op === "insert" ? "+" : op.op === "delete" ? "-" : " "}
            </span>
            <span className="vf-diff__text">{op.line || " "}</span>
          </div>
        ))}
      </div>
    );
  }
);
DiffViewer.displayName = "DiffViewer";
