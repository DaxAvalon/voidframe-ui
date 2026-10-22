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
  subscribeWarnings,
  getWarningHistory,
  clearWarningHistory,
  type VoidframeLogger,
  type WarningEntry,
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
export { safeHref, safeHrefOrWarn, type SafeHrefOptions } from "./safeHref";
export { sanitizeHtml, ensureSanitizer, isSanitizerReady, type SanitizeProfile } from "./sanitizeHtml";

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

// Phase 2 new utilities.
export {
  zodAdapter,
  yupAdapter,
  valibotAdapter,
  customAdapter,
  type FormValidator,
} from "./formValidation";
export {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  hslToRgb,
  lighten,
  darken,
  setAlpha,
  mix,
  luminance,
  contrastRatio,
  isAccessible,
  mostReadable,
  parseColor,
  isValidColor,
} from "./color";
export {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
  isFocusable,
  isTabbable,
} from "./focus";
export { announce, clearAnnouncer } from "./announce";
export { mergeStyles } from "./mergeStyles";
export { invariant, invariantViolation } from "./invariant";
export { pick, omit, splitProps } from "./object";
export { composeEventHandlers, composeEventHandlersAlways } from "./composeEventHandlers";
export { isClient, isServer, isTest, isDev } from "./environment";
export {
  DEFAULT_PORTAL_ID,
  getPortalContainer,
  releasePortalContainer,
} from "./portalContainer";
export {
  getCookie,
  setCookie,
  deleteCookie,
  getAllCookies,
  hasCookie,
  type CookieOptions,
} from "./cookie";
export {
  staggerDelay,
  getStaggerDelay,
  staggerAnimation,
} from "./animationSequence";
export { responsiveClasses, breakpointClass } from "./responsiveClasses";

// Standardization helpers.
export { toneAttrs, type ToneAttrs, type ToneAttrsInput } from "./toneAttrs";
export { buttonDisabledAttrs, type DisabledAttrs } from "./buttonDisabledAttrs";
export { hasAccessibleGridAncestor } from "./hasAccessibleGridAncestor";
export { auditTokens, warnUnknownTokens, resetTokenAudit } from "./auditTokens";
export { readToken, readTokens } from "./readToken";
export { toISODate, isoMonth, parseISODate } from "./date";
export { MINUS, INFINITY, MIDDLE_DOT, withMinus } from "./glyphs";
export type { FormatBytesOptions } from "./formatters";
export {
  toBinding,
  parseChord,
  normalizeKeyName,
  bindingEquals,
  matchesKeyboardEvent,
  bindingFromKeyboardEvent,
  bindingParts,
  bindingLabel,
  bindingKeyshortcut,
  codeLabel,
  detectPlatform,
  assignBinding,
  findBindingOwner,
  KEY_ALIASES_MAC,
  KEY_ALIASES_PC,
} from "./binding";
export type {
  Binding,
  BindingKind,
  BindingInput,
  BindingPlatform,
  BindingAssignments,
  AssignBindingResult,
  ParsedChord,
  MatchOptions,
} from "./binding";
export type { ReadTokenOptions } from "./readToken";
export type { TokenAuditResult } from "./auditTokens";
export { selectableAttrs } from "./selectable";
export type { SelectableInput, SelectableOutput } from "./selectable";
export { createNavModel } from "./navModel";
export type { NavNode, NavModel, NavModelItem, CreateNavModelOptions } from "./navModel";
