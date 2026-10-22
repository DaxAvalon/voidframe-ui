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

/**
 * The one tone vocabulary every tone-bearing prop accepts: the four semantic
 * colours plus `neutral`. Components that take a `tone` prop use this type
 * (or a documented subset of it), so a status enum mapped once to `Tone`
 * works everywhere.
 */
export type Tone = "neutral" | SemanticColor;

/**
 * A palette hue for status enums with more than five states (pending, in
 * review, in CI, blocked, …). Components with a `hue` prop fill from
 * `--vf-{hue}-20` and colour text with `--vf-{hue}`. `Accent` is the same
 * set; `Hue` is the name used on props.
 */
export type Hue = Accent;

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
