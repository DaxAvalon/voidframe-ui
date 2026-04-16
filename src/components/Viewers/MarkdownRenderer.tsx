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

export type MarkdownComponentMap = Partial<{
  h1: React.ElementType;
  h2: React.ElementType;
  h3: React.ElementType;
  h4: React.ElementType;
  h5: React.ElementType;
  h6: React.ElementType;
  p: React.ElementType;
  a: React.ElementType;
  code: React.ElementType;
  pre: React.ElementType;
  ul: React.ElementType;
  ol: React.ElementType;
  li: React.ElementType;
  blockquote: React.ElementType;
  hr: React.ElementType;
  strong: React.ElementType;
  em: React.ElementType;
  br: React.ElementType;
}>;

export type MarkdownPlugin = (input: string) => string;

export interface MarkdownRendererProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  /** Opens links in a new tab when set. */
  linkTarget?: "_blank" | "_self";
  /** Pre-process the markdown source through these plugins in order. */
  plugins?: MarkdownPlugin[];
  /** Replace specific tags with custom React components. */
  components?: MarkdownComponentMap;
}

export const MarkdownRenderer = forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer(
    { content, linkTarget, plugins, components, className, ...props },
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
        }),
      [processed, linkTarget, components]
    );

    return (
      <div ref={ref} className={cx("vf-markdown-renderer", className)} {...props}>
        <div className="vf-markdown-renderer__body">{tree}</div>
      </div>
    );
  }
);
MarkdownRenderer.displayName = "MarkdownRenderer";
