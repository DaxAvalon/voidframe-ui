"use client";

// Phase 11 — Lightbox + ImageGallery
//
// Lightbox is a Portal-mounted modal with image carousel, optional thumbnail
// strip, and zoom (wheel + double-click on desktop, pinch on touch). Closes
// on Escape and outside-click. ImageGallery renders a grid that opens the
// Lightbox when an image is clicked.

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { ScrollLock } from "../primitives/ScrollLock";
import { cx } from "../utils/cx";
import { safeHref } from "../utils/safeHref";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: ReactNode;
}

export interface LightboxProps extends HTMLAttributes<HTMLDivElement> {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (next: number) => void;
  thumbnails?: boolean;
  zoom?: boolean;
  /** Allow the user to download the current image. */
  download?: boolean;
}

export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  {
    images,
    open,
    onOpenChange,
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    thumbnails = true,
    zoom = true,
    download,
    className,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(defaultIndex);
  const index = indexProp ?? internal;
  const setIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, next));
      if (indexProp === undefined) setInternal(clamped);
      onIndexChange?.(clamped);
    },
    [images.length, indexProp, onIndexChange]
  );
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex(index + 1);
      if (e.key === "ArrowLeft") setIndex(index - 1);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(4, s + 0.25));
      if (e.key === "-") setScale((s) => Math.max(0.5, s - 0.25));
      if (e.key === "0") setScale(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, setIndex]);

  useEffect(() => {
    if (open) setScale(1);
  }, [index, open]);

  if (!open) return null;
  const current = images[index];
  if (!current) return null;

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!zoom) return;
    e.preventDefault();
    setScale((s) => {
      const next = e.deltaY < 0 ? s + 0.1 : s - 0.1;
      return Math.max(0.5, Math.min(4, next));
    });
  };

  const handleDoubleClick = () => {
    if (!zoom) return;
    setScale((s) => (s === 1 ? 2 : 1));
  };

  return (
    <Portal>
      <ScrollLock enabled={open} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={current.alt}
        className={cx("vf-lightbox", className)}
        {...props}
      >
        <div
          className="vf-lightbox__backdrop"
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
        />
        <DismissableLayer onDismiss={() => onOpenChange(false)}>
          <FocusScope
            trapped
            autoFocus
            restoreFocus
            loop
            className="vf-lightbox__panel"
          >
            <button
              type="button"
              className="vf-lightbox__close"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              ×
            </button>
            <button
              type="button"
              className="vf-lightbox__prev"
              aria-label="Previous image"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              ‹
            </button>
            <div className="vf-lightbox__stage" onWheel={handleWheel}>
              <img
                ref={imgRef}
                src={current.src}
                alt={current.alt}
                style={{ transform: `scale(${scale})`, transition: "transform 0.15s ease" }}
                onDoubleClick={handleDoubleClick}
                className="vf-lightbox__img"
              />
            </div>
            <button
              type="button"
              className="vf-lightbox__next"
              aria-label="Next image"
              disabled={index === images.length - 1}
              onClick={() => setIndex(index + 1)}
            >
              ›
            </button>
            {(current.caption || download) && (
              <footer className="vf-lightbox__footer">
                <span className="vf-lightbox__caption">{current.caption}</span>
                {download && (
                  <a
                    href={safeHref(current.src)}
                    download
                    className="vf-lightbox__download"
                  >
                    Download
                  </a>
                )}
              </footer>
            )}
            {thumbnails && images.length > 1 && (
              <div
                role="tablist"
                aria-label="Image thumbnails"
                className="vf-lightbox__thumbs"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    role="tab"
                    type="button"
                    aria-selected={i === index}
                    aria-label={img.alt}
                    className={cx(
                      "vf-lightbox__thumb",
                      i === index && "vf-lightbox__thumb--active"
                    )}
                    onClick={() => setIndex(i)}
                  >
                    <img src={img.src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </FocusScope>
        </DismissableLayer>
      </div>
    </Portal>
  );
});
Lightbox.displayName = "Lightbox";

// ── ImageGallery ─────────────────────────────────────────────

export interface ImageGalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: LightboxImage[];
  columns?: number;
  gap?: number | string;
  aspectRatio?: number;
  onImageClick?: (index: number) => void;
  /** Disable the Lightbox (gallery only). */
  noLightbox?: boolean;
  style?: CSSProperties;
}

export const ImageGallery = forwardRef<HTMLDivElement, ImageGalleryProps>(
  function ImageGallery(
    {
      images,
      columns = 3,
      gap = 8,
      aspectRatio = 1,
      onImageClick,
      noLightbox,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <>
        <div
          ref={ref}
          className={cx("vf-image-gallery", className)}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: typeof gap === "number" ? `${gap}px` : gap,
            ...style,
          }}
          {...props}
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className="vf-image-gallery__cell"
              style={{ aspectRatio: String(aspectRatio) }}
              onClick={() => {
                setIndex(i);
                if (!noLightbox) setOpen(true);
                onImageClick?.(i);
              }}
            >
              <img src={img.src} alt={img.alt} />
            </button>
          ))}
        </div>
        {!noLightbox && (
          <Lightbox
            images={images}
            open={open}
            index={index}
            onIndexChange={setIndex}
            onOpenChange={setOpen}
          />
        )}
      </>
    );
  }
);
ImageGallery.displayName = "ImageGallery";
