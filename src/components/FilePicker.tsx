"use client";

// FilePickerButton + DropTarget + IssueList
//
// Three small pieces for "pick a file and read it locally":
//   - FilePickerButton: a real <button> wired to a hidden <input type="file">.
//   - DropTarget: decorates a region as a drop target (data-dragging, onFiles)
//     and leaves the button to the consumer, so there is no button-in-button.
//   - IssueList: per-row import issues with a cap and an "N more" toggle.

import {
  forwardRef,
  useRef,
  useState,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Button, type ButtonProps } from "./Button";
import { cx } from "../utils/cx";
import { useId } from "../hooks/useId";
import { useMessages } from "../i18n/MessagesProvider";
import type { Tone } from "../types";
import { toneAttrs } from "../utils/toneAttrs";

// ── FilePickerButton ───────────────────────────────────────────

export interface FilePickerButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /** Called with the chosen files. The input is reset so the same file can be chosen again. */
  onFiles: (files: File[]) => void;
  /** `accept` for the hidden input ("text/csv,.csv"). */
  accept?: string;
  multiple?: boolean;
  /** Button text. Default from messages: "Choose file" / "Choose files". */
  label?: ReactNode;
  children?: ReactNode;
  /** Extra attributes for the hidden input (`data-testid`, `capture`). */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "accept" | "multiple">;
}

/**
 * A `Button` that opens the file picker. The hidden `<input type="file">`
 * is labelled by the button, so assistive technology sees one control.
 */
export const FilePickerButton = forwardRef<HTMLButtonElement, FilePickerButtonProps>(function FilePickerButton(
  { onFiles, accept, multiple = false, label, children, inputProps, className, disabled, ...rest },
  ref
) {
  const { t } = useMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const text = children ?? label ?? t(multiple ? "fileUpload.chooseFiles" : "fileUpload.chooseFile");
  return (
    <>
      <Button
        ref={ref}
        type="button"
        className={cx("vf-file-picker", className)}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-controls={id}
        {...rest}
      >
        {text}
      </Button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="vf-visually-hidden vf-file-picker__input"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
        {...inputProps}
      />
    </>
  );
});
FilePickerButton.displayName = "FilePickerButton";

// ── DropTarget ─────────────────────────────────────────────────

export interface DropTargetRenderState {
  dragging: boolean;
}

export interface DropTargetProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onDrop"> {
  /** Called with the dropped files (filtered by `accept` when set). */
  onFiles: (files: File[]) => void;
  /** Comma-separated MIME types or extensions; files that match none are dropped silently (`onRejected` tells you). */
  accept?: string;
  /** Called with the files `accept` filtered out. */
  onRejected?: (files: File[]) => void;
  /** Accept at most one file (the first). */
  multiple?: boolean;
  disabled?: boolean;
  /** Draw the dashed drop surface. Default true; set false to decorate a layout of your own. */
  surface?: boolean;
  children?: ReactNode | ((state: DropTargetRenderState) => ReactNode);
}

/** Whether a file matches an `accept` list ("image/*,.csv,text/plain"). */
export function fileMatchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const rules = accept.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/**
 * A region that accepts dropped files and reports `data-dragging` while a
 * drag hovers it. It renders no button and no hidden input: put a
 * `FilePickerButton` (or anything) inside.
 */
export const DropTarget = forwardRef<HTMLDivElement, DropTargetProps>(function DropTarget(
  { onFiles, accept, onRejected, multiple = true, disabled, surface = true, children, className, ...rest },
  ref
) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (disabled) return;
    const all = Array.from(e.dataTransfer.files);
    const accepted = all.filter((f) => fileMatchesAccept(f, accept));
    const rejected = all.filter((f) => !fileMatchesAccept(f, accept));
    if (rejected.length) onRejected?.(rejected);
    const out = multiple ? accepted : accepted.slice(0, 1);
    if (out.length) onFiles(out);
  };
  return (
    <div
      ref={ref}
      className={cx("vf-drop-target", surface && "vf-drop-target--surface", className)}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      onDragEnter={(e) => {
        e.preventDefault();
        if (disabled) return;
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={handleDrop}
      {...rest}
    >
      {typeof children === "function" ? children({ dragging }) : children}
    </div>
  );
});
DropTarget.displayName = "DropTarget";

// ── IssueList ──────────────────────────────────────────────────

export interface Issue {
  id?: string;
  /** Where ("Row 12", "Column email"). */
  label?: ReactNode;
  message: ReactNode;
  /** Default `danger`. */
  tone?: Tone;
}

export interface IssueListProps extends HTMLAttributes<HTMLDivElement> {
  issues: Issue[];
  /** Rows shown before the "N more" control. Default 5. `Infinity` shows all. */
  max?: number;
  /** Accessible name. Default "Issues". */
  label?: string;
  /** Text when `issues` is empty; omit to render nothing. */
  empty?: ReactNode;
  /** Text size. Default `md`. */
  size?: "sm" | "md";
}

/**
 * A capped list of issues with a tone mark per row and a "N more" toggle,
 * for import previews and validation results.
 */
export const IssueList = forwardRef<HTMLDivElement, IssueListProps>(function IssueList(
  { issues, max = 5, label = "Issues", empty, size = "md", className, ...rest },
  ref
) {
  const { t } = useMessages();
  const [expanded, setExpanded] = useState(false);
  if (issues.length === 0) {
    if (empty === undefined) return null;
    return (
      <div ref={ref} className={cx("vf-issue-list", "vf-issue-list--empty", className)} {...rest}>
        {empty}
      </div>
    );
  }
  const shown = expanded ? issues : issues.slice(0, max);
  const hidden = issues.length - shown.length;
  return (
    <div ref={ref} className={cx("vf-issue-list", `vf-issue-list--${size}`, className)} {...rest}>
      <ul className="vf-issue-list__list" aria-label={label}>
        {shown.map((issue, i) => {
          const ta = toneAttrs("vf-issue-list__item", { tone: issue.tone ?? "danger" });
          return (
            <li key={issue.id ?? i} className={ta.className} {...ta.attrs}>
              <span className="vf-issue-list__mark" aria-hidden="true" />
              {issue.label !== undefined && issue.label !== null ? (
                <span className="vf-issue-list__label">{issue.label}</span>
              ) : null}
              <span className="vf-issue-list__message">{issue.message}</span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 ? (
        <button type="button" className="vf-issue-list__more" onClick={() => setExpanded(true)}>
          {t("fileUpload.moreIssues", { n: hidden })}
        </button>
      ) : expanded && issues.length > max ? (
        <button type="button" className="vf-issue-list__more" onClick={() => setExpanded(false)}>
          {t("fileUpload.fewerIssues")}
        </button>
      ) : null}
    </div>
  );
});
IssueList.displayName = "IssueList";
