"use client";

import { useCallback, useEffect, useRef } from "react";

export type AnnouncerPoliteness = "polite" | "assertive";

export interface AnnouncerApi {
  announce: (message: string, politeness?: AnnouncerPoliteness) => void;
}

/**
 * Announce dynamic messages to assistive tech via a shared `aria-live` region.
 * Creates two hidden regions (polite + assertive) once per page and reuses them.
 */
export function useAnnouncer(): AnnouncerApi {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Reuse existing regions if another hook instance already created them.
    const existingPolite = document.querySelector(
      '[data-vf-announcer="polite"]'
    ) as HTMLDivElement | null;
    const existingAssertive = document.querySelector(
      '[data-vf-announcer="assertive"]'
    ) as HTMLDivElement | null;

    const ensureRegion = (
      kind: AnnouncerPoliteness,
      existing: HTMLDivElement | null
    ): HTMLDivElement => {
      if (existing) return existing;
      const el = document.createElement("div");
      el.setAttribute("aria-live", kind);
      el.setAttribute("aria-atomic", "true");
      el.setAttribute("data-vf-announcer", kind);
      el.style.cssText =
        "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
      document.body.appendChild(el);
      return el;
    };

    politeRef.current = ensureRegion("polite", existingPolite);
    assertiveRef.current = ensureRegion("assertive", existingAssertive);
  }, []);

  const announce = useCallback(
    (message: string, politeness: AnnouncerPoliteness = "polite") => {
      const el =
        politeness === "assertive" ? assertiveRef.current : politeRef.current;
      if (!el) return;
      // Setting the same text twice doesn't re-announce; clear then set.
      el.textContent = "";
      // Next tick so screen readers pick up the change.
      setTimeout(() => {
        el.textContent = message;
      }, 50);
    },
    []
  );

  return { announce };
}
