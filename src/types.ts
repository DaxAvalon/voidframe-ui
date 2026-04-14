// ═══════════════════════════════════════════════════════════════
// VOIDFRAME — SHARED TYPES
// Types used across components, hooks, and utilities.
// ═══════════════════════════════════════════════════════════════

import type { CSSProperties, ReactNode } from "react";

/** Discrete size scale. Maps to token font/spacing steps. */
export type Size = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl";

/** Accent palette keys. */
export type Accent =
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "purple"
  | "cyan"
  | "rose";

/** Semantic role aliases. */
export type SemanticColor = "success" | "danger" | "warning" | "info";

/** Placement sides for overlays/tooltips. */
export type Side = "top" | "right" | "bottom" | "left";

/** Flex alignment values. */
export type Alignment =
  | "start"
  | "center"
  | "end"
  | "stretch"
  | "baseline"
  | "flex-start"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";

/** Toast / alert severity. */
export type ToastType = "info" | "success" | "warning" | "danger";

/** Layout orientation. */
export type Orientation = "horizontal" | "vertical";

/** Common props every component accepts. */
export interface BaseProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
}
