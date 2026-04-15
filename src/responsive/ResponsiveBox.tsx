"use client";

// Phase 16 — ResponsiveBox
//
// JS-resolved responsive layout primitive. For common layout props that
// would explode the CSS class combinatorics, resolve once per render
// against the active breakpoint.

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import type { Responsive } from "./breakpoints";
import { useResponsive } from "./useBreakpoint";

export interface ResponsiveBoxProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "dir" | "color" | "columns"
  > {
  /** flex | grid | block */
  display?: Responsive<"flex" | "grid" | "block" | "inline-flex" | "inline-grid">;
  /** Flex direction. */
  direction?: Responsive<"row" | "column" | "row-reverse" | "column-reverse">;
  /** `align-items`. */
  align?: Responsive<"start" | "center" | "end" | "stretch" | "baseline">;
  /** `justify-content`. */
  justify?: Responsive<
    "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly"
  >;
  /** Grid column count — shortcut for `grid-template-columns: repeat(N, 1fr)`. */
  columns?: Responsive<number>;
  gap?: Responsive<number | string>;
  wrap?: Responsive<boolean>;
  /** All-sides padding, in px or CSS string. */
  p?: Responsive<number | string>;
  px?: Responsive<number | string>;
  py?: Responsive<number | string>;
  pt?: Responsive<number | string>;
  pr?: Responsive<number | string>;
  pb?: Responsive<number | string>;
  pl?: Responsive<number | string>;
  m?: Responsive<number | string>;
  mx?: Responsive<number | string>;
  my?: Responsive<number | string>;
  mt?: Responsive<number | string>;
  mr?: Responsive<number | string>;
  mb?: Responsive<number | string>;
  ml?: Responsive<number | string>;
  maxWidth?: Responsive<number | string>;
  minWidth?: Responsive<number | string>;
  width?: Responsive<number | string>;
  height?: Responsive<number | string>;
  children?: ReactNode;
}

export const ResponsiveBox = forwardRef<HTMLDivElement, ResponsiveBoxProps>(
  function ResponsiveBox(props, ref) {
    const {
      display,
      direction,
      align,
      justify,
      columns,
      gap,
      wrap,
      p,
      px,
      py,
      pt,
      pr,
      pb,
      pl,
      m,
      mx,
      my,
      mt,
      mr,
      mb,
      ml,
      maxWidth,
      minWidth,
      width,
      height,
      className,
      style,
      children,
      ...rest
    } = props;

    const d = useResponsive(display);
    const dir = useResponsive(direction);
    const al = useResponsive(align);
    const ju = useResponsive(justify);
    const cols = useResponsive(columns);
    const gp = useResponsive(gap);
    const wr = useResponsive(wrap);

    const pAll = useResponsive(p);
    const pX = useResponsive(px);
    const pY = useResponsive(py);
    const pT = useResponsive(pt);
    const pR = useResponsive(pr);
    const pB = useResponsive(pb);
    const pL = useResponsive(pl);

    const mAll = useResponsive(m);
    const mX = useResponsive(mx);
    const mY = useResponsive(my);
    const mT = useResponsive(mt);
    const mR = useResponsive(mr);
    const mB = useResponsive(mb);
    const mL = useResponsive(ml);

    const mw = useResponsive(maxWidth);
    const mnw = useResponsive(minWidth);
    const w = useResponsive(width);
    const h = useResponsive(height);

    const merged: CSSProperties = {
      ...(d ? { display: d } : {}),
      ...(dir ? { flexDirection: dir } : {}),
      ...(al
        ? { alignItems: al === "start" ? "flex-start" : al === "end" ? "flex-end" : al }
        : {}),
      ...(ju
        ? {
            justifyContent:
              ju === "start"
                ? "flex-start"
                : ju === "end"
                  ? "flex-end"
                  : ju,
          }
        : {}),
      ...(cols !== undefined
        ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }
        : {}),
      ...(gp !== undefined ? { gap: toCssLength(gp) } : {}),
      ...(wr !== undefined
        ? { flexWrap: wr ? "wrap" : "nowrap" }
        : {}),
      ...(pAll !== undefined ? { padding: toCssLength(pAll) } : {}),
      ...(pX !== undefined
        ? { paddingInline: toCssLength(pX) }
        : {}),
      ...(pY !== undefined
        ? { paddingBlock: toCssLength(pY) }
        : {}),
      ...(pT !== undefined ? { paddingTop: toCssLength(pT) } : {}),
      ...(pR !== undefined ? { paddingRight: toCssLength(pR) } : {}),
      ...(pB !== undefined ? { paddingBottom: toCssLength(pB) } : {}),
      ...(pL !== undefined ? { paddingLeft: toCssLength(pL) } : {}),
      ...(mAll !== undefined ? { margin: toCssLength(mAll) } : {}),
      ...(mX !== undefined ? { marginInline: toCssLength(mX) } : {}),
      ...(mY !== undefined ? { marginBlock: toCssLength(mY) } : {}),
      ...(mT !== undefined ? { marginTop: toCssLength(mT) } : {}),
      ...(mR !== undefined ? { marginRight: toCssLength(mR) } : {}),
      ...(mB !== undefined ? { marginBottom: toCssLength(mB) } : {}),
      ...(mL !== undefined ? { marginLeft: toCssLength(mL) } : {}),
      ...(mw !== undefined ? { maxWidth: toCssLength(mw) } : {}),
      ...(mnw !== undefined ? { minWidth: toCssLength(mnw) } : {}),
      ...(w !== undefined ? { width: toCssLength(w) } : {}),
      ...(h !== undefined ? { height: toCssLength(h) } : {}),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cx("vf-responsive-box", className)}
        style={merged}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
ResponsiveBox.displayName = "ResponsiveBox";

function toCssLength(v: number | string): string {
  return typeof v === "number" ? `${v}px` : v;
}
