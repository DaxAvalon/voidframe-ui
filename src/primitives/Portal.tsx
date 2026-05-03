"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useThemeScope } from "../provider/VoidframeProvider";
import { ThemeScope } from "../provider/ThemeScope";

export interface PortalProps {
  children: ReactNode;
  /** Target container. Defaults to `document.body`. */
  container?: HTMLElement | null;
  /**
   * When true, the portaled subtree is wrapped in a `<ThemeScope>` mirroring
   * the nearest ancestor's resolved theme. Defaults to `true` so portaled
   * overlays (Dialog, DrawerV2, Menu, ContextMenu, Tooltip, Popover, Toaster,
   * etc.) inherit the active theme even when:
   *
   * - the consumer ran `<VoidframeProvider scope="root">` (no documentElement
   *   write), and / or
   * - a nested `<ThemeScope themeName="…">` overrode theme for a subtree
   *   that contains the portal trigger.
   *
   * Set to `false` for portaled content that needs to render outside the
   * voidframe theme cascade (very rare — e.g. embedding a third-party widget
   * with its own theming).
   */
  inheritTheme?: boolean;
}

/**
 * Render children into a detached DOM node. Returns `null` until mount so
 * SSR matches the client HTML.
 */
export function Portal({
  children,
  container,
  inheritTheme = true,
}: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const scope = useThemeScope();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const target =
    container ??
    (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;
  const body =
    inheritTheme && scope ? (
      <ThemeScope
        themeName={scope.themeName}
        density={scope.density}
        contrast={scope.contrast}
        direction={scope.direction}
        reducedMotion={scope.reducedMotion}
        inline
      >
        {children}
      </ThemeScope>
    ) : (
      children
    );
  return createPortal(body, target);
}
