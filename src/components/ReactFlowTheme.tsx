"use client";

// Phase D3 — voidframe-ui/reactflow theme wrapper
//
// `@xyflow/react` ships its own CSS for `Controls`, `MiniMap`, edges,
// nodes, and handles. Consumers integrating ReactFlow into a voidframe
// app historically wrote inline `style` overrides on every Controls /
// MiniMap to bridge the theme. This wrapper provides a single host
// component that scopes voidframe CSS variables onto the canonical
// ReactFlow class names.
//
// Usage:
//
//     import { VoidframeReactFlowTheme } from "voidframe-ui/reactflow";
//     import { ReactFlow, Controls, MiniMap } from "@xyflow/react";
//
//     <VoidframeReactFlowTheme>
//       <ReactFlow nodes={nodes} edges={edges}>
//         <Controls />
//         <MiniMap />
//       </ReactFlow>
//     </VoidframeReactFlowTheme>
//
// The wrapper sets `data-vf-reactflow=""` on its rendered div so the
// scoped CSS selectors in `src/css/components/reactflow.css` pick up
// only the wrapped subtree. No `!important`. No global side effects.

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface VoidframeReactFlowThemeProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   * Additional CSS variable overrides scoped to the ReactFlow surface.
   * Useful for nudging the accent color or border weight without forking
   * the whole theme.
   */
  vars?: Record<string, string | number>;
  style?: CSSProperties;
}

/**
 * Scoped voidframe theme wrapper for `@xyflow/react`. Map ReactFlow's
 * `Controls` / `MiniMap` / edges / nodes / handles to voidframe tokens
 * via CSS-variable bridging — no `!important` overrides, no global
 * stylesheet. Place at any level above `<ReactFlow>`.
 */
export const VoidframeReactFlowTheme = forwardRef<
  HTMLDivElement,
  VoidframeReactFlowThemeProps
>(function VoidframeReactFlowTheme(
  { children, vars, className, style, ...props },
  ref
) {
  const composedStyle: CSSProperties = vars
    ? ({ ...vars, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <div
      ref={ref}
      data-vf-reactflow=""
      className={cx("vf-reactflow-theme", className)}
      style={composedStyle}
      {...props}
    >
      {children}
    </div>
  );
});
VoidframeReactFlowTheme.displayName = "VoidframeReactFlowTheme";

/**
 * Returns a style object suitable for direct spread on `<Controls>` or
 * `<MiniMap>` when the consumer prefers prop-level theming over the
 * wrapper. Pulls voidframe tokens at runtime via CSS custom-property
 * `var()` references — values resolve against the current theme.
 */
export function useVoidframeReactFlowStyles(): {
  controls: CSSProperties;
  miniMap: CSSProperties;
  background: CSSProperties;
} {
  return {
    controls: {
      background: "var(--vf-bg-2)",
      border: "1px solid var(--vf-border-3)",
      color: "var(--vf-text-0)",
    } as CSSProperties,
    miniMap: {
      background: "var(--vf-bg-2)",
      border: "1px solid var(--vf-border-3)",
    } as CSSProperties,
    background: {
      background: "var(--vf-bg-1)",
    } as CSSProperties,
  };
}
