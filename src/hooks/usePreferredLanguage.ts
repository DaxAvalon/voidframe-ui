"use client";

import { useEffect, useState } from "react";

export interface PreferredLanguage {
  language: string;
  languages: readonly string[];
  baseLanguage: string;
}

const isBrowser = typeof window !== "undefined";

function getLanguageState(): PreferredLanguage {
  if (!isBrowser) {
    return { language: "en", languages: ["en"], baseLanguage: "en" };
  }
  const language = navigator.language || "en";
  const languages = navigator.languages?.length
    ? navigator.languages
    : [language];
  const baseLanguage = language.split("-")[0] ?? language;
  return { language, languages, baseLanguage };
}

/**
 * Track the user's preferred language(s) via `navigator.language`.
 *
 * Listens for the `languagechange` event to stay in sync.
 * SSR-safe — defaults to `"en"`.
 */
export function usePreferredLanguage(): PreferredLanguage {
  const [state, setState] = useState<PreferredLanguage>(getLanguageState);

  useEffect(() => {
    if (!isBrowser) return;

    const update = () => setState(getLanguageState());
    window.addEventListener("languagechange", update);
    return () => window.removeEventListener("languagechange", update);
  }, []);

  return state;
}
