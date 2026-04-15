"use client";

import { useEffect, useState } from "react";

export type PageVisibility = "visible" | "hidden";

/**
 * `document.visibilityState` reactive. Returns `"visible"` on the server.
 */
export function usePageVisibility(): PageVisibility {
  const [state, setState] = useState<PageVisibility>(() => {
    if (typeof document === "undefined") return "visible";
    return (document.visibilityState as PageVisibility) ?? "visible";
  });

  useEffect(() => {
    const handler = () =>
      setState((document.visibilityState as PageVisibility) ?? "visible");
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return state;
}
