"use client";

// Phase 8 — Layout extensions:
//   Stack (VStack alias), GridItem, Sticky, SafeArea, Section, PageHeader,
//   EmptyLayout
//
// Thin, composable layout primitives that round out the Phase 2 base.

import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { Label, Text } from "./Text";
import { VStack, type StackProps } from "./Layout";

// ── Stack — semantic alias of VStack ──────────────────────────

/**
 * Vertical or horizontal flex stack with a `gap` prop. Composable and
 * responsive.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  props,
  ref
) {
  return <VStack ref={ref} {...props} />;
});
Stack.displayName = "Stack";

// ── GridItem ──────────────────────────────────────────────────

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: number | string;
  rowSpan?: number | string;
  colStart?: number | string;
  colEnd?: number | string;
  rowStart?: number | string;
  rowEnd?: number | string;
  as?: ElementType;
  style?: CSSProperties;
}

/**
 * Child of `DashboardGrid` (or any CSS-grid parent) that declares column/row
 * span per breakpoint.
 */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  function GridItem(
    {
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      as: Tag = "div",
      className,
      style,
      ...props
    },
    ref
  ) {
    const merged: CSSProperties = {
      ...(colSpan !== undefined && {
        gridColumn:
          typeof colSpan === "number" ? `span ${colSpan} / span ${colSpan}` : colSpan,
      }),
      ...(rowSpan !== undefined && {
        gridRow:
          typeof rowSpan === "number" ? `span ${rowSpan} / span ${rowSpan}` : rowSpan,
      }),
      ...(colStart !== undefined && { gridColumnStart: colStart }),
      ...(colEnd !== undefined && { gridColumnEnd: colEnd }),
      ...(rowStart !== undefined && { gridRowStart: rowStart }),
      ...(rowEnd !== undefined && { gridRowEnd: rowEnd }),
      ...style,
    };
    return (
      <Tag
        ref={ref}
        className={cx("vf-grid-item", className)}
        style={merged}
        {...props}
      />
    );
  }
);
GridItem.displayName = "GridItem";

// ── Sticky ────────────────────────────────────────────────────

export interface StickyProps extends HTMLAttributes<HTMLDivElement> {
  /** Offset from the top edge. Number = pixels, string = CSS value. */
  top?: number | string;
  bottom?: number | string;
  zIndex?: number;
  style?: CSSProperties;
}

/**
 * Wrapper that makes its child `position: sticky` with configurable offset
 * and enabled breakpoints.
 */
export const Sticky = forwardRef<HTMLDivElement, StickyProps>(function Sticky(
  { top, bottom, zIndex, className, style, ...props },
  ref
) {
  const merged: CSSProperties = {
    position: "sticky",
    ...(top !== undefined && { top: typeof top === "number" ? `${top}px` : top }),
    ...(bottom !== undefined && {
      bottom: typeof bottom === "number" ? `${bottom}px` : bottom,
    }),
    ...(zIndex !== undefined && { zIndex }),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-sticky", className)}
      style={merged}
      {...props}
    />
  );
});
Sticky.displayName = "Sticky";

// ── SafeArea ──────────────────────────────────────────────────

export interface SafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  style?: CSSProperties;
}

/**
 * Inset wrapper that respects the device's safe-area insets (notches,
 * rounded corners) on iOS/Android.
 */
export const SafeArea = forwardRef<HTMLDivElement, SafeAreaProps>(
  function SafeArea(
    { top, right, bottom, left, className, style, ...props },
    ref
  ) {
    const merged: CSSProperties = {
      ...(top && { paddingTop: "env(safe-area-inset-top)" }),
      ...(right && { paddingInlineEnd: "env(safe-area-inset-right)" }),
      ...(bottom && { paddingBottom: "env(safe-area-inset-bottom)" }),
      ...(left && { paddingInlineStart: "env(safe-area-inset-left)" }),
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx("vf-safe-area", className)}
        style={merged}
        {...props}
      />
    );
  }
);
SafeArea.displayName = "SafeArea";

// ── Section ───────────────────────────────────────────────────

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Semantic section block with heading slot and consistent vertical rhythm.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    title,
    description,
    actions,
    children,
    headingLevel = 2,
    className,
    ...props
  },
  ref
) {
  const H = `h${headingLevel}` as ElementType;
  return (
    <section ref={ref} className={cx("vf-section", className)} {...props}>
      {(title || actions) && (
        <header className="vf-section__header">
          <div className="vf-section__title-block">
            {title && <H className="vf-section__title">{title}</H>}
            {description && (
              <Text className="vf-section__description" size="sm">
                {description}
              </Text>
            )}
          </div>
          {actions && <div className="vf-section__actions">{actions}</div>}
        </header>
      )}
      <div className="vf-section__body">{children}</div>
    </section>
  );
});
Section.displayName = "Section";

// ── PageHeader ────────────────────────────────────────────────

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  /** Optional eyebrow/overline text. */
  eyebrow?: ReactNode;
}

/**
 * Page-title block for top-of-page sections. Renders a `title` (h1) with
 * optional `eyebrow`, `description`, `breadcrumbs`, `actions`, and a
 * trailing `tabs` slot. All slots accept any ReactNode.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      description,
      breadcrumbs,
      actions,
      tabs,
      eyebrow,
      className,
      ...props
    },
    ref
  ) {
    return (
      <header
        ref={ref}
        className={cx("vf-page-header", className)}
        {...props}
      >
        {breadcrumbs && (
          <div className="vf-page-header__breadcrumbs">{breadcrumbs}</div>
        )}
        <div className="vf-page-header__main">
          <div className="vf-page-header__title-block">
            {eyebrow && <Label className="vf-page-header__eyebrow">{eyebrow}</Label>}
            <h1 className="vf-page-header__title">{title}</h1>
            {description && (
              <Text
                className="vf-page-header__description"
                size="sm"
              >
                {description}
              </Text>
            )}
          </div>
          {actions && <div className="vf-page-header__actions">{actions}</div>}
        </div>
        {tabs && <div className="vf-page-header__tabs">{tabs}</div>}
      </header>
    );
  }
);
PageHeader.displayName = "PageHeader";

// ── EmptyLayout ───────────────────────────────────────────────

export interface EmptyLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Width cap for the centered content. Default "md". */
  maxWidth?: "sm" | "md" | "lg" | number | string;
}

/**
 * Minimal layout shell with just a centred slot — for error pages, login
 * screens, etc.
 */
export const EmptyLayout = forwardRef<HTMLDivElement, EmptyLayoutProps>(
  function EmptyLayout({ maxWidth = "md", className, style, ...props }, ref) {
    const widthMap: Record<string, string> = {
      sm: "320px",
      md: "480px",
      lg: "720px",
    };
    const merged: CSSProperties = {
      ...style,
      "--vf-empty-max":
        typeof maxWidth === "number"
          ? `${maxWidth}px`
          : widthMap[maxWidth as string] ?? String(maxWidth),
    } as CSSProperties;
    return (
      <div
        ref={ref}
        className={cx("vf-empty-layout", className)}
        style={merged}
        {...props}
      />
    );
  }
);
EmptyLayout.displayName = "EmptyLayout";
