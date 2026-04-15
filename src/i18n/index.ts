// Phase 17 — i18n public surface

export {
  enMessages,
  mergeMessages,
  resolvePath,
} from "./messages";
export type {
  VoidframeMessages,
  PartialMessages,
  MessageTemplate,
} from "./messages";

export {
  MessagesProvider,
  useMessages,
  useI18n,
} from "./MessagesProvider";
export type {
  I18nContextValue,
  MessagesProviderProps,
} from "./MessagesProvider";

export { pluralize } from "./plural";
export type { PluralForms } from "./plural";

export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
  formatList,
} from "./format";

export { pseudolocalize } from "./pseudo";

export * from "./locales";
