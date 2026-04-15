"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * Use in any hook that measures DOM (positioning, scroll, resize) so SSR
 * doesn't print `useLayoutEffect does nothing on the server` warnings.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
