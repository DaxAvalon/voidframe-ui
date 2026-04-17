"use client";

import { useCallback, useEffect, useState } from "react";

export interface OrientationState {
  angle: number;
  type: string;
  isPortrait: boolean;
  isLandscape: boolean;
  isSupported: boolean;
}

const defaultState: OrientationState = {
  angle: 0,
  type: "portrait-primary",
  isPortrait: true,
  isLandscape: false,
  isSupported: false,
};

const isBrowser = typeof window !== "undefined";

function getOrientation(): OrientationState {
  if (!isBrowser) return defaultState;

  const so = screen?.orientation;
  if (so) {
    const type = so.type;
    const isPortrait = type.startsWith("portrait");
    return {
      angle: so.angle,
      type,
      isPortrait,
      isLandscape: !isPortrait,
      isSupported: true,
    };
  }

  // Fallback: compare dimensions
  const isPortrait = window.innerHeight >= window.innerWidth;
  return {
    angle: 0,
    type: isPortrait ? "portrait-primary" : "landscape-primary",
    isPortrait,
    isLandscape: !isPortrait,
    isSupported: false,
  };
}

/**
 * Track device orientation via the Screen Orientation API.
 *
 * Falls back to comparing `innerWidth`/`innerHeight` when the API is
 * unavailable. SSR-safe — returns portrait defaults with `isSupported: false`.
 */
export function useOrientation(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>(getOrientation);

  const update = useCallback(() => {
    setOrientation(getOrientation());
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const so = screen?.orientation;
    if (so) {
      so.addEventListener("change", update);
      return () => so.removeEventListener("change", update);
    }

    // Fallback: listen for resize
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return orientation;
}
