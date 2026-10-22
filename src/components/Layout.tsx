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

/** A CSS length: number → px, string as written (`"1fr"`, `"var(--vf-sp-8)"`, `"100%"`). */
export type CssLength = number | string;

/**
 * Sizing and overflow props shared by `Box`, `Flex`, `HStack`, `VStack`.
 * Numbers are px; strings are raw CSS, so tokens (`"var(--vf-sp-8)"`) work.
 */
export interface SizingProps {
  w?: CssLength;
  minW?: CssLength;
  maxW?: CssLength;
  h?: CssLength;
  minH?: CssLength;
  maxH?: CssLength;
  /** `flex` shorthand (`1`, `"1 1 0"`, `"none"`). */
  flex?: CssLength;
  position?: CSSProperties["position"];
  overflow?: CSSProperties["overflow"];
  /** Outer margin; numbers are px. */
  margin?: CssLength;
  /**
   * The flex-child scroll idiom in one word: `min-height: 0; overflow:
   * auto` (and `min-width: 0`), so the element scrolls inside a flex
   * column instead of growing it.
   */
  scrollable?: boolean;
}

const len = (v: CssLength | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

/** Translate `SizingProps` to inline style; `scrollable` is also a class. */
export function sizingStyle(p: SizingProps): CSSProperties {
  const out: CSSProperties = {};
  if (p.w !== undefined) out.width = len(p.w);
  if (p.minW !== undefined) out.minWidth = len(p.minW);
  if (p.maxW !== undefined) out.maxWidth = len(p.maxW);
  if (p.h !== undefined) out.height = len(p.h);
  if (p.minH !== undefined) out.minHeight = len(p.minH);
  if (p.maxH !== undefined) out.maxHeight = len(p.maxH);
  if (p.flex !== undefined) out.flex = typeof p.flex === "number" ? p.flex : p.flex;
  if (p.position !== undefined) out.position = p.position;
  if (p.overflow !== undefined) out.overflow = p.overflow;
  if (p.margin !== undefined) out.margin = len(p.margin);
  return out;
}

const SIZING_KEYS = ["w", "minW", "maxW", "h", "minH", "maxH", "flex", "position", "overflow", "margin", "scrollable"] as const;

/** Split `SizingProps` off a props object so the rest can be spread onto the DOM. */
export function splitSizing<P extends SizingProps>(props: P): { sizing: SizingProps; rest: Omit<P, keyof SizingProps> } {
  const sizing: SizingProps = {};
  const rest = { ...props } as Record<string, unknown>;
  for (const k of SIZING_KEYS) {
    if (k in rest) {
      (sizing as Record<string, unknown>)[k] = rest[k];
      delete rest[k];
    }
  }
  return { sizing, rest: rest as Omit<P, keyof SizingProps> };
}

/**
 * `Flex.wrap` accepts either:
 * - `boolean` (or `Responsive<boolean>`) — voidframe convention
 * - the raw CSS values `"wrap"` / `"nowrap"` / `"wrap-reverse"` — matches
 *   `flex-wrap` muscle memory for migrators from raw CSS / shadcn /
 *   Chakra. Internally normalized to a boolean (any non-`"nowrap"` value
 *   resolves truthy and emits the `vf-flex--wrap` class).
 */
export type FlexWrap = boolean | "wrap" | "nowrap" | "wrap-reverse";

export interface FlexProps extends HTMLAttributes<HTMLElement>, SizingProps {
  children?: ReactNode;
  direction?: Responsive<FlexDirection>;
  align?: Responsive<CSSProperties["alignItems"]>;
  justify?: Responsive<CSSProperties["justifyContent"]>;
  wrap?: Responsive<FlexWrap>;
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
  { children, direction, align, justify, wrap, gap, className, style, as: Tag = "div", ...rawProps },
  ref
) {
  const { sizing, rest: props } = splitSizing(rawProps);
  const d = useResponsive(direction);
  const a = useResponsive(align);
  const j = useResponsive(justify);
  const w = useResponsive(wrap);
  const wrapResolved =
    typeof w === "string" ? w !== "nowrap" : Boolean(w);
  const g = useResponsive(gap);
  const inline: CSSProperties = {
    ...(a !== undefined ? { alignItems: a } : {}),
    ...(j !== undefined ? { justifyContent: j } : {}),
    ...(g !== undefined ? { gap: typeof g === "number" ? `${g}px` : g } : {}),
    ...(typeof w === "string" && w === "wrap-reverse"
      ? { flexWrap: "wrap-reverse" as const }
      : {}),
    ...sizingStyle(sizing),
    ...style,
  };
  return (
    <Tag
      ref={ref as never}
      className={cx("vf-flex", directionClass(d), wrapResolved && "vf-flex--wrap", sizing.scrollable && "vf-scrollable", className)}
      style={inline}
      {...props}
    >
      {children}
    </Tag>
  );
});
Flex.displayName = "Flex";

export interface StackProps extends HTMLAttributes<HTMLDivElement>, SizingProps {
  children?: ReactNode;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  gap?: number | string;
  wrap?: boolean;
  style?: CSSProperties;
}

/** Horizontal stack — `flex-direction: row`, default align `center`. */
export const HStack = forwardRef<HTMLDivElement, StackProps>(function HStack(
  { children, align, justify, gap, wrap, className, style, ...rawProps },
  ref
) {
  const { sizing, rest: props } = splitSizing(rawProps);
  const inline: CSSProperties = {
    ...(align !== undefined ? { alignItems: align } : {}),
    ...(justify !== undefined ? { justifyContent: justify } : {}),
    ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
    ...sizingStyle(sizing),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-hstack", wrap && "vf-flex--wrap", sizing.scrollable && "vf-scrollable", className)}
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
  { children, align, justify, gap, wrap, className, style, ...rawProps },
  ref
) {
  const { sizing, rest: props } = splitSizing(rawProps);
  const inline: CSSProperties = {
    ...(align !== undefined ? { alignItems: align } : {}),
    ...(justify !== undefined ? { justifyContent: justify } : {}),
    ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
    ...sizingStyle(sizing),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-vstack", wrap && "vf-flex--wrap", sizing.scrollable && "vf-scrollable", className)}
      style={inline}
      {...props}
    >
      {children}
    </div>
  );
});
VStack.displayName = "VStack";

export interface GridProps extends HTMLAttributes<HTMLDivElement>, SizingProps {
  children?: ReactNode;
  columns?: Responsive<number | string>;
  rows?: Responsive<string>;
  gap?: Responsive<number | string>;
  minChildWidth?: Responsive<string>;
  /** `align-items` for the cells. */
  align?: Responsive<CSSProperties["alignItems"]>;
  /** `justify-items` for the cells. */
  justify?: Responsive<CSSProperties["justifyItems"]>;
  /** `align-content` / `justify-content` for the tracks. */
  alignContent?: CSSProperties["alignContent"];
  justifyContent?: CSSProperties["justifyContent"];
  style?: CSSProperties;
}

/** CSS Grid wrapper. All visual props accept `Responsive<T>` objects. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { children, columns, rows, gap, minChildWidth, align, justify, alignContent, justifyContent, className, style, ...rawProps },
  ref
) {
  const { sizing, rest: props } = splitSizing(rawProps);
  const c = useResponsive(columns);
  const r = useResponsive(rows);
  const g = useResponsive(gap);
  const m = useResponsive(minChildWidth);
  const ai = useResponsive(align);
  const ji = useResponsive(justify);
  const templateCols = m
    ? `repeat(auto-fill, minmax(${m}, 1fr))`
    : typeof c === "number"
      ? `repeat(${c}, 1fr)`
      : c;
  const inline: CSSProperties = {
    ...(templateCols ? { gridTemplateColumns: templateCols } : {}),
    ...(r ? { gridTemplateRows: r } : {}),
    ...(g !== undefined ? { gap: typeof g === "number" ? `${g}px` : g } : {}),
    ...(ai !== undefined ? { alignItems: ai } : {}),
    ...(ji !== undefined ? { justifyItems: ji } : {}),
    ...(alignContent !== undefined ? { alignContent } : {}),
    ...(justifyContent !== undefined ? { justifyContent } : {}),
    ...sizingStyle(sizing),
    ...style,
  };
  return (
    <div ref={ref} className={cx("vf-grid", sizing.scrollable && "vf-scrollable", className)} style={inline} {...props}>
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

export interface BoxProps extends HTMLAttributes<HTMLElement>, SizingProps {
  children?: ReactNode;
  bg?: string;
  border?: string | true;
  padding?: string | number;
  margin?: string | number;
  radius?: number;
  as?: ElementType;
  style?: CSSProperties;
}

/** Generic box with token-aware shorthand props, including sizing (`w`, `minW`, `maxW`, `h`, `minH`, `maxH`, `flex`, `position`, `overflow`, `scrollable`). */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { children, bg, border, padding, margin, radius, className, style, as: Tag = "div", ...rawProps },
  ref
) {
  const { sizing, rest: props } = splitSizing(rawProps);
  const inline: CSSProperties = {
    ...sizingStyle(sizing),
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
    <Tag ref={ref as never} className={cx("vf-box", sizing.scrollable && "vf-scrollable", className)} style={inline} {...props}>
      {children}
    </Tag>
  );
});
Box.displayName = "Box";
