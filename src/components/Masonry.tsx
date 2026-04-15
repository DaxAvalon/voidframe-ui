"use client";

// Phase 8 — Masonry
//
// CSS grid masonry layout (via `grid-template-rows: masonry` where supported)
// with a JS fallback that distributes items across column buckets. This keeps
// the component accessible — items render in source order in the JS fallback.

import {
  Children,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type MasonryColumns =
  | number
  | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };

export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  columns?: MasonryColumns;
  gap?: number | string;
  children?: ReactNode;
  style?: CSSProperties;
}

function supportsMasonry(): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return CSS.supports("grid-template-rows: masonry");
}

function useResponsiveColumns(columns: MasonryColumns): number {
  const [cols, setCols] = useState<number>(() =>
    typeof columns === "number" ? columns : columns.base ?? 1
  );

  useEffect(() => {
    if (typeof columns === "number") {
      setCols(columns);
      return;
    }
    if (typeof window === "undefined") return;
    const pick = (): number => {
      const w = window.innerWidth;
      if (w >= 1280 && columns.xl) return columns.xl;
      if (w >= 1024 && columns.lg) return columns.lg;
      if (w >= 768 && columns.md) return columns.md;
      if (w >= 640 && columns.sm) return columns.sm;
      return columns.base ?? 1;
    };
    const update = () => setCols(pick());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [columns]);

  return cols;
}

export const Masonry = forwardRef<HTMLDivElement, MasonryProps>(function Masonry(
  { columns = 3, gap = 12, children, className, style, ...props },
  ref
) {
  const colCount = useResponsiveColumns(columns);
  const nativeRef = useRef<boolean | null>(null);
  if (nativeRef.current === null) nativeRef.current = supportsMasonry();

  const gapCss = typeof gap === "number" ? `${gap}px` : gap;

  if (nativeRef.current) {
    const merged: CSSProperties = {
      display: "grid",
      gridTemplateColumns: `repeat(${colCount}, 1fr)`,
      gridTemplateRows: "masonry",
      gap: gapCss,
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx("vf-masonry", className)}
        style={merged}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Fallback: distribute children into column buckets round-robin.
  const items = Children.toArray(children);
  const buckets: ReactNode[][] = Array.from({ length: colCount }, () => []);
  items.forEach((item, idx) => {
    buckets[idx % colCount]!.push(item);
  });

  const merged: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
    gap: gapCss,
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-masonry", "vf-masonry--fallback", className)}
      style={merged}
      {...props}
    >
      {buckets.map((bucket, i) => (
        <div
          key={i}
          className="vf-masonry__col"
          style={{ display: "flex", flexDirection: "column", gap: gapCss }}
        >
          {bucket}
        </div>
      ))}
    </div>
  );
});
Masonry.displayName = "Masonry";
