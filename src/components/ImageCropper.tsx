"use client";

// Phase 7.5 — ImageCropper
//
// Pick or pass an image, then drag a rectangular crop window across it.
// Emits a cropped image blob (and data URL) when the user confirms.
//
// Intentionally limited: rectangular crop only, no rotation/skew. For richer
// interactions consider react-image-crop or a dedicated library.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  blob: Blob;
  dataUrl: string;
  crop: CropRect;
  natural: { width: number; height: number };
}

export interface ImageCropperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Image URL to crop. If not provided, the component shows a file picker. */
  src?: string;
  label?: string;
  /** Lock the crop window to this width/height ratio (e.g. 1 for square). */
  aspect?: number;
  /** Initial crop rect in natural image coords. Defaults to 80% centered. */
  initialCrop?: CropRect;
  /** Mime type of the emitted blob. Default "image/png". */
  outputType?: string;
  /** Quality for lossy formats (0..1). */
  outputQuality?: number;
  /** Called when the user confirms a crop. */
  onCrop?: (result: CropResult) => void;
  /** Called when a new src is loaded — useful for file pickers. */
  onSrcChange?: (src: string) => void;
  /** Expose file upload. Default `true` when no `src` provided. */
  allowFileSelect?: boolean;
  id?: string;
  style?: CSSProperties;
}

type DragMode =
  | null
  | { type: "move"; offsetX: number; offsetY: number }
  | { type: "resize"; corner: "nw" | "ne" | "sw" | "se" };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function applyAspect(
  crop: CropRect,
  aspect: number | undefined,
  bounds: { width: number; height: number }
): CropRect {
  if (!aspect || aspect <= 0) return crop;
  const targetW = crop.width;
  const targetH = targetW / aspect;
  const height = Math.min(targetH, bounds.height - crop.y);
  const width = height * aspect;
  return {
    x: clamp(crop.x, 0, bounds.width - width),
    y: clamp(crop.y, 0, bounds.height - height),
    width,
    height,
  };
}

export const ImageCropper = forwardRef<HTMLDivElement, ImageCropperProps>(
  function ImageCropper(
    {
      src,
      label,
      aspect,
      initialCrop,
      outputType = "image/png",
      outputQuality,
      onCrop,
      onSrcChange,
      allowFileSelect,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);
    const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
    const [crop, setCrop] = useState<CropRect | null>(null);
    const dragRef = useRef<DragMode>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputId = useId(id);

    const showFilePicker = allowFileSelect ?? !src;

    useEffect(() => {
      setImgSrc(src);
    }, [src]);

    const handleImageLoaded = useCallback(() => {
      const el = imgRef.current;
      if (!el) return;
      const w = el.naturalWidth || el.width;
      const h = el.naturalHeight || el.height;
      setNatural({ width: w, height: h });
      const base: CropRect =
        initialCrop ?? {
          x: w * 0.1,
          y: h * 0.1,
          width: w * 0.8,
          height: h * 0.8,
        };
      setCrop(applyAspect(base, aspect, { width: w, height: h }));
    }, [initialCrop, aspect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      onSrcChange?.(url);
    };

    // Track displayed image width so displayScale recomputes on resize.
    const [displayWidth, setDisplayWidth] = useState<number>(0);
    useEffect(() => {
      const el = imgRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? el.getBoundingClientRect().width;
        setDisplayWidth(w);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [imgSrc]);

    // Compute the CSS → natural scale factor.
    const displayScale = useMemo(() => {
      if (!natural || !imgRef.current) return 1;
      const width = displayWidth || imgRef.current.getBoundingClientRect().width;
      return width / natural.width || 1;
    }, [natural, displayWidth]);

    const handleSurfaceDown = (
      e: ReactPointerEvent<HTMLDivElement>,
      mode: DragMode
    ) => {
      if (!natural) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = mode;
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      const mode = dragRef.current;
      if (!mode || !crop || !natural || !imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const natX = (e.clientX - rect.left) / rect.width * natural.width;
      const natY = (e.clientY - rect.top) / rect.height * natural.height;
      if (mode.type === "move") {
        const nextX = clamp(natX - mode.offsetX, 0, natural.width - crop.width);
        const nextY = clamp(natY - mode.offsetY, 0, natural.height - crop.height);
        setCrop({ ...crop, x: nextX, y: nextY });
      } else {
        const { corner } = mode;
        let { x, y, width, height } = crop;
        if (corner === "nw") {
          const nx = clamp(natX, 0, x + width - 16);
          const ny = clamp(natY, 0, y + height - 16);
          width = x + width - nx;
          height = y + height - ny;
          x = nx;
          y = ny;
        } else if (corner === "ne") {
          const nx2 = clamp(natX, x + 16, natural.width);
          const ny = clamp(natY, 0, y + height - 16);
          width = nx2 - x;
          height = y + height - ny;
          y = ny;
        } else if (corner === "sw") {
          const nx = clamp(natX, 0, x + width - 16);
          const ny2 = clamp(natY, y + 16, natural.height);
          width = x + width - nx;
          height = ny2 - y;
          x = nx;
        } else {
          width = clamp(natX - x, 16, natural.width - x);
          height = clamp(natY - y, 16, natural.height - y);
        }
        setCrop(applyAspect({ x, y, width, height }, aspect, natural));
      }
    };

    const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (dragRef.current) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        dragRef.current = null;
      }
    };

    const commitCrop = async () => {
      if (!crop || !natural || !imgRef.current) return;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(crop.width);
      canvas.height = Math.round(crop.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(
        imgRef.current,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      const dataUrl = canvas.toDataURL(outputType, outputQuality);
      const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob(
          (b) => resolve(b ?? new Blob()),
          outputType,
          outputQuality
        );
      });
      onCrop?.({ blob, dataUrl, crop, natural });
    };

    // Overlay rect in CSS coordinates.
    const overlay = useMemo(() => {
      if (!crop || !natural) return null;
      return {
        left: crop.x * displayScale,
        top: crop.y * displayScale,
        width: crop.width * displayScale,
        height: crop.height * displayScale,
      };
    }, [crop, natural, displayScale]);

    return (
      <div
        ref={(el) => {
          (containerRef as { current: HTMLDivElement | null }).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
        }}
        className={cx("vf-image-cropper", className)}
        style={style}
        {...props}
      >
        {label && <Label as="label" htmlFor={inputId}>{label}</Label>}
        {showFilePicker && (
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="vf-image-cropper__picker"
            onChange={handleFileChange}
          />
        )}
        {imgSrc && (
          <div
            className="vf-image-cropper__stage"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt=""
              className="vf-image-cropper__image"
              onLoad={handleImageLoaded}
              draggable={false}
            />
            {overlay && (
              <div
                className="vf-image-cropper__overlay"
                style={{
                  left: overlay.left,
                  top: overlay.top,
                  width: overlay.width,
                  height: overlay.height,
                }}
                onPointerDown={(e) => {
                  if (!natural || !crop || !imgRef.current) return;
                  const rect = imgRef.current.getBoundingClientRect();
                  const natX = (e.clientX - rect.left) / rect.width * natural.width;
                  const natY = (e.clientY - rect.top) / rect.height * natural.height;
                  handleSurfaceDown(e, {
                    type: "move",
                    offsetX: natX - crop.x,
                    offsetY: natY - crop.y,
                  });
                }}
              >
                {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                  <span
                    key={corner}
                    role="presentation"
                    className={`vf-image-cropper__handle vf-image-cropper__handle--${corner}`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const target = e.currentTarget.parentElement as HTMLDivElement;
                      try {
                        target.setPointerCapture(e.pointerId);
                      } catch {
                        /* noop */
                      }
                      dragRef.current = { type: "resize", corner };
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {imgSrc && (
          <div className="vf-image-cropper__actions">
            <button type="button" className="vf-button" onClick={commitCrop}>
              Apply crop
            </button>
          </div>
        )}
      </div>
    );
  }
);
ImageCropper.displayName = "ImageCropper";
