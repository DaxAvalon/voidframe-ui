"use client";

import { useEffect, useRef } from "react";

export interface UseDocumentTitleOptions {
  restoreOnUnmount?: boolean;
  template?: string;
}

/**
 * Set the document title reactively.
 *
 * Supports a `%s` template and optional restore-on-unmount.
 */
export function useDocumentTitle(
  title: string,
  options?: UseDocumentTitleOptions
): void {
  const { restoreOnUnmount = true, template } = options ?? {};
  const previousTitle = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (previousTitle.current === undefined) {
      previousTitle.current = document.title;
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const formatted = template
      ? template.includes("%s")
        ? template.replace("%s", title)
        : template
      : title;
    document.title = formatted;
  }, [title, template]);

  useEffect(() => {
    return () => {
      if (typeof document === "undefined") return;
      if (restoreOnUnmount && previousTitle.current !== undefined) {
        document.title = previousTitle.current;
      }
    };
  }, [restoreOnUnmount]);
}
