"use client";

import { useEffect, useState } from "react";

/**
 * Returns `false` during the first render, `true` after mount.
 * Use to gate client-only content and avoid SSR hydration mismatches.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
