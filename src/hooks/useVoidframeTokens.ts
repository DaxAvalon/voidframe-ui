"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { readTokens } from "../utils/readToken";

export interface UseVoidframeTokensOptions {
  /**
   * Element to read from. Pass the ref of a node inside a `ThemeScope` to
   * read that scope's values. Default `document.documentElement`.
   */
  ref?: RefObject<Element | null>;
  /** Fallbacks used until the DOM is available and for unset tokens. */
  fallbacks?: Partial<Record<string, string>>;
}

const THEME_ATTRIBUTES = [
  "data-vf-theme",
  "data-vf-contrast",
  "data-vf-density",
  "data-vf-scale",
  "data-vf-motion",
];

/**
 * Resolve `--vf-*` tokens to concrete values and keep them current.
 *
 * Re-reads when a `data-vf-theme` (or contrast / density / scale) attribute
 * changes anywhere in the document, when the root element's `class` or
 * inline `style` changes, and when the OS colour scheme flips. The first
 * render returns the `fallbacks` (or `""`) so server and client markup
 * agree; the real values arrive in an effect.
 *
 * ```tsx
 * const t = useVoidframeTokens(["accent", "bg-2", "chart-1"]);
 * <MiniMap nodeColor={() => t["chart-1"]} maskColor={t["bg-2"]} />
 * ```
 */
export function useVoidframeTokens<K extends string>(
  names: readonly K[],
  options: UseVoidframeTokensOptions = {}
): Record<K, string> & { refresh: () => void } {
  // Inline array literals change identity every render; key on the joined
  // names and read the latest array through a ref.
  const key = names.join("|");
  const namesRef = useRef(names);
  namesRef.current = names;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const read = useCallback((): Record<K, string> => {
    const opts = optionsRef.current;
    return readTokens(namesRef.current, {
      element: opts.ref?.current ?? undefined,
      fallbacks: opts.fallbacks as Partial<Record<K, string>> | undefined,
    });
  }, [key]);

  const [values, setValues] = useState<Record<K, string>>(() => {
    const out = {} as Record<K, string>;
    for (const n of names) out[n] = options.fallbacks?.[n] ?? "";
    return out;
  });

  const refresh = useCallback(() => {
    const next = read();
    setValues((prev) => {
      for (const n of namesRef.current) if (prev[n] !== next[n]) return next;
      return prev;
    });
  }, [read]);

  useEffect(() => {
    refresh();
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const observers: MutationObserver[] = [];
    if (typeof MutationObserver !== "undefined") {
      const rootObs = new MutationObserver(refresh);
      rootObs.observe(root, { attributes: true, attributeFilter: ["class", "style", ...THEME_ATTRIBUTES] });
      observers.push(rootObs);
      const treeObs = new MutationObserver(refresh);
      treeObs.observe(root, { attributes: true, subtree: true, attributeFilter: THEME_ATTRIBUTES });
      observers.push(treeObs);
    }
    const mq =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    mq?.addEventListener?.("change", refresh);
    return () => {
      for (const o of observers) o.disconnect();
      mq?.removeEventListener?.("change", refresh);
    };
  }, [refresh]);

  return Object.assign({}, values, { refresh });
}
