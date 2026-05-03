// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Slot } from "voidframe-ui/primitives"`
// and drop every non-Primitives component from their bundle.
//
// Source of truth: docs/taxonomy.ts Primitives prefix rule (src/primitives/).
//
// NOTE: explicit named re-exports rather than `export * from "../primitives"`.
// vite-plugin-dts with `rollupTypes: true` produces an empty `export {}`
// for star-only barrel entries — the explicit list below is what makes
// `dist/types/primitives.d.ts` populate with real declarations so
// TypeScript consumers of the `/primitives` subpath get autocomplete +
// type-checking. (Report row 3 / suggestion 2.)

export { Slot, mergeSlotProps } from "../primitives";
export type { SlotProps } from "../primitives";

export { Portal } from "../primitives";
export type { PortalProps } from "../primitives";

export { VisuallyHidden, visuallyHiddenStyle } from "../primitives";
export type { VisuallyHiddenProps } from "../primitives";

export { LiveRegion } from "../primitives";
export type { LiveRegionProps, LiveRegionPoliteness } from "../primitives";

export { AccessibleIcon } from "../primitives";
export type { AccessibleIconProps } from "../primitives";

export { FocusScope } from "../primitives";
export type { FocusScopeProps } from "../primitives";

export { DismissableLayer } from "../primitives";
export type { DismissableLayerProps } from "../primitives";

export { Presence } from "../primitives";
export type { PresenceProps } from "../primitives";

export { RovingFocusGroup, RovingFocusItem } from "../primitives";
export type {
  RovingFocusGroupProps,
  RovingFocusItemProps,
} from "../primitives";

export { ScrollLock } from "../primitives";
export type { ScrollLockProps } from "../primitives";

export { Separator } from "../primitives";
export type { SeparatorProps } from "../primitives";

export { ErrorBoundary } from "../primitives";
export type { ErrorBoundaryProps } from "../primitives";

export { SkipToContent } from "../primitives";
export type { SkipToContentProps } from "../primitives";

export { Transition } from "../primitives";
export type { TransitionProps, TransitionType } from "../primitives";

export { HydrationBoundary } from "../primitives";
export type { HydrationBoundaryProps } from "../primitives";
