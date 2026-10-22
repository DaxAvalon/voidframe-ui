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

import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { readToken } from "../utils/readToken";

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

// ── Kind palette ─────────────────────────────────────────────────

/** The categorical palette, in slot order. */
const CHART_TOKENS = [
  "--vf-chart-1",
  "--vf-chart-2",
  "--vf-chart-3",
  "--vf-chart-4",
  "--vf-chart-5",
  "--vf-chart-6",
  "--vf-chart-7",
  "--vf-chart-8",
] as const;

/** Number of categorical slots in the `--vf-chart-1..8` palette. */
export const FLOW_KIND_SLOTS = CHART_TOKENS.length;

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Map a node or edge "kind" to one of the eight categorical chart colours.
 *
 * Numbers index the palette directly (0-based, cycling). Strings are hashed,
 * so the same kind gets the same colour in every graph, minimap and legend
 * without a shared lookup table; pass `kinds` (the ordered list of kinds
 * your app knows) to assign slots by position instead and avoid collisions.
 * Returns a `var(--vf-chart-N)` reference; use `flowKindColorValue()` when a
 * concrete colour string is required.
 */
export function flowKindColor(
  kind: string | number,
  kinds?: readonly (string | number)[]
): string {
  return `var(${CHART_TOKENS[flowKindSlot(kind, kinds) - 1]!})`;
}

/** 1-based palette slot for `kind` (see `flowKindColor`). */
export function flowKindSlot(
  kind: string | number,
  kinds?: readonly (string | number)[]
): number {
  if (kinds) {
    const i = kinds.indexOf(kind);
    if (i >= 0) return (i % FLOW_KIND_SLOTS) + 1;
  }
  if (typeof kind === "number") {
    return (((Math.trunc(kind) % FLOW_KIND_SLOTS) + FLOW_KIND_SLOTS) % FLOW_KIND_SLOTS) + 1;
  }
  return (hashString(kind) % FLOW_KIND_SLOTS) + 1;
}

/**
 * Resolved colour for a kind (reads the `--vf-chart-N` token through
 * `getComputedStyle`). For `MiniMap nodeColor`, `markerEnd.color` and other
 * props that reject `var()` strings.
 */
export function flowKindColorValue(
  kind: string | number,
  options: { kinds?: readonly (string | number)[]; element?: Element | null; fallback?: string } = {}
): string {
  return readToken(CHART_TOKENS[flowKindSlot(kind, options.kinds) - 1]!, {
    element: options.element,
    fallback: options.fallback,
  });
}

// ── Edge presets ─────────────────────────────────────────────────

export type FlowDash = "solid" | "dashed" | "dotted" | "long-dash";

/** `strokeDasharray` presets for edges. */
export const FLOW_DASH: Record<FlowDash, string | undefined> = {
  solid: undefined,
  dashed: "6 4",
  dotted: "2 3",
  "long-dash": "12 6",
};

export interface FlowEdgeStyleOptions {
  /** Dash preset. Default `"solid"`. */
  dash?: FlowDash;
  /** Stroke width in px. Default 1.5. */
  width?: number;
  /** Ordered kind list for positional slot assignment (see `flowKindColor`). */
  kinds?: readonly (string | number)[];
  /** Lower opacity for de-emphasised edges. */
  dimmed?: boolean;
}

export interface VoidframeReactFlowStyles {
  controls: CSSProperties;
  miniMap: CSSProperties;
  background: CSSProperties;
  /** For `<Panel>`: surface, border and padding matching the controls. */
  panel: CSSProperties;
  /** SVG style for an edge path. `kind` picks a `--vf-chart-N` colour; omit for the neutral edge colour. */
  edgeStyle: (kind?: string | number, options?: FlowEdgeStyleOptions) => CSSProperties;
  /** For React Flow's `labelStyle` on edges. */
  edgeLabelStyle: CSSProperties;
  /** For React Flow's `labelBgStyle` on edges. */
  edgeLabelBgStyle: CSSProperties;
  /** Dash presets, for consumers composing their own edge styles. */
  dash: typeof FLOW_DASH;
  /** Kind → `var(--vf-chart-N)` reference. */
  flowKindColor: typeof flowKindColor;
}

/**
 * Returns style objects suitable for direct spread on `<Controls>`,
 * `<MiniMap>`, `<Panel>` and edges when the consumer prefers prop-level
 * theming over the wrapper. Pulls voidframe tokens via CSS custom-property
 * `var()` references — values resolve against the current theme. For props
 * that need a concrete colour (`MiniMap nodeColor`, `markerEnd.color`) use
 * `useVoidframeTokens()` or `flowKindColorValue()`.
 */
export function useVoidframeReactFlowStyles(): VoidframeReactFlowStyles {
  return useMemo<VoidframeReactFlowStyles>(
    () => ({
      controls: {
        background: "var(--vf-bg-2)",
        border: "1px solid var(--vf-border-3)",
        color: "var(--vf-text-0)",
      },
      miniMap: {
        background: "var(--vf-bg-2)",
        border: "1px solid var(--vf-border-3)",
      },
      background: {
        background: "var(--vf-bg-1)",
      },
      panel: {
        background: "var(--vf-bg-2)",
        border: "1px solid var(--vf-border-3)",
        borderRadius: "var(--vf-radius-1)",
        padding: "var(--vf-sp-2) var(--vf-sp-3)",
        color: "var(--vf-text-0)",
        fontFamily: "var(--vf-font-family)",
        fontSize: "var(--vf-font-sm)",
      },
      edgeStyle: (kind, options = {}) => ({
        stroke: kind === undefined ? "var(--vf-border-3)" : flowKindColor(kind, options.kinds),
        strokeWidth: options.width ?? 1.5,
        strokeDasharray: FLOW_DASH[options.dash ?? "solid"],
        opacity: options.dimmed ? 0.35 : undefined,
      }),
      edgeLabelStyle: {
        fill: "var(--vf-text-1)",
        fontFamily: "var(--vf-font-family)",
        fontSize: "var(--vf-font-xs)",
      },
      edgeLabelBgStyle: {
        fill: "var(--vf-bg-2)",
        stroke: "var(--vf-border-3)",
      },
      dash: FLOW_DASH,
      flowKindColor,
    }),
    []
  );
}

// ── FlowNode shell ───────────────────────────────────────────────

export type FlowNodeState = "selected" | "highlighted" | "dimmed" | "danger";

export interface FlowNodeProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small uppercase label above the title (the node's category). */
  kind?: ReactNode;
  /** Kind used for the rail colour when `rail` is `true`. Defaults to `kind` when it is a string. */
  kindKey?: string | number;
  /** Ordered kind list for positional slot assignment (see `flowKindColor`). */
  kinds?: readonly (string | number)[];
  title?: ReactNode;
  /** Free-form body. */
  children?: ReactNode;
  /** Monospace slot (identifiers, paths, counts) rendered below the body. */
  mono?: ReactNode;
  /**
   * Left rail. `true` colours it from `kindKey`/`kind` via `flowKindColor`;
   * a string is used as the rail colour; a node is rendered inside the rail
   * (a coverage bar, an icon).
   */
  rail?: boolean | string | ReactNode;
  /** Trailing slot in the header (badge, menu button). */
  trailing?: ReactNode;
  /**
   * Visual state. `selected` is also set when React Flow passes `selected`
   * (`<FlowNode selected={props.selected}>`); the others are the consumer's.
   */
  state?: FlowNodeState;
  /** React Flow's `selected` flag, forwarded as `state="selected"` when no other state is set. */
  selected?: boolean;
  /** Handles (`<Handle>` from `@xyflow/react`). Rendered inside the shell so they inherit the theme. */
  handles?: ReactNode;
  /** Width in px. Default: content width, min 160. */
  width?: number | string;
}

/**
 * Themed shell for custom React Flow nodes. Renders a card with a kind
 * label, title, body, monospace slot and a coloured rail, and exposes
 * `data-state` so selection, highlight, dim and danger styling come from
 * the stylesheet rather than inline styles.
 *
 * ```tsx
 * const nodeTypes = {
 *   service: (p: NodeProps<ServiceNode>) => (
 *     <FlowNode kind={p.data.kind} title={p.data.name} selected={p.selected} rail
 *       handles={<><Handle type="target" position={Position.Top} /><Handle type="source" position={Position.Bottom} /></>}>
 *       {p.data.summary}
 *     </FlowNode>
 *   ),
 * };
 * ```
 */
export const FlowNode = forwardRef<HTMLDivElement, FlowNodeProps>(function FlowNode(
  {
    kind,
    kindKey,
    kinds,
    title,
    children,
    mono,
    rail,
    trailing,
    state,
    selected,
    handles,
    width,
    className,
    style,
    ...props
  },
  ref
) {
  const resolvedState: FlowNodeState | undefined = state ?? (selected ? "selected" : undefined);
  const railKey = kindKey ?? (typeof kind === "string" || typeof kind === "number" ? kind : undefined);
  let railStyle: CSSProperties | undefined;
  let railContent: ReactNode = null;
  if (rail === true) {
    railStyle = railKey !== undefined ? { background: flowKindColor(railKey, kinds) } : undefined;
  } else if (typeof rail === "string") {
    railStyle = { background: rail };
  } else if (rail) {
    railContent = rail;
  }
  const hasHeader = kind !== undefined || title !== undefined || trailing !== undefined;
  return (
    <div
      ref={ref}
      className={cx("vf-flow-node", rail ? "vf-flow-node--railed" : null, className)}
      data-state={resolvedState}
      style={width !== undefined ? { ...style, width } : style}
      {...props}
    >
      {rail ? (
        <span className="vf-flow-node__rail" style={railStyle} aria-hidden="true">
          {railContent}
        </span>
      ) : null}
      <div className="vf-flow-node__main">
        {hasHeader ? (
          <div className="vf-flow-node__header">
            <div className="vf-flow-node__heading">
              {kind !== undefined ? <span className="vf-flow-node__kind">{kind}</span> : null}
              {title !== undefined ? <span className="vf-flow-node__title">{title}</span> : null}
            </div>
            {trailing !== undefined ? <span className="vf-flow-node__trailing">{trailing}</span> : null}
          </div>
        ) : null}
        {children !== undefined && children !== null ? (
          <div className="vf-flow-node__body">{children}</div>
        ) : null}
        {mono !== undefined && mono !== null ? <div className="vf-flow-node__mono">{mono}</div> : null}
      </div>
      {handles}
    </div>
  );
});
FlowNode.displayName = "FlowNode";

/** Alias: the shell is also useful outside React Flow (legends, previews). */
export const ReactFlowNodeShell = FlowNode;
