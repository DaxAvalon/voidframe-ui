// Pure helpers (Phase 1) — public API unchanged.
export {
  formatNumber,
  formatBytes,
  formatDuration,
  timeAgo,
  truncate,
  clamp,
  mapRange,
  stringToColor,
  adjustColor,
  deepMerge,
  uid,
  groupBy,
  sortBy,
  copyToClipboard,
} from "./formatters";

// Architecture utilities (Phase 2).
export { cx, type ClassValue } from "./cx";
export {
  warn,
  warnOnce,
  setLogger,
  getLogger,
  type VoidframeLogger,
  _resetWarnings,
} from "./warn";
export {
  createSafeContext,
  type SafeContextOptions,
  type SafeContextTuple,
} from "./createSafeContext";
export type {
  AsProp,
  PolymorphicComponentProps,
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
  PropsToOmit,
} from "./polymorphic";
export { genericForwardRef } from "./forwardRef";
export { deprecatedProp, deprecatedComponent } from "./deprecate";

// Date helpers (Phase 7.2).
export {
  startOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  getMonthGrid,
  weekdayNames,
  monthName,
  formatDate,
  parseDate,
  clampDate,
} from "./date";
