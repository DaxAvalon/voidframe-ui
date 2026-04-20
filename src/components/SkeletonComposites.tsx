"use client";

import { forwardRef, memo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../utils/cx";

// ── SkeletonText ─────────────────────────────────────────────

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
  spacing?: string;
  size?: "sm" | "md" | "lg";
}

const SkeletonTextBase = forwardRef<HTMLDivElement, SkeletonTextProps>(
  function SkeletonText(
    {
      lines = 3,
      lastLineWidth = "60%",
      spacing,
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const composed: CSSProperties = {
      ...(spacing ? { gap: spacing } : {}),
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx("vf-skeleton-text", `vf-skeleton-text--${size}`, className)}
        style={composed}
        aria-busy="true"
        aria-label="Loading text"
        role="status"
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="vf-skeleton-text__line vf-skeleton"
            style={
              i === lines - 1 && lines > 1
                ? { width: lastLineWidth }
                : undefined
            }
          />
        ))}
      </div>
    );
  }
);
SkeletonTextBase.displayName = "SkeletonText";
/**
 * Shimmer placeholder for one or more lines of text. Configurable line count
 * and last-line width.
 */
export const SkeletonText = memo(SkeletonTextBase);
(SkeletonText as unknown as { displayName: string }).displayName = "SkeletonText";

// ── SkeletonAvatar ───────────────────────────────────────────

export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
}

const SkeletonAvatarBase = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  function SkeletonAvatar(
    { size = "md", shape = "circle", className, style, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-skeleton-avatar",
          `vf-skeleton-avatar--${size}`,
          `vf-skeleton-avatar--${shape}`,
          "vf-skeleton",
          className
        )}
        style={style}
        aria-busy="true"
        aria-label="Loading avatar"
        role="status"
        {...props}
      />
    );
  }
);
SkeletonAvatarBase.displayName = "SkeletonAvatar";
/**
 * Circular shimmer placeholder sized for an avatar. Part of the skeleton
 * kit.
 */
export const SkeletonAvatar = memo(SkeletonAvatarBase);
(SkeletonAvatar as unknown as { displayName: string }).displayName = "SkeletonAvatar";

// ── SkeletonButton ───────────────────────────────────────────

export interface SkeletonButtonProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  width?: string;
}

const SkeletonButtonBase = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  function SkeletonButton(
    { size = "md", width, className, style, ...props },
    ref
  ) {
    const composed: CSSProperties = {
      ...(width ? { width } : {}),
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx(
          "vf-skeleton-button",
          `vf-skeleton-button--${size}`,
          "vf-skeleton",
          className
        )}
        style={composed}
        aria-busy="true"
        aria-label="Loading button"
        role="status"
        {...props}
      />
    );
  }
);
SkeletonButtonBase.displayName = "SkeletonButton";
/**
 * Shimmer placeholder shaped like a button. Part of the skeleton kit.
 */
export const SkeletonButton = memo(SkeletonButtonBase);
(SkeletonButton as unknown as { displayName: string }).displayName = "SkeletonButton";

// ── SkeletonCard ─────────────────────────────────────────────

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean;
  imageHeight?: string;
  lines?: number;
  hasActions?: boolean;
}

const SkeletonCardBase = forwardRef<HTMLDivElement, SkeletonCardProps>(
  function SkeletonCard(
    {
      hasImage = false,
      imageHeight = "160px",
      lines = 3,
      hasActions = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-skeleton-card", className)}
        style={style}
        aria-busy="true"
        aria-label="Loading card"
        role="status"
        {...props}
      >
        {hasImage && (
          <div
            className="vf-skeleton-card__image vf-skeleton"
            style={{ height: imageHeight }}
          />
        )}
        <div className="vf-skeleton-card__body">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="vf-skeleton-card__line vf-skeleton"
              style={
                i === lines - 1 && lines > 1 ? { width: "60%" } : undefined
              }
            />
          ))}
        </div>
        {hasActions && (
          <div className="vf-skeleton-card__actions">
            <div className="vf-skeleton-card__action vf-skeleton" />
            <div className="vf-skeleton-card__action vf-skeleton" />
          </div>
        )}
      </div>
    );
  }
);
SkeletonCardBase.displayName = "SkeletonCard";
/**
 * Shimmer placeholder shaped like a `Card`. Configurable with/without
 * header.
 */
export const SkeletonCard = memo(SkeletonCardBase);
(SkeletonCard as unknown as { displayName: string }).displayName = "SkeletonCard";

// ── SkeletonTable ────────────────────────────────────────────

export interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
}

const SkeletonTableBase = forwardRef<HTMLDivElement, SkeletonTableProps>(
  function SkeletonTable(
    {
      rows = 5,
      columns = 4,
      hasHeader = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const gridStyle: CSSProperties = {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx("vf-skeleton-table", className)}
        style={gridStyle}
        aria-busy="true"
        aria-label="Loading table"
        role="status"
        {...props}
      >
        {hasHeader &&
          Array.from({ length: columns }).map((_, c) => (
            <div
              key={`header-${c}`}
              className="vf-skeleton-table__header-cell vf-skeleton"
            />
          ))}
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: columns }).map((_, c) => (
            <div
              key={`row-${r}-col-${c}`}
              className="vf-skeleton-table__cell vf-skeleton"
            />
          ))
        )}
      </div>
    );
  }
);
SkeletonTableBase.displayName = "SkeletonTable";
/**
 * Pre-composed skeleton matching a typical data table.
 */
export const SkeletonTable = memo(SkeletonTableBase);
(SkeletonTable as unknown as { displayName: string }).displayName = "SkeletonTable";

// ── SkeletonForm ─────────────────────────────────────────────

export interface SkeletonFormProps extends HTMLAttributes<HTMLDivElement> {
  fields?: number;
  hasSubmit?: boolean;
}

const SkeletonFormBase = forwardRef<HTMLDivElement, SkeletonFormProps>(
  function SkeletonForm(
    { fields = 3, hasSubmit = true, className, style, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-skeleton-form", className)}
        style={style}
        aria-busy="true"
        aria-label="Loading form"
        role="status"
        {...props}
      >
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="vf-skeleton-form__field">
            <div className="vf-skeleton-form__label vf-skeleton" />
            <div className="vf-skeleton-form__input vf-skeleton" />
          </div>
        ))}
        {hasSubmit && (
          <div className="vf-skeleton-form__submit vf-skeleton" />
        )}
      </div>
    );
  }
);
SkeletonFormBase.displayName = "SkeletonForm";
/**
 * Pre-composed skeleton matching a typical form (label + input pairs).
 */
export const SkeletonForm = memo(SkeletonFormBase);
(SkeletonForm as unknown as { displayName: string }).displayName = "SkeletonForm";
