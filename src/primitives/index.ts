// ── Slot (Phase 2) ─────────────────────────────────────────────
export { Slot, mergeSlotProps, type SlotProps } from "./Slot";

// ── Portal ─────────────────────────────────────────────────────
export { Portal, type PortalProps } from "./Portal";

// ── A11y helpers ───────────────────────────────────────────────
export {
  VisuallyHidden,
  visuallyHiddenStyle,
  type VisuallyHiddenProps,
} from "./VisuallyHidden";
export {
  LiveRegion,
  type LiveRegionProps,
  type LiveRegionPoliteness,
} from "./LiveRegion";
export { AccessibleIcon, type AccessibleIconProps } from "./AccessibleIcon";

// ── Focus / dismissal / presence ───────────────────────────────
export { FocusScope, type FocusScopeProps } from "./FocusScope";
export {
  DismissableLayer,
  type DismissableLayerProps,
} from "./DismissableLayer";
export { Presence, type PresenceProps } from "./Presence";
export {
  RovingFocusGroup,
  RovingFocusItem,
  type RovingFocusGroupProps,
  type RovingFocusItemProps,
} from "./RovingFocusGroup";

// ── Page structure ─────────────────────────────────────────────
export { ScrollLock, type ScrollLockProps } from "./ScrollLock";
export { Separator, type SeparatorProps } from "./Separator";

// ── Error handling ─────────────────────────────────────────────
export { ErrorBoundary, type ErrorBoundaryProps } from "./ErrorBoundary";

// ── Skip link ──────────────────────────────────────────────────
export { SkipToContent, type SkipToContentProps } from "./SkipToContent";

// ── Animation ──────────────────────────────────────────────────
export {
  Transition,
  type TransitionProps,
  type TransitionType,
} from "./Transition";
