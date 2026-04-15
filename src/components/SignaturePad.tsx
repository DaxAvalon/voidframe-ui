"use client";

// Phase 7.5 — SignaturePad
//
// Canvas-backed signature capture. Mouse, touch, and pen are all routed
// through Pointer Events. Strokes are stored as an array of point arrays so
// the pad can re-render crisply on resize or after `clear()`.
//
// Emits either a PNG data URL (default) or the raw stroke data via the
// imperative API exposed through `ref`.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface SignaturePoint {
  x: number;
  y: number;
  /** Stroke pressure 0..1 (if the input device supports it). */
  pressure: number;
}

export type SignatureStrokes = SignaturePoint[][];

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string, quality?: number) => string;
  getStrokes: () => SignatureStrokes;
  setStrokes: (strokes: SignatureStrokes) => void;
}

export interface SignaturePadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  /** Canvas pixel width. Defaults to the container width at mount. */
  width?: number;
  /** Canvas pixel height. */
  height?: number;
  /** Stroke color. */
  strokeColor?: string;
  /** Stroke width in pixels. */
  strokeWidth?: number;
  /** Background color; used for the canvas fill and on clear(). */
  background?: string;
  /** Emits the PNG data URL each time a stroke is completed. */
  onChange?: (dataUrl: string) => void;
  /** Emits when the user starts drawing a stroke. */
  onStrokeStart?: () => void;
  /** Emits when a stroke completes. */
  onStrokeEnd?: (strokes: SignatureStrokes) => void;
  disabled?: boolean;
  /** Render a Clear button at the bottom-right. Default `true`. */
  showClearButton?: boolean;
  id?: string;
  style?: CSSProperties;
}

function redraw(
  canvas: HTMLCanvasElement,
  strokes: SignatureStrokes,
  strokeColor: string,
  strokeWidth: number,
  background: string
): void {
  if (typeof canvas.getContext !== "function") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = strokeColor;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    ctx.beginPath();
    const first = stroke[0]!;
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < stroke.length; i++) {
      const p = stroke[i]!;
      ctx.lineWidth = strokeWidth * (0.5 + 0.5 * (p.pressure || 1));
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad(
    {
      label,
      width,
      height = 180,
      strokeColor,
      strokeWidth = 2,
      background = "transparent",
      onChange,
      onStrokeStart,
      onStrokeEnd,
      disabled,
      showClearButton = true,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<SignatureStrokes>([]);
    const [hasInk, setHasInk] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const [resolvedWidth, setResolvedWidth] = useState<number>(width ?? 0);
    const [resolvedColor, setResolvedColor] = useState<string>(
      strokeColor ?? "#e0e0e0"
    );
    const inputId = useId(id);

    // Size the canvas to the container when width is unspecified.
    useEffect(() => {
      if (width !== undefined) {
        setResolvedWidth(width);
        return;
      }
      const el = containerRef.current;
      if (!el) return;
      setResolvedWidth(el.clientWidth || 360);
    }, [width]);

    // Resolve stroke color from the theme when the consumer didn't
    // supply one — so the default signature reads on both dark and
    // light backgrounds without forcing the consumer to pick a color.
    useEffect(() => {
      if (strokeColor !== undefined) {
        setResolvedColor(strokeColor);
        return;
      }
      if (typeof getComputedStyle === "undefined") return;
      const el = containerRef.current;
      if (!el) return;
      const fromTheme = getComputedStyle(el)
        .getPropertyValue("--vf-text-0")
        .trim();
      if (fromTheme) setResolvedColor(fromTheme);
    }, [strokeColor]);

    const flush = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      redraw(canvas, strokesRef.current, resolvedColor, strokeWidth, background);
    }, [resolvedColor, strokeWidth, background]);

    useEffect(() => {
      flush();
    }, [flush, resolvedWidth, height]);

    const pointerAt = useCallback(
      (e: ReactPointerEvent<HTMLCanvasElement>): SignaturePoint => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
          pressure: e.pressure || 0.5,
        };
      },
      []
    );

    const handleDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* Older browsers / headless envs may not support capture. */
      }
      setDrawing(true);
      const p = pointerAt(e);
      strokesRef.current = [...strokesRef.current, [p]];
      flush();
      onStrokeStart?.();
    };

    const handleMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawing || disabled) return;
      const p = pointerAt(e);
      const strokes = strokesRef.current;
      const last = strokes[strokes.length - 1];
      if (!last) return;
      last.push(p);
      flush();
    };

    const handleUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawing) return;
      setDrawing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      setHasInk(strokesRef.current.some((s) => s.length > 1));
      onStrokeEnd?.(strokesRef.current);
      if (canvasRef.current && onChange && typeof canvasRef.current.toDataURL === "function") {
        try {
          onChange(canvasRef.current.toDataURL());
        } catch {
          /* headless envs without a real canvas */
        }
      }
    };

    const clear = useCallback(() => {
      strokesRef.current = [];
      setHasInk(false);
      flush();
    }, [flush]);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        isEmpty: () => !strokesRef.current.some((s) => s.length > 1),
        toDataURL: (type, quality) => {
          const c = canvasRef.current;
          if (!c || typeof c.toDataURL !== "function") return "";
          try {
            return c.toDataURL(type, quality);
          } catch {
            return "";
          }
        },
        getStrokes: () => strokesRef.current,
        setStrokes: (next) => {
          strokesRef.current = next.map((s) => s.slice());
          setHasInk(next.some((s) => s.length > 1));
          flush();
        },
      }),
      [clear, flush]
    );

    return (
      <div
        ref={containerRef}
        className={cx("vf-signature", className)}
        style={style}
        {...props}
      >
        {label && <Label as="label" htmlFor={inputId}>{label}</Label>}
        <div
          className="vf-signature__frame"
          data-has-ink={hasInk || undefined}
          data-disabled={disabled || undefined}
        >
          <canvas
            id={inputId}
            ref={canvasRef}
            width={resolvedWidth || 360}
            height={height}
            className="vf-signature__canvas"
            role="img"
            aria-label={label ?? "Signature pad"}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
          />
          {showClearButton && (
            <button
              type="button"
              className="vf-signature__clear"
              disabled={disabled}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
            >
              Clear
            </button>
          )}
          {!hasInk && (
            <span className="vf-signature__placeholder" aria-hidden="true">
              Sign here
            </span>
          )}
        </div>
      </div>
    );
  }
);
SignaturePad.displayName = "SignaturePad";
