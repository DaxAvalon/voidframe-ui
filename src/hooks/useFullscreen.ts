"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enter: (element?: Element) => Promise<void>;
  exit: () => Promise<void>;
  toggle: (element?: Element) => Promise<void>;
  element: Element | null;
}

function getFullscreenElement(): Element | null {
  if (typeof document === "undefined") return null;
  return (
    document.fullscreenElement ??
    (document as any).webkitFullscreenElement ??
    null
  );
}

function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  return !!(
    document.documentElement.requestFullscreen ??
    (document.documentElement as any).webkitRequestFullscreen
  );
}

/**
 * Enter, exit, and toggle fullscreen mode.
 */
export function useFullscreen(
  ref?: RefObject<Element | null>
): UseFullscreenReturn {
  const isSupported = isFullscreenSupported();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  // Keep ref stable for the event handler
  const refValue = useRef(ref);
  refValue.current = ref;

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handler = () => {
      const el = getFullscreenElement();
      setIsFullscreen(!!el);
      setElement(el);
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);

    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const enter = useCallback(
    async (target?: Element) => {
      if (!isSupported) return;
      const el =
        target ?? refValue.current?.current ?? document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }
    },
    [isSupported]
  );

  const exit = useCallback(async () => {
    if (!isSupported) return;
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    }
  }, [isSupported]);

  const toggle = useCallback(
    async (target?: Element) => {
      if (getFullscreenElement()) {
        await exit();
      } else {
        await enter(target);
      }
    },
    [enter, exit]
  );

  return { isFullscreen, isSupported, enter, exit, toggle, element };
}
