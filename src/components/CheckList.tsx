"use client";

// CheckList — rows of Verdict + sentence + optional action, with a derived
// "can proceed" and an n/m progress badge. Two modes: a report (verdicts
// come from the consumer's checks) and an editable list (onToggle makes
// each row a checkbox; checked rows pass, the rest are pending).

import { forwardRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./FormExtended";
import { Input } from "./Form";
import { Verdict, type VerdictKind } from "./Verdict";

export interface CheckListItem {
  id: string;
  /** The sentence: what was checked and what to do about it. */
  label: ReactNode;
  /** Outcome. In editable mode, derived from `checked` when omitted. */
  verdict?: VerdictKind;
  /** Editable mode: the box state. */
  checked?: boolean;
  /** Extra explanation under the sentence. */
  explanation?: ReactNode;
  /** What was measured / required, shown in monospace. */
  measured?: string;
  required?: string;
  /** A control on the trailing edge ("Re-run", "Open"). */
  action?: ReactNode;
  /**
   * Whether this row blocks proceeding. Default: `fail` and `pending`
   * block, everything else does not (unchecked editable rows block).
   */
  blocking?: boolean;
}

export interface CheckListSummary {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  /** No blocking row is failed or pending. */
  canProceed: boolean;
}

export function resolveVerdict(item: CheckListItem, editable: boolean): VerdictKind {
  if (item.verdict) return item.verdict;
  if (editable) return item.checked ? "pass" : "pending";
  return "pending";
}

export function checkListSummary(items: CheckListItem[], editable = false): CheckListSummary {
  let passed = 0;
  let failed = 0;
  let pending = 0;
  let blocked = false;
  for (const it of items) {
    const v = resolveVerdict(it, editable);
    if (v === "pass") passed++;
    if (v === "fail") failed++;
    if (v === "pending") pending++;
    const blocks = it.blocking ?? (v === "fail" || v === "pending");
    if (blocks && (v === "fail" || v === "pending")) blocked = true;
    if (it.blocking === true && v !== "pass" && v !== "skipped") blocked = true;
  }
  return { total: items.length, passed, failed, pending, canProceed: !blocked };
}

export interface CheckListProps extends Omit<HTMLAttributes<HTMLElement>, "onToggle" | "title"> {
  items: CheckListItem[];
  /** Heading above the list. */
  title?: ReactNode;
  /** Show the `passed/total` badge beside the title. Default true. */
  showProgress?: boolean;
  /** Editable mode: each row is a checkbox and this fires on change. */
  onToggle?: (id: string, checked: boolean) => void;
  /** Editable mode: show a remove control per row. */
  onRemove?: (id: string) => void;
  /** Editable mode: show an input to add a row; fires with the typed label. */
  onAdd?: (label: string) => void;
  /** Placeholder of the add field. Default "Add a check". */
  addPlaceholder?: string;
  /** Renders a proceed button that is disabled until `canProceed`. */
  proceed?: { label: ReactNode; onClick: () => void; blockedHint?: ReactNode };
  /** Called whenever the summary changes (same object as returned by `checkListSummary`). */
  onSummary?: (summary: CheckListSummary) => void;
  /** Row minimum height in px. Default 44; applies at all pointer sizes. */
  rowMinHeight?: number;
}

export const CheckList = forwardRef<HTMLElement, CheckListProps>(function CheckList(
  {
    items,
    title,
    showProgress = true,
    onToggle,
    onRemove,
    onAdd,
    addPlaceholder = "Add a check",
    proceed,
    onSummary,
    rowMinHeight = 44,
    className,
    style,
    ...props
  },
  ref
) {
  const editable = typeof onToggle === "function";
  const summary = checkListSummary(items, editable);
  const [draft, setDraft] = useState("");
  onSummary?.(summary);

  const submitAdd = () => {
    const label = draft.trim();
    if (!label || !onAdd) return;
    onAdd(label);
    setDraft("");
  };

  return (
    <section
      ref={ref as never}
      className={cx("vf-checklist", editable && "vf-checklist--editable", className)}
      style={{ ...({ "--vf-checklist-row-min-height": `${rowMinHeight}px` } as CSSProperties), ...style }}
      data-can-proceed={summary.canProceed ? "true" : "false"}
      {...props}
    >
      {(title || showProgress) && (
        <header className="vf-checklist__header">
          {title && <h3 className="vf-checklist__title">{title}</h3>}
          {showProgress && (
            <Badge
              tone={summary.canProceed ? "success" : summary.failed > 0 ? "danger" : "neutral"}
              variant="outline"
              className="vf-checklist__progress"
              aria-label={`${summary.passed} of ${summary.total} passed`}
            >
              {summary.passed}/{summary.total}
            </Badge>
          )}
        </header>
      )}
      <ol className="vf-checklist__rows">
        {items.map((it) => {
          const v = resolveVerdict(it, editable);
          return (
            <li key={it.id} className={cx("vf-checklist__row", `vf-checklist__row--${v}`)} data-verdict={v}>
              <span className="vf-checklist__mark">
                {editable ? (
                  <Checkbox
                    checked={!!it.checked}
                    onValueChange={(c: boolean) => onToggle?.(it.id, c)}
                    aria-label={typeof it.label === "string" ? it.label : undefined}
                  />
                ) : (
                  <Verdict verdict={v} size="sm" measured={it.measured} required={it.required} />
                )}
              </span>
              <span className="vf-checklist__body">
                <span className="vf-checklist__sentence">{it.label}</span>
                {it.explanation && <span className="vf-checklist__explanation">{it.explanation}</span>}
              </span>
              {(it.action || onRemove) && (
                <span className="vf-checklist__action">
                  {it.action}
                  {onRemove && (
                    <Button variant="ghost" size="sm" aria-label="Remove" onClick={() => onRemove(it.id)}>
                      ×
                    </Button>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {onAdd && (
        <form
          className="vf-checklist__add"
          onSubmit={(e) => {
            e.preventDefault();
            submitAdd();
          }}
        >
          <Input
            aria-label={addPlaceholder}
            placeholder={addPlaceholder}
            value={draft}
            onValueChange={setDraft}
            size="sm"
            fullWidth
          />
          <Button type="submit" size="sm" variant="outline" disabled={!draft.trim()}>
            Add
          </Button>
        </form>
      )}
      {proceed && (
        <footer className="vf-checklist__footer">
          {!summary.canProceed && proceed.blockedHint && (
            <span className="vf-checklist__blocked">{proceed.blockedHint}</span>
          )}
          <Button variant="solid" disabled={!summary.canProceed} onClick={proceed.onClick}>
            {proceed.label}
          </Button>
        </footer>
      )}
    </section>
  );
});
CheckList.displayName = "CheckList";
