"use client";

import { useCallback, useState } from "react";

export interface UseClipboardReadReturn {
  read: () => Promise<string>;
  text: string | null;
  loading: boolean;
  error: Error | null;
  isSupported: boolean;
}

/**
 * Read from the clipboard. Manages loading/error state.
 */
export function useClipboardRead(): UseClipboardReadReturn {
  const isSupported =
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard !== "undefined" &&
    typeof navigator.clipboard.readText === "function";

  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(async (): Promise<string> => {
    if (!isSupported) {
      const err = new Error("Clipboard API not supported");
      setError(err);
      throw err;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await navigator.clipboard.readText();
      setText(result);
      setError(null);
      setLoading(false);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [isSupported]);

  return { read, text, loading, error, isSupported };
}
