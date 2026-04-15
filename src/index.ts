// ═══════════════════════════════════════════════════════════════
//  VOIDFRAME v1.0
//  Dark monochrome React UI framework
//  Terminal-brutalist · Monospace-first · Data-dense
// ═══════════════════════════════════════════════════════════════

// ── Tokens & Theming ────────────────────────────────────────
export { defaultTokens, createTheme, tint } from "./tokens";
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
export {
  VoidframeProvider,
  useTokens,
  useThemeScope,
} from "./provider/VoidframeProvider";
export type {
  VoidframeProviderProps,
  ThemeName,
  VoidframeDensity,
  VoidframeContrast,
  VoidframeDirection,
  VoidframeReducedMotion,
} from "./provider/VoidframeProvider";
export { ThemeScope } from "./provider/ThemeScope";
export type { ThemeScopeProps } from "./provider/ThemeScope";

// ── Themes ──────────────────────────────────────────────────
export {
  darkTheme,
  lightTheme,
  midnightTheme,
  greyTheme,
  tokensToCssVars,
  THEME_NAMES,
} from "./themes";
export type { BuiltInThemeName } from "./themes";

// ── Primitives ──────────────────────────────────────────────
export * from "./primitives";

// ── Components ──────────────────────────────────────────────
export * from "./components";

// ── Icons (Phase 14) ────────────────────────────────────────
export * from "./icons";

// ── Lazy wrappers (Phase 20) ────────────────────────────────
// Code-split entry points for the heaviest components. Wrap in
// React.Suspense at the consumer site to defer the bundle cost until
// the component is mounted. Full re-exports live under `voidframe/lazy`.
export * from "./lazy";

// ── Dev Experience (Phase 25) ───────────────────────────────
export * from "./dev";

// ── Responsive system (Phase 16) ────────────────────────────
export * from "./responsive";

// ── i18n (Phase 17) ─────────────────────────────────────────
export {
  enMessages,
  mergeMessages,
  resolvePath,
  MessagesProvider,
  useMessages,
  useI18n,
  pluralize,
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
  formatList,
  pseudolocalize,
  en,
  es,
  fr,
  de,
  ja,
  zhCN,
  ar,
  he,
  enXA,
  LOCALE_PACKS,
} from "./i18n";
export type {
  VoidframeMessages,
  PartialMessages,
  MessageTemplate,
  I18nContextValue,
  MessagesProviderProps,
  PluralForms,
  LocalePack,
} from "./i18n";

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
  useThemePersistence,
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
