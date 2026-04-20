"use client";

import { forwardRef } from "react";
import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useResponsive, type Responsive } from "../responsive";

type FlexDirection = CSSProperties["flexDirection"];

export interface FlexProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  direction?: Responsive<FlexDirection>;
  align?: Responsive<CSSProperties["alignItems"]>;
  justify?: Responsive<CSSProperties["justifyContent"]>;
  wrap?: Responsive<boolean>;
  gap?: Responsive<number | string>;
  as?: ElementType;
  style?: CSSProperties;
}

const directionClass = (d: FlexDirection): string | undefined => {
  switch (d) {
    case "row":             return "vf-flex--row";
    case "column":          return "vf-flex--column";
    case "row-reverse":     return "vf-flex--row-reverse";
    case "column-reverse":  return "vf-flex--column-reverse";
    default:                return undefined;
  }
};

/** Flexbox primitive. Foundation for HStack/VStack. Every visual prop accepts a `Responsive<T>` object for per-breakpoint values. */
export const Flex = forwardRef<HTMLElement, FlexProps>(function Flex(
  { children, direction, align, justify, wrap, gap, className, style, as: Tag = "div", ...props },
  ref
) {
  const d = useResponsive(direction);
  const a = useResponsive(align);
  const j = useResponsive(justify);
  const w = useResponsive(wrap);
  const g = useResponsive(gap);
  const inline: CSSProperties = {
    ...(a !== undefined ? { alignItems: a } : {}),
    ...(j !== undefined ? { justifyContent: j } : {}),
    ...(g !== undefined ? { gap: typeof g === "number" ? `${g}px` : g } : {}),
    ...style,
  };
  return (
    <Tag
      ref={ref as never}
      className={cx("vf-flex", directionClass(d), w && "vf-flex--wrap", className)}
      style={inline}
      {...props}
    >
      {children}
    </Tag>
  );
});
Flex.displayName = "Flex";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  align?: CSSProperties["alignItems"];
  gap?: number | string;
  wrap?: boolean;
  style?: CSSProperties;
}

/** Horizontal stack — `flex-direction: row`, default align `center`. */
export const HStack = forwardRef<HTMLDivElement, StackProps>(function HStack(
  { children, align, gap, wrap, className, style, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(align !== undefined ? { alignItems: align } : {}),
    ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-hstack", wrap && "vf-flex--wrap", className)}
      style={inline}
      {...props}
    >
      {children}
    </div>
  );
});
HStack.displayName = "HStack";

/** Vertical stack — `flex-direction: column`, default align `stretch`. */
export const VStack = forwardRef<HTMLDivElement, StackProps>(function VStack(
  { children, align, gap, wrap, className, style, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(align !== undefined ? { alignItems: align } : {}),
    ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-vstack", wrap && "vf-flex--wrap", className)}
      style={inline}
      {...props}
    >
      {children}
    </div>
  );
});
VStack.displayName = "VStack";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  columns?: Responsive<number | string>;
  rows?: Responsive<string>;
  gap?: Responsive<number | string>;
  minChildWidth?: Responsive<string>;
  style?: CSSProperties;
}

/** CSS Grid wrapper. All visual props accept `Responsive<T>` objects. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { children, columns, rows, gap, minChildWidth, className, style, ...props },
  ref
) {
  const c = useResponsive(columns);
  const r = useResponsive(rows);
  const g = useResponsive(gap);
  const m = useResponsive(minChildWidth);
  const templateCols = m
    ? `repeat(auto-fill, minmax(${m}, 1fr))`
    : typeof c === "number"
      ? `repeat(${c}, 1fr)`
      : c;
  const inline: CSSProperties = {
    ...(templateCols ? { gridTemplateColumns: templateCols } : {}),
    ...(r ? { gridTemplateRows: r } : {}),
    ...(g !== undefined ? { gap: typeof g === "number" ? `${g}px` : g } : {}),
    ...style,
  };
  return (
    <div ref={ref} className={cx("vf-grid", className)} style={inline} {...props}>
      {children}
    </div>
  );
});
Grid.displayName = "Grid";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  maxWidth?: Responsive<string>;
  padding?: Responsive<string | number>;
  style?: CSSProperties;
}

/** Max-width centered container. `maxWidth` and `padding` accept `Responsive<T>`. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, maxWidth, padding, className, style, ...props }, ref) {
    const mw = useResponsive(maxWidth);
    const p = useResponsive(padding);
    const inline: CSSProperties = {
      ...(mw ? { maxWidth: mw } : {}),
      ...(p !== undefined
        ? { padding: typeof p === "number" ? `${p}px` : p }
        : {}),
      ...style,
    };
    return (
      <div ref={ref} className={cx("vf-container", className)} style={inline} {...props}>
        {children}
      </div>
    );
  }
);
Container.displayName = "Container";

export interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Layout primitive that centers its single child on both axes. Honours the
 * parent's available space.
 */
export const Center = forwardRef<HTMLDivElement, CenterProps>(function Center(
  { children, className, style, ...props },
  ref
) {
  return (
    <div ref={ref} className={cx("vf-center", className)} style={style} {...props}>
      {children}
    </div>
  );
});
Center.displayName = "Center";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Layout wrapper that locks its content to a given `ratio` (e.g. `16/9`).
 * Works in flex/grid parents without JS measurement.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio({ ratio = 16 / 9, children, className, style, ...props }, ref) {
    const inline: CSSProperties = {
      paddingBottom: `${(1 / ratio) * 100}%`,
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx("vf-aspect-ratio", className)}
        style={inline}
        {...props}
      >
        <div className="vf-aspect-ratio__inner">{children}</div>
      </div>
    );
  }
);
AspectRatio.displayName = "AspectRatio";

export interface SplitViewProps extends HTMLAttributes<HTMLDivElement> {
  left?: ReactNode;
  right?: ReactNode;
  sidebarWidth?: string;
  gap?: number | string;
  style?: CSSProperties;
}

/**
 * Two-pane split view with a draggable divider. Controllable split ratio.
 */
export const SplitView = forwardRef<HTMLDivElement, SplitViewProps>(
  function SplitView({ left, right, sidebarWidth, gap, className, style, ...props }, ref) {
    const inline: CSSProperties = {
      ...(sidebarWidth
        ? ({ "--vf-sidebar-width": sidebarWidth } as CSSProperties)
        : {}),
      ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx("vf-split-view", className)}
        style={inline}
        {...props}
      >
        <div>{left}</div>
        <div>{right}</div>
      </div>
    );
  }
);
SplitView.displayName = "SplitView";

export interface StretchProps extends HTMLAttributes<HTMLDivElement> {
  style?: CSSProperties;
}

/** Inline filler for flex containers. */
export const Stretch = forwardRef<HTMLDivElement, StretchProps>(function Stretch(
  { className, style, ...props },
  ref
) {
  return (
    <div ref={ref} className={cx("vf-stretch", className)} style={style} {...props} />
  );
});
Stretch.displayName = "Stretch";

export interface BoxProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  bg?: string;
  border?: string | true;
  padding?: string | number;
  margin?: string | number;
  radius?: number;
  as?: ElementType;
  style?: CSSProperties;
}

/** Generic box with token-aware shorthand props. */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { children, bg, border, padding, margin, radius, className, style, as: Tag = "div", ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(bg !== undefined ? { background: bg } : {}),
    ...(border !== undefined
      ? { border: `1px solid ${border === true ? "var(--vf-border-1)" : border}` }
      : {}),
    ...(padding !== undefined
      ? { padding: typeof padding === "number" ? `${padding}px` : padding }
      : {}),
    ...(margin !== undefined
      ? { margin: typeof margin === "number" ? `${margin}px` : margin }
      : {}),
    ...(radius !== undefined ? { borderRadius: radius } : {}),
    ...style,
  };
  return (
    <Tag ref={ref as never} className={cx("vf-box", className)} style={inline} {...props}>
      {children}
    </Tag>
  );
});
Box.displayName = "Box";
