"use client";

import { useId as reactUseId } from "react";

/**
 * SSR-safe stable ID. Wraps React 18's `useId` with a Voidframe prefix
 * convention so generated IDs are easy to spot in the DOM and DevTools.
 *
 * @param providedId If the consumer passes their own ID, use it verbatim.
 * @param prefix     Convention prefix (default `"vf"`).
 */
export function useId(providedId?: string, prefix: string = "vf"): string {
  const generated = reactUseId();
  return providedId ?? `${prefix}-${generated.replace(/:/g, "")}`;
}
