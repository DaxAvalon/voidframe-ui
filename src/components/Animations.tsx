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
  onComplete?: () => void;
}

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
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const Ticker = forwardRef<HTMLSpanElement, TickerProps>(function Ticker(
  {
    from = 0,
    to,
    duration = 800,
    format = (n) => Math.round(n).toLocaleString(),
    className,
    ...props
  },
  ref
) {
  const [value, setValue] = useState(from);

  useEffect(() => {
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
  }, [from, to, duration]);

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
