"use client";

// LivePreview — a live self-view of a MediaStream. Muted and inline so it
// never plays the microphone back and never goes full-screen on phones.
// Nothing is recorded or captured here; it only displays the stream.

import { forwardRef, useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useMergedRefs } from "../hooks/useMergedRefs";

export interface LivePreviewProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The stream to show; `null` renders the placeholder. */
  stream: MediaStream | null | undefined;
  /** Flip horizontally, as a mirror does. Default true (a self-view). */
  mirror?: boolean;
  /** How the video fills its box. Default `cover`. */
  fit?: "cover" | "contain";
  /** CSS aspect ratio of the box. Default `"16 / 9"`. */
  aspectRatio?: string;
  /** Shown when there is no stream (an icon, "Camera off"). */
  placeholder?: ReactNode;
  /** Accessible name of the video. Default "Live preview". */
  label?: string;
  /** Called when the first frame is ready to play. */
  onReady?: () => void;
  /** Extra attributes for the `<video>`. */
  videoProps?: Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "muted" | "playsInline" | "autoPlay" | "src">;
  style?: CSSProperties;
}

/**
 * Live camera self-view. Sets `srcObject`, keeps the element muted and
 * inline, and mirrors it by default. Pair with `useUserMedia`.
 */
export const LivePreview = forwardRef<HTMLDivElement, LivePreviewProps>(function LivePreview(
  { stream, mirror = true, fit = "cover", aspectRatio = "16 / 9", placeholder, label = "Live preview", onReady, videoProps, className, style, ...rest },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, boxRef);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    try {
      el.srcObject = stream ?? null;
    } catch {
      /* a DOM that validates srcObject strictly */
    }
    if (stream) {
      const p = el.play?.();
      if (p && typeof p.catch === "function") p.catch(() => undefined);
    }
    return () => {
      try {
        el.srcObject = null;
      } catch {
        /* noop */
      }
    };
  }, [stream]);
  return (
    <div
      ref={merged}
      className={cx("vf-live-preview", mirror && "vf-live-preview--mirror", `vf-live-preview--${fit}`, !stream && "vf-live-preview--empty", className)}
      style={{ ...({ "--vf-live-preview-ratio": aspectRatio } as CSSProperties), ...style }}
      data-state={stream ? "on" : "off"}
      {...rest}
    >
      {stream ? (
        <video
          ref={videoRef}
          className="vf-live-preview__video"
          muted
          playsInline
          autoPlay
          aria-label={label}
          onLoadedMetadata={onReady}
          {...videoProps}
        />
      ) : (
        <div className="vf-live-preview__placeholder" role="img" aria-label={label}>
          {placeholder}
        </div>
      )}
    </div>
  );
});
LivePreview.displayName = "LivePreview";
