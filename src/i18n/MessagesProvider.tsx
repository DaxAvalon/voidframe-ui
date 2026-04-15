"use client";

// Phase 17 — MessagesProvider
//
// Holds the resolved message catalog + locale metadata. Runs underneath
// VoidframeProvider (or standalone) and exposes `useMessages()` /
// `useI18n()` for components and consumers.

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  enMessages,
  mergeMessages,
  resolvePath,
  type PartialMessages,
  type VoidframeMessages,
} from "./messages";
import type { LocalePack } from "./locales/types";

export interface I18nContextValue {
  messages: VoidframeMessages;
  locale: string;
  firstDayOfWeek: number;
  timeZone?: string;
  direction: "ltr" | "rtl";
  /** Resolve a path like "pagination.next" into a localized string. */
  t: (path: string, args?: Record<string, unknown>) => string;
}

const defaultValue: I18nContextValue = {
  messages: enMessages,
  locale: "en",
  firstDayOfWeek: 0,
  direction: "ltr",
  t: (path, args) => resolvePath(enMessages, path, args),
};

const MessagesContext = createContext<I18nContextValue>(defaultValue);

export interface MessagesProviderProps {
  /** Full locale pack — messages + metadata. */
  locale?: LocalePack;
  /** Partial message overrides layered on top of `locale` (or English). */
  messages?: PartialMessages;
  /** Override the locale tag (for format utilities). */
  localeTag?: string;
  /** 0 = Sunday … 6 = Saturday. Derived from the locale pack when omitted. */
  firstDayOfWeek?: number;
  timeZone?: string;
  /** Override direction independently of the locale pack. */
  direction?: "ltr" | "rtl";
  children?: ReactNode;
}

/**
 * Standalone messages provider. `VoidframeProvider` wires this in
 * automatically when you pass i18n props, but you can also wrap a
 * subtree in `<MessagesProvider>` directly.
 */
export function MessagesProvider({
  locale,
  messages,
  localeTag,
  firstDayOfWeek,
  timeZone,
  direction,
  children,
}: MessagesProviderProps) {
  const value = useMemo<I18nContextValue>(() => {
    const resolvedMessages = mergeMessages(
      mergeMessages(enMessages, locale?.messages),
      messages
    );
    const resolvedLocale = localeTag ?? locale?.locale ?? "en";
    const resolvedDirection = direction ?? locale?.direction ?? "ltr";
    const resolvedFirstDay = firstDayOfWeek ?? locale?.firstDayOfWeek ?? 0;
    return {
      messages: resolvedMessages,
      locale: resolvedLocale,
      firstDayOfWeek: resolvedFirstDay,
      timeZone,
      direction: resolvedDirection,
      t: (path: string, args?: Record<string, unknown>) =>
        resolvePath(resolvedMessages, path, args),
    };
  }, [locale, messages, localeTag, firstDayOfWeek, timeZone, direction]);

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

/** Access resolved messages + the `t()` helper. */
export function useMessages(): I18nContextValue {
  return useContext(MessagesContext);
}

/** Alias when you want the broader i18n surface (locale/direction/etc.). */
export const useI18n = useMessages;

export { MessagesContext as _MessagesContextForTesting };
