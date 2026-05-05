"use client";

// Phase 11 — Marquee, Typewriter, Ticker
//
// Self-contained animation atoms — no external deps.

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { cx } from "../utils/cx";

// ── Marquee ─────────────────────────────────────────────────

export type MarqueeDirection = "left" | "right" | "up" | "down";

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Pixels per second. Default 50. */
  speed?: number;
  direction?: MarqueeDirection;
  pauseOnHover?: boolean;
  loop?: boolean;
  /** Gap between two duplicated content tracks. */
  gap?: number | string;
  children?: ReactNode;
}

/**
 * Scrolling marquee for long inline content. Respects
 * `prefers-reduced-motion` and pauses on hover.
 */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  {
    speed = 50,
    direction = "left",
    pauseOnHover = true,
    loop = true,
    gap = 32,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    if (reduced) return;
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const dim =
        direction === "left" || direction === "right"
          ? el.scrollWidth
          : el.scrollHeight;
      // Track is duplicated, so the visible content is dim/2.
      const distance = dim / 2;
      setDuration(distance / Math.max(1, speed));
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return;
  }, [direction, speed, children, reduced]);

  if (reduced) {
    return (
      <div ref={ref} className={cx("vf-marquee", className)} style={style} {...props}>
        {children}
      </div>
    );
  }

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const reverse = direction === "right" || direction === "down";

  const merged: CSSProperties = {
    ...style,
    "--vf-marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cx(
        "vf-marquee",
        `vf-marquee--${axis}`,
        reverse && "vf-marquee--reverse",
        pauseOnHover && "vf-marquee--pause-hover",
        !loop && "vf-marquee--no-loop",
        className
      )}
      style={merged}
      {...props}
    >
      <div ref={trackRef} className="vf-marquee__track">
        <div className="vf-marquee__group">{children}</div>
        <div className="vf-marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
});
Marquee.displayName = "Marquee";

// ── Typewriter ──────────────────────────────────────────────

export interface TypewriterProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Typing speed in characters per second. Default 20. */
  speed?: number;
  cursor?: boolean;
  /** Loop the animation by clearing + retyping. */
  loop?: boolean;
  /** Pause at end before looping (ms). */
  loopDelay?: number;
  /**
   * Fires every time the full string finishes typing. When `loop` is true
   * this fires per cycle (once before each clear + retype), not just the
   * first completion. Callers that only want the first completion should
   * gate inside the handler (e.g. a `useRef` sentinel).
   */
  onComplete?: () => void;
}

/**
 * Types out a string character by character. Respects
 * `prefers-reduced-motion` (renders immediately).
 */
export const Typewriter = forwardRef<HTMLSpanElement, TypewriterProps>(
  function Typewriter(
    {
      text,
      speed = 20,
      cursor = true,
      loop,
      loopDelay = 1500,
      onComplete,
      className,
      ...props
    },
    ref
  ) {
    const reduced = usePrefersReducedMotion();
    const [shown, setShown] = useState("");
    const idxRef = useRef(0);
    const handleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (reduced) {
        setShown(text);
        onComplete?.();
        return;
      }
      const stepMs = Math.max(8, 1000 / Math.max(1, speed));
      idxRef.current = 0;
      setShown("");
      const tick = () => {
        const next = text.slice(0, idxRef.current + 1);
        setShown(next);
        idxRef.current += 1;
        if (idxRef.current < text.length) {
          handleRef.current = setTimeout(tick, stepMs);
        } else {
          onComplete?.();
          if (loop) {
            handleRef.current = setTimeout(() => {
              idxRef.current = 0;
              setShown("");
              handleRef.current = setTimeout(tick, stepMs);
            }, loopDelay);
          }
        }
      };
      handleRef.current = setTimeout(tick, stepMs);
      return () => {
        if (handleRef.current) clearTimeout(handleRef.current);
      };
    }, [text, speed, loop, loopDelay, onComplete, reduced]);

    return (
      <span
        ref={ref}
        className={cx(
          "vf-typewriter",
          cursor && "vf-typewriter--with-cursor",
          className
        )}
        aria-live="polite"
        {...props}
      >
        {shown}
        {cursor && <span aria-hidden="true" className="vf-typewriter__cursor">|</span>}
      </span>
    );
  }
);
Typewriter.displayName = "Typewriter";

// ── Ticker (numeric odometer) ───────────────────────────────

export interface TickerProps extends HTMLAttributes<HTMLSpanElement> {
  from?: number;
  to: number;
  /** Animation duration in ms. Default 800. */
  duration?: number;
  format?: (n: number) => string;
  /**
   * Emit exactly N evenly-spaced discrete values between `from` and `to`
   * instead of smoothly interpolating. Useful when the ticker should hit
   * specific round numbers. When 0 or unset, the smooth easing path runs.
   */
  steps?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Numeric counter/odometer that animates between two values. Supports smooth
 * easing or discrete stepped transitions. Respects `prefers-reduced-motion`.
 */
export const Ticker = forwardRef<HTMLSpanElement, TickerProps>(function Ticker(
  {
    from = 0,
    to,
    duration = 800,
    format = (n) => Math.round(n).toLocaleString(),
    steps,
    className,
    ...props
  },
  ref
) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    // Discretized path: emit exactly `steps` values at duration/steps intervals,
    // always landing on `to` for the final tick.
    if (steps && steps > 0) {
      let cancelled = false;
      let i = 0;
      const interval = duration / steps;
      const id = setInterval(() => {
        if (cancelled) return;
        i += 1;
        const next = i >= steps ? to : from + ((to - from) * i) / steps;
        setValue(next);
        if (i >= steps) clearInterval(id);
      }, interval);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }

    // Smooth path: eased rAF interpolation.
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration, steps]);

  return (
    <span
      ref={ref}
      className={cx("vf-ticker", className)}
      aria-live="polite"
      {...props}
    >
      {format(value)}
    </span>
  );
});
Ticker.displayName = "Ticker";

// ── Enter-animation hook (shared by FadeIn / SlideIn) ──────

function useEnterAnimation(opts: {
  ref: RefObject<HTMLElement>;
  triggerOnce?: boolean;
  reducedMotion: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = opts.ref.current;
    if (!el || opts.reducedMotion) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (opts.triggerOnce !== false) observer.disconnect();
        } else if (opts.triggerOnce === false) {
          setVisible(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [opts.reducedMotion, opts.triggerOnce]);
  return visible;
}

// ── FadeIn ──────────────────────────────────────────────────

export interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  /** Animation duration in ms. Default 300. */
  duration?: number;
  /** Delay before animation starts in ms. Default 0. */
  delay?: number;
  /** CSS easing function. Default "ease". */
  easing?: string;
  /** Only animate the first time the element enters the viewport. Default true. */
  triggerOnce?: boolean;
}

/**
 * Fades children in when they scroll into view. Respects
 * `prefers-reduced-motion` (renders immediately without animation).
 */
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  function FadeIn(
    {
      duration = 300,
      delay = 0,
      easing = "ease",
      triggerOnce = true,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const visible = useEnterAnimation({ ref: innerRef, triggerOnce, reducedMotion });

    const mergedRef = (node: HTMLDivElement | null) => {
      (innerRef as { current: HTMLDivElement | null }).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    };

    return (
      <div
        ref={mergedRef}
        className={cx("vf-fade-in", visible && "vf-fade-in--visible", className)}
        style={{
          opacity: visible ? 1 : 0,
          transition: reducedMotion
            ? "none"
            : `opacity ${duration}ms ${easing} ${delay}ms`,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FadeIn.displayName = "FadeIn";

// ── SlideIn ─────────────────────────────────────────────────

export type SlideInDirection = "left" | "right" | "up" | "down";

export interface SlideInProps extends FadeInProps {
  /** Direction to slide from. Default "up". */
  direction?: SlideInDirection;
  /** Distance to travel. Default "20px". */
  distance?: number | string;
}

/**
 * Slides (and fades) children in from a given direction when they scroll
 * into view. Respects `prefers-reduced-motion` (renders immediately).
 */
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  function SlideIn(
    {
      direction = "up",
      distance = "20px",
      duration = 300,
      delay = 0,
      easing = "ease",
      triggerOnce = true,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const visible = useEnterAnimation({ ref: innerRef, triggerOnce, reducedMotion });

    const d = typeof distance === "number" ? `${distance}px` : distance;
    const translateMap: Record<SlideInDirection, string> = {
      up: `translateY(${d})`,
      down: `translateY(-${d})`,
      left: `translateX(${d})`,
      right: `translateX(-${d})`,
    };

    const mergedRef = (node: HTMLDivElement | null) => {
      (innerRef as { current: HTMLDivElement | null }).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    };

    return (
      <div
        ref={mergedRef}
        className={cx("vf-slide-in", visible && "vf-slide-in--visible", className)}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : translateMap[direction],
          transition: reducedMotion
            ? "none"
            : `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SlideIn.displayName = "SlideIn";
