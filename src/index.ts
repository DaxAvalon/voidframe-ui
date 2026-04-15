// ═══════════════════════════════════════════════════════════════
//  VOIDFRAME v1.0
//  Dark monochrome React UI framework
//  Terminal-brutalist · Monospace-first · Data-dense
// ═══════════════════════════════════════════════════════════════

// ── Tokens & Theming ────────────────────────────────────────
export { defaultTokens, createTheme, lightTheme, tint } from "./tokens";
export type { VoidframeTokens, ThemeOverrides } from "./tokens";

// ── Shared types ────────────────────────────────────────────
export type {
  Size,
  Accent,
  SemanticColor,
  Side,
  Alignment,
  ToastType,
  BaseProps,
} from "./types";

// ── Provider ────────────────────────────────────────────────
export { VoidframeProvider, useTokens } from "./provider/VoidframeProvider";
export type { VoidframeProviderProps } from "./provider/VoidframeProvider";

// ── Primitives ──────────────────────────────────────────────
export * from "./primitives";

// ── Components ──────────────────────────────────────────────
export * from "./components";

// ── Hooks ───────────────────────────────────────────────────
export {
  useHover,
  useFocus,
  useToggle,
  useClickOutside,
  useDebounce,
  useMediaQuery,
  useLocalStorage,
  useInterval,
  useKeyboardShortcut,
  useCopyToClipboard,
  useScroll,
  useWindowSize,
  usePrevious,
  useForceUpdate,
  useControllableState,
  useMergedRefs,
  useId,
  useIsomorphicLayoutEffect,
  ShortcutProvider,
  useShortcut,
  useShortcutRegistry,
} from "./hooks";
export type {
  HoverBindings,
  UseHoverReturn,
  FocusBindings,
  UseFocusReturn,
  KeyModifiers,
  UseCopyToClipboardReturn,
  ScrollPosition,
  WindowSize,
  UseControllableStateOptions,
} from "./hooks";

// ── Architecture utilities ──────────────────────────────────
export {
  cx,
  warn,
  warnOnce,
  setLogger,
  getLogger,
  createSafeContext,
  genericForwardRef,
  deprecatedProp,
  deprecatedComponent,
} from "./utils";
export type {
  ClassValue,
  VoidframeLogger,
  SafeContextOptions,
  SafeContextTuple,
  AsProp,
  PolymorphicComponentProps,
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "./utils";

// ── Utilities ───────────────────────────────────────────────
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
} from "./utils";
