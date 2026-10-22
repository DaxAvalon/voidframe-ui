"use client";

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";
import {
  renderMarkdownBlocks,
  type MarkdownComponents,
} from "../MarkdownEditor";

// ── MarkdownRenderer ─────────────────────────────────────────

export type MarkdownComponentMap = MarkdownComponents;

export type MarkdownPlugin = (input: string) => string;

export interface MarkdownRendererProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  /** Opens links in a new tab when set. */
  linkTarget?: "_blank" | "_self";
  /** Pre-process the markdown source through these plugins in order. */
  plugins?: MarkdownPlugin[];
  /** Replace specific tags with custom React components. */
  components?: MarkdownComponentMap;
  /**
   * Called when a task-list checkbox is toggled with its document index,
   * new state and 1-based source line. Setting it makes the checkboxes
   * interactive; they are rendered disabled otherwise.
   */
  onTaskToggle?: (index: number, checked: boolean, line: number) => void;
  /** Make task-list checkboxes interactive. Default: `!!onTaskToggle`. */
  interactiveTasks?: boolean;
}

/**
 * Safe markdown renderer. Emits React elements only (no HTML strings, no
 * sanitizer peer): headings, emphasis, inline code, code fences, links
 * (through `safeHref`), lists, task lists, GFM tables, blockquotes, rules
 * and hard breaks. Raw HTML in the source is shown as text. Class hooks:
 * `vf-markdown-renderer__body`, `vf-md-table`, `vf-md-task-list`,
 * `vf-md-task`, `vf-md-task__checkbox`, `vf-md-task__text`.
 */
export const MarkdownRenderer = forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer(
    {
      content,
      linkTarget,
      plugins,
      components,
      onTaskToggle,
      interactiveTasks,
      className,
      ...props
    },
    ref
  ) {
    const processed = useMemo(() => {
      let src = content;
      for (const plugin of plugins ?? []) src = plugin(src);
      return src;
    }, [content, plugins]);

    const tree = useMemo(
      () =>
        renderMarkdownBlocks(processed, {
          components: components as MarkdownComponents | undefined,
          linkTarget,
          onTaskToggle,
          interactiveTasks,
        }),
      [processed, linkTarget, components, onTaskToggle, interactiveTasks]
    );

    return (
      <div ref={ref} className={cx("vf-markdown-renderer", className)} {...props}>
        <div className="vf-markdown-renderer__body">{tree}</div>
      </div>
    );
  }
);
MarkdownRenderer.displayName = "MarkdownRenderer";
