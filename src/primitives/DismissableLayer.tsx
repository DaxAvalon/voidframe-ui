"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useMergedRefs } from "../hooks/useMergedRefs";

// Shared stack so nested layers only dismiss in topmost-first order.
// Escape only fires on the top layer; outside clicks bubble from top.
const layerStack: DismissableLayerHandle[] = [];

interface DismissableLayerHandle {
  element: HTMLElement | null;
}

export interface DismissableLayerProps extends HTMLAttributes<HTMLDivElement> {
  /** Fires on Escape if this layer is topmost. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  /** Fires on pointer-down outside the layer. */
  onPointerDownOutside?: (e: PointerEvent) => void;
  /** Shorthand: fires for both Escape and outside pointer-down. */
  onDismiss?: () => void;
  children?: ReactNode;
}

/**
 * Handles Escape-to-dismiss and click-outside-to-dismiss for overlays.
 * Stacks correctly with nested layers: only the topmost responds to Escape.
 *
 * Does NOT trap focus — compose with `<FocusScope>` for full modal semantics.
 */
export const DismissableLayer = forwardRef<HTMLDivElement, DismissableLayerProps>(
  function DismissableLayer(
    { onEscapeKeyDown, onPointerDownOutside, onDismiss, children, ...props },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, innerRef);

    // Latest-callback refs so handlers don't force re-subscription.
    const escRef = useRef(onEscapeKeyDown);
    const outRef = useRef(onPointerDownOutside);
    const dismissRef = useRef(onDismiss);
    useEffect(() => {
      escRef.current = onEscapeKeyDown;
      outRef.current = onPointerDownOutside;
      dismissRef.current = onDismiss;
    });

    useEffect(() => {
      const handle: DismissableLayerHandle = {
        element: innerRef.current,
      };
      layerStack.push(handle);
      return () => {
        const i = layerStack.indexOf(handle);
        if (i !== -1) layerStack.splice(i, 1);
      };
    }, []);

    // Topmost = no descendant layer exists (an inner nested layer wins) AND
    // no later-pushed sibling layer exists (a more-recently-opened portal wins).
    // Using push order alone fails for nested non-portaled layers because
    // React mounts child effects before parent; using DOM containment alone
    // fails for portaled siblings at document.body. Both checks together
    // handle both topologies.
    const isTopmost = (): boolean => {
      const me = innerRef.current;
      if (!me) return false;
      const myIdx = layerStack.findIndex((l) => l.element === me);
      if (myIdx === -1) return false;
      for (let i = 0; i < layerStack.length; i++) {
        const other = layerStack[i];
        if (!other?.element || other.element === me) continue;
        if (me.contains(other.element)) return false;
        if (i > myIdx && !other.element.contains(me)) return false;
      }
      return true;
    };

    // Escape — fires for the topmost layer only.
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        if (!isTopmost()) return;
        escRef.current?.(e);
        dismissRef.current?.();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Outside pointer-down — fires only for the topmost layer. Non-modal
    // portaled elements (Toaster, etc.) can opt out by setting
    // `data-vf-ignore-outside-click="true"` on an ancestor so their own
    // buttons don't trip outside-click dismissal of whatever is open.
    useEffect(() => {
      const onPointer = (e: PointerEvent) => {
        const target = e.target as Node | null;
        const el = innerRef.current;
        if (!el || !target) return;
        if (el.contains(target)) return;
        if (target instanceof Element && target.closest("[data-vf-ignore-outside-click='true']")) {
          return;
        }
        if (!isTopmost()) return;
        outRef.current?.(e);
        dismissRef.current?.();
      };
      document.addEventListener("pointerdown", onPointer);
      return () => document.removeEventListener("pointerdown", onPointer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div ref={mergedRef} {...props}>
        {children}
      </div>
    );
  }
);
DismissableLayer.displayName = "DismissableLayer";
