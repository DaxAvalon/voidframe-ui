"use client";

// Phase 11 — Image (upgrade)
//
// `<img>` wrapper with blur-up, fallback-on-error, native lazy loading, and
// aspect-ratio sizing.

import {
  forwardRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type ImagePlaceholder = "empty" | "blur" | string;

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "placeholder"> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  /** Numeric ratio (`16 / 9`) or string (`"16 / 9"`). */
  aspectRatio?: number | string;
  fallback?: string | ReactNode;
  placeholder?: ImagePlaceholder;
  /** Used when `placeholder="blur"` — pass a tiny base64 image. */
  blurDataUrl?: string;
  objectFit?: CSSProperties["objectFit"];
  onLoad?: ImgHTMLAttributes<HTMLImageElement>["onLoad"];
  onError?: ImgHTMLAttributes<HTMLImageElement>["onError"];
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    width,
    height,
    aspectRatio,
    fallback,
    placeholder = "empty",
    blurDataUrl,
    objectFit,
    onLoad,
    onError,
    loading = "lazy",
    className,
    style,
    ...props
  },
  ref
) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const merged: CSSProperties = {
    ...(aspectRatio !== undefined && { aspectRatio: String(aspectRatio) }),
    ...(width !== undefined && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height !== undefined && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
    ...(objectFit !== undefined && { objectFit }),
    ...style,
  };

  if (errored && fallback) {
    if (typeof fallback === "string") {
      return (
        <img
          ref={ref}
          src={fallback}
          alt={alt}
          loading={loading}
          className={cx("vf-image", "vf-image--fallback", className)}
          style={merged}
          {...props}
        />
      );
    }
    return (
      <span
        className={cx("vf-image", "vf-image--fallback-node", className)}
        style={merged}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  const useBlur = placeholder === "blur" && blurDataUrl;
  const placeholderSrc =
    placeholder === "blur"
      ? blurDataUrl
      : placeholder !== "empty"
        ? placeholder
        : undefined;

  return (
    <span
      className={cx(
        "vf-image-wrapper",
        useBlur && !loaded && "vf-image-wrapper--blurring",
        className
      )}
      style={merged}
    >
      {placeholderSrc && !loaded && (
        <img
          aria-hidden="true"
          src={placeholderSrc}
          alt=""
          className="vf-image__placeholder"
          style={{ objectFit: objectFit ?? "cover" }}
        />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        className="vf-image"
        style={{ objectFit: objectFit ?? "cover" }}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
        {...props}
      />
    </span>
  );
});
Image.displayName = "Image";
