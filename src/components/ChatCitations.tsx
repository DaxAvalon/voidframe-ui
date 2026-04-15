"use client";

// Phase 12 — Citations, sources, RAG context

import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface SourceRef {
  id?: string | number;
  title?: ReactNode;
  url?: string;
  snippet?: ReactNode;
  favicon?: ReactNode;
  publisher?: ReactNode;
  publishedAt?: ReactNode;
  thumbnail?: ReactNode;
}

// ── Citation ────────────────────────────────────────────────

export interface CitationProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "onClick"> {
  index: ReactNode;
  source?: SourceRef;
  tooltip?: boolean;
  onClick?: (source: SourceRef | undefined) => void;
}

export const Citation = forwardRef<HTMLSpanElement, CitationProps>(
  function Citation(
    { index, source, tooltip = true, onClick, className, ...props },
    ref
  ) {
    const label =
      source?.title && typeof source.title === "string"
        ? `Source ${index}: ${source.title}`
        : `Source ${index}`;
    const Component = onClick ? "button" : "span";
    return (
      <Component
        ref={ref as never}
        className={cx("vf-citation", className)}
        title={
          tooltip && typeof source?.title === "string" ? source.title : undefined
        }
        aria-label={label}
        {...(onClick
          ? ({
              type: "button",
              onClick: () => onClick(source),
            } as unknown as HTMLAttributes<HTMLSpanElement>)
          : {})}
        {...props}
      >
        [{index}]
      </Component>
    );
  }
);
Citation.displayName = "Citation";

// ── CitationList ────────────────────────────────────────────

export interface CitationListProps
  extends Omit<HTMLAttributes<HTMLOListElement>, "title"> {
  sources: SourceRef[];
  onSourceClick?: (source: SourceRef) => void;
  title?: ReactNode;
  compact?: boolean;
}

export const CitationList = forwardRef<HTMLOListElement, CitationListProps>(
  function CitationList(
    { sources, onSourceClick, title, compact, className, ...props },
    ref
  ) {
    return (
      <div className={cx("vf-citation-list-wrap", compact && "vf-citation-list-wrap--compact")}>
        {title && <div className="vf-citation-list__title">{title}</div>}
        <ol
          ref={ref}
          className={cx(
            "vf-citation-list",
            compact && "vf-citation-list--compact",
            className
          )}
          {...props}
        >
          {sources.map((source, i) => {
            const index = source.id ?? i + 1;
            return (
              <li key={String(index)} className="vf-citation-list__item">
                <CitationListEntry
                  source={source}
                  index={index}
                  onClick={onSourceClick}
                />
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);
CitationList.displayName = "CitationList";

function CitationListEntry({
  source,
  index,
  onClick,
}: {
  source: SourceRef;
  index: string | number;
  onClick?: (source: SourceRef) => void;
}) {
  const body = (
    <>
      <span className="vf-citation-list__index" aria-hidden="true">
        [{index}]
      </span>
      <span className="vf-citation-list__body">
        {source.favicon && (
          <span className="vf-citation-list__favicon" aria-hidden="true">
            {source.favicon}
          </span>
        )}
        <span className="vf-citation-list__title-line">
          {source.title ?? source.url}
        </span>
        {source.snippet && (
          <span className="vf-citation-list__snippet">{source.snippet}</span>
        )}
        {(source.publisher || source.publishedAt) && (
          <span className="vf-citation-list__meta">
            {source.publisher}
            {source.publishedAt && <> · {source.publishedAt}</>}
          </span>
        )}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className="vf-citation-list__entry vf-citation-list__entry--button"
        onClick={() => onClick(source)}
      >
        {body}
      </button>
    );
  }
  if (source.url) {
    return (
      <a
        className="vf-citation-list__entry vf-citation-list__entry--link"
        href={source.url}
        target="_blank"
        rel="noreferrer"
      >
        {body}
      </a>
    );
  }
  return <div className="vf-citation-list__entry">{body}</div>;
}

// ── SourceCard ──────────────────────────────────────────────

export interface SourceCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  url?: string;
  snippet?: ReactNode;
  favicon?: ReactNode;
  publisher?: ReactNode;
  publishedAt?: ReactNode;
  thumbnail?: ReactNode;
  onOpen?: () => void;
}

export const SourceCard = forwardRef<HTMLElement, SourceCardProps>(
  function SourceCard(
    {
      title,
      url,
      snippet,
      favicon,
      publisher,
      publishedAt,
      thumbnail,
      onOpen,
      className,
      ...props
    },
    ref
  ) {
    const body = (
      <>
        {thumbnail && (
          <span className="vf-source-card__thumb" aria-hidden="true">
            {thumbnail}
          </span>
        )}
        <span className="vf-source-card__body">
          <span className="vf-source-card__title-line">
            {favicon && (
              <span className="vf-source-card__favicon" aria-hidden="true">
                {favicon}
              </span>
            )}
            <span className="vf-source-card__title">{title ?? url}</span>
          </span>
          {snippet && <span className="vf-source-card__snippet">{snippet}</span>}
          {(publisher || publishedAt) && (
            <span className="vf-source-card__meta">
              {publisher}
              {publishedAt && <> · {publishedAt}</>}
            </span>
          )}
        </span>
      </>
    );
    if (onOpen) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={cx("vf-source-card", "vf-source-card--button", className)}
          onClick={onOpen}
          {...(props as HTMLAttributes<HTMLButtonElement>)}
        >
          {body}
        </button>
      );
    }
    if (url) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cx("vf-source-card", "vf-source-card--link", className)}
          href={url}
          target="_blank"
          rel="noreferrer"
          {...(props as HTMLAttributes<HTMLAnchorElement>)}
        >
          {body}
        </a>
      );
    }
    return (
      <article
        ref={ref as React.Ref<HTMLElement>}
        className={cx("vf-source-card", className)}
        {...props}
      >
        {body}
      </article>
    );
  }
);
SourceCard.displayName = "SourceCard";

// ── SourceGrid ──────────────────────────────────────────────

export interface SourceGridProps extends HTMLAttributes<HTMLDivElement> {
  sources: SourceRef[];
  onSourceClick?: (source: SourceRef) => void;
  /** Grid column count. Default: auto-fill at 240px min. */
  columns?: number;
}

export const SourceGrid = forwardRef<HTMLDivElement, SourceGridProps>(
  function SourceGrid(
    { sources, onSourceClick, columns, className, style, ...props },
    ref
  ) {
    const gridStyle = {
      ...style,
      ...(columns
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        : {}),
    };
    return (
      <div
        ref={ref}
        className={cx("vf-source-grid", className)}
        style={gridStyle}
        {...props}
      >
        {sources.map((source, i) => (
          <SourceCard
            key={String(source.id ?? i)}
            title={source.title}
            url={source.url}
            snippet={source.snippet}
            favicon={source.favicon}
            publisher={source.publisher}
            publishedAt={source.publishedAt}
            thumbnail={source.thumbnail}
            onOpen={onSourceClick ? () => onSourceClick(source) : undefined}
          />
        ))}
      </div>
    );
  }
);
SourceGrid.displayName = "SourceGrid";

// ── RAGContext ──────────────────────────────────────────────

export interface RAGChunk {
  id?: string | number;
  source: ReactNode;
  content: ReactNode;
  score?: number;
}

export interface RAGContextProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  chunks: RAGChunk[];
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  title?: ReactNode;
}

export const RAGContext = forwardRef<HTMLDivElement, RAGContextProps>(
  function RAGContext(
    {
      chunks,
      defaultCollapsed = true,
      collapsed,
      onCollapsedChange,
      title = "Retrieved context",
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState(defaultCollapsed);
    const isCollapsed = collapsed ?? internal;
    const setCollapsed = (next: boolean) => {
      if (collapsed === undefined) setInternal(next);
      onCollapsedChange?.(next);
    };
    return (
      <div
        ref={ref}
        className={cx(
          "vf-rag-context",
          isCollapsed && "vf-rag-context--collapsed",
          className
        )}
        {...props}
      >
        <button
          type="button"
          className="vf-rag-context__trigger"
          aria-expanded={!isCollapsed}
          onClick={() => setCollapsed(!isCollapsed)}
        >
          <span aria-hidden="true" className="vf-rag-context__caret">
            {isCollapsed ? "▸" : "▾"}
          </span>
          <span className="vf-rag-context__title">{title}</span>
          <span className="vf-rag-context__count">{chunks.length}</span>
        </button>
        {!isCollapsed && (
          <ol className="vf-rag-context__chunks">
            {chunks.map((chunk, i) => (
              <li
                key={String(chunk.id ?? i)}
                className="vf-rag-context__chunk"
              >
                <header className="vf-rag-context__chunk-header">
                  <span className="vf-rag-context__chunk-source">
                    {chunk.source}
                  </span>
                  {chunk.score !== undefined && (
                    <span className="vf-rag-context__chunk-score">
                      {chunk.score.toFixed(2)}
                    </span>
                  )}
                </header>
                <div className="vf-rag-context__chunk-content">
                  {chunk.content}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }
);
RAGContext.displayName = "RAGContext";
