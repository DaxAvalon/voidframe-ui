"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseScrollHighlightOptions {
  /** How long the highlight attribute stays on. Default 1600 ms. */
  highlightMs?: number;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  /** Highlight the element named by `location.hash` on mount and on `hashchange`. Default true. */
  fromHash?: boolean;
  /** Attribute set on the target while highlighted. Default `data-highlight`. */
  attribute?: string;
}

export interface UseScrollHighlightReturn {
  /** Scroll the element with this id into view and flash it. Returns false when not found. */
  highlight: (id: string) => boolean;
  /** Id currently highlighted. */
  activeId: string | null;
}

/**
 * Deep-link helper: scroll an element into view and flag it with
 * `data-highlight` for a moment so the stylesheet can flash it
 * (`[data-highlight] { animation: … }`). Reacts to the URL hash.
 */
export function useScrollHighlight(options: UseScrollHighlightOptions = {}): UseScrollHighlightReturn {
  const { highlightMs = 1600, behavior = "smooth", block = "center", fromHash = true, attribute = "data-highlight" } = options;
  const [activeId, setActiveId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef<HTMLElement | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    current.current?.removeAttribute(attribute);
    current.current = null;
  }, [attribute]);

  const highlight = useCallback(
    (id: string): boolean => {
      if (typeof document === "undefined") return false;
      const el = document.getElementById(id);
      if (!el) return false;
      clear();
      el.scrollIntoView?.({ behavior, block });
      el.setAttribute(attribute, "true");
      current.current = el;
      setActiveId(id);
      timer.current = setTimeout(() => {
        el.removeAttribute(attribute);
        if (current.current === el) current.current = null;
        setActiveId((cur) => (cur === id ? null : cur));
      }, highlightMs);
      return true;
    },
    [attribute, behavior, block, clear, highlightMs]
  );

  useEffect(() => {
    if (!fromHash || typeof window === "undefined") return;
    const apply = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (id) highlight(id);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [fromHash, highlight]);

  useEffect(() => clear, [clear]);

  return { highlight, activeId };
}
