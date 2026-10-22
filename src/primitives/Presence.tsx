"use client";

import { getElementRef } from "./getElementRef";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { useMergedRefs } from "../hooks/useMergedRefs";

export interface PresenceProps {
  /** When false, the child unmounts *after* finishing its CSS exit animation. */
  present: boolean;
  children: ReactNode;
}

/**
 * Keep a child mounted long enough to play its CSS exit animation.
 *
 * The child is expected to:
 * 1. Read its `data-state` attribute (`"open"` or `"closed"`) for CSS targeting.
 * 2. Define `animation` / `transition` for each state.
 *
 * Presence watches `animationend` / `transitionend` on the child, so ensure
 * the exit rule sets a real animation or transition — otherwise the child
 * unmounts synchronously.
 */
export function Presence({ present, children }: PresenceProps) {
  const [mounted, setMounted] = useState(present);
  const [state, setState] = useState<"open" | "closed">(
    present ? "open" : "closed"
  );
  const nodeRef = useRef<HTMLElement | null>(null);

  // useMergedRefs is called unconditionally to satisfy hooks rules.
  // `childRef` is undefined when there's no valid element child — that's fine.
  // `getElementRef` reads the React 18 (`element.ref`) or React 19
  // (`props.ref`) shape without triggering React 19's deprecation getter.
  const childRef: Ref<HTMLElement> | null = getElementRef<HTMLElement>(children);
  const mergedRef = useMergedRefs<HTMLElement>(nodeRef, childRef);

  useEffect(() => {
    if (present) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setState("open"));
      return () => cancelAnimationFrame(raf);
    }
    if (!mounted) return;
    setState("closed");

    const node = nodeRef.current;
    if (!node) {
      setMounted(false);
      return;
    }
    const style = window.getComputedStyle(node);
    const hasAnimation =
      style.animationName !== "none" && parseFloat(style.animationDuration) > 0;
    const hasTransition = parseFloat(style.transitionDuration) > 0;
    if (!hasAnimation && !hasTransition) {
      setMounted(false);
      return;
    }

    const onEnd = (e: AnimationEvent | TransitionEvent) => {
      if (e.target !== node) return;
      setMounted(false);
    };
    node.addEventListener("animationend", onEnd as EventListener);
    node.addEventListener("transitionend", onEnd as EventListener);
    return () => {
      node.removeEventListener("animationend", onEnd as EventListener);
      node.removeEventListener("transitionend", onEnd as EventListener);
    };
  }, [present, mounted]);

  if (!mounted) return null;
  if (!isValidElement(children)) return <>{children}</>;

  return cloneElement(children as ReactElement, {
    "data-state": state,
    ref: mergedRef,
  } as never);
}
