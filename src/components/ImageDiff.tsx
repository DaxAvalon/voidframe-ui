"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface ImageDiffProps extends HTMLAttributes<HTMLDivElement> {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  mode?: "side-by-side" | "overlay" | "slider";
  overlayOpacity?: number;
  onOpacityChange?: (opacity: number) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showZoomControls?: boolean;
  fit?: "contain" | "cover" | "actual";
  size?: "sm" | "md" | "lg";
}

const ImageDiffImpl = forwardRef<HTMLDivElement, ImageDiffProps>(
  function ImageDiff(
    {
      before,
      after,
      beforeLabel = "Before",
      afterLabel = "After",
      mode = "slider",
      overlayOpacity: overlayOpacityProp,
      onOpacityChange,
      zoom: zoomProp,
      onZoomChange,
      showZoomControls = true,
      fit = "contain",
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const [zoom, setZoom] = useControllableState<number>({
      value: zoomProp,
      defaultValue: 1,
      onChange: onZoomChange,
      componentName: "ImageDiff",
    });

    const [overlayOpacity, setOverlayOpacity] = useControllableState<number>({
      value: overlayOpacityProp,
      defaultValue: 0.5,
      onChange: onOpacityChange,
      componentName: "ImageDiff",
    });
    const [sliderPos, setSliderPos] = useState(50);
    const viewportRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const handleSliderMove = useCallback(
      (clientX: number) => {
        const vp = viewportRef.current;
        if (!vp) return;
        const rect = vp.getBoundingClientRect();
        const pct = Math.min(
          100,
          Math.max(0, ((clientX - rect.left) / rect.width) * 100)
        );
        setSliderPos(pct);
      },
      []
    );

    const handleMouseDown = useCallback(
      (e: ReactMouseEvent) => {
        dragging.current = true;
        handleSliderMove(e.clientX);
        const onMove = (ev: globalThis.MouseEvent) => {
          if (dragging.current) handleSliderMove(ev.clientX);
        };
        const onUp = () => {
          dragging.current = false;
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      },
      [handleSliderMove]
    );

    const imgStyle = {
      objectFit: fit === "actual" ? ("none" as const) : (fit as "contain" | "cover"),
      transform: `scale(${zoom})`,
    };

    return (
      <div
        ref={ref}
        className={cx(
          "vf-image-diff",
          `vf-image-diff--${mode}`,
          `vf-image-diff--${size}`,
          className
        )}
        style={style}
        {...props}
      >
        {/* Toolbar */}
        <div className="vf-image-diff__toolbar">
          {mode === "overlay" && (
            <label className="vf-image-diff__overlay-control">
              Opacity
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                aria-label="Overlay opacity"
              />
            </label>
          )}
          {showZoomControls && (
            <div className="vf-image-diff__zoom-controls">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              >
                &minus;
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoom(Math.min(4, zoom + 0.25))}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Viewport */}
        <div
          className="vf-image-diff__viewport"
          ref={viewportRef}
          onMouseDown={mode === "slider" ? handleMouseDown : undefined}
        >
          {mode === "side-by-side" && (
            <>
              <div className="vf-image-diff__before">
                <img src={before} alt={beforeLabel} style={imgStyle} />
                <span className="vf-image-diff__label">{beforeLabel}</span>
              </div>
              <div className="vf-image-diff__after">
                <img src={after} alt={afterLabel} style={imgStyle} />
                <span className="vf-image-diff__label">{afterLabel}</span>
              </div>
            </>
          )}

          {mode === "overlay" && (
            <>
              <div className="vf-image-diff__before">
                <img src={before} alt={beforeLabel} style={imgStyle} />
              </div>
              <div
                className="vf-image-diff__after"
                style={{ opacity: overlayOpacity }}
              >
                <img src={after} alt={afterLabel} style={imgStyle} />
              </div>
            </>
          )}

          {mode === "slider" && (
            <>
              <div className="vf-image-diff__before">
                <img src={before} alt={beforeLabel} style={imgStyle} />
              </div>
              <div
                className="vf-image-diff__after"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <img src={after} alt={afterLabel} style={imgStyle} />
              </div>
              <div
                className="vf-image-diff__slider"
                style={{ left: `${sliderPos}%` }}
                role="separator"
                aria-label="Image comparison slider"
                aria-valuenow={Math.round(sliderPos)}
              >
                <div className="vf-image-diff__slider-handle" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
ImageDiffImpl.displayName = "ImageDiff";
export const ImageDiff = memo(ImageDiffImpl);
(ImageDiff as unknown as { displayName: string }).displayName = "ImageDiff";
