"use client";

// Phase 11 — IFrame + DocumentPreview
//
// Sandboxed embed wrapper plus a thumbnail-and-metadata preview for any
// document.

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type IframeHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { safeHref } from "../utils/safeHref";
import { warnOnce } from "../utils/warn";
import { Label } from "./Text";

function sandboxEscapesOrigin(sandbox: string | undefined): boolean {
  if (!sandbox) return false;
  const tokens = new Set(sandbox.trim().split(/\s+/));
  return tokens.has("allow-scripts") && tokens.has("allow-same-origin");
}

// ── IFrame ──────────────────────────────────────────────────

export interface IFrameProps
  extends Omit<IframeHTMLAttributes<HTMLIFrameElement>, "title"> {
  src: string;
  /** Required for screen-reader accessibility. */
  title: string;
  height?: number | string;
  /** Sandbox tokens. Default `"allow-scripts allow-forms"`. */
  sandbox?: string;
}

export const IFrame = forwardRef<HTMLIFrameElement, IFrameProps>(function IFrame(
  {
    src,
    title,
    height = 360,
    sandbox = "allow-scripts allow-forms",
    loading = "lazy",
    className,
    style,
    ...props
  },
  ref
) {
  if (sandboxEscapesOrigin(sandbox)) {
    warnOnce(
      `IFrame:sandbox-escape:${sandbox}`,
      `<IFrame> sandbox="${sandbox}" grants the embedded document full host privileges (allow-scripts + allow-same-origin defeats the sandbox). Remove one of the two tokens unless you fully trust the frame source.`
    );
  }
  const merged: CSSProperties = {
    width: "100%",
    border: "none",
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };
  return (
    <iframe
      ref={ref}
      src={safeHref(src)}
      title={title}
      sandbox={sandbox}
      loading={loading}
      className={cx("vf-iframe", className)}
      style={merged}
      {...props}
    />
  );
});
IFrame.displayName = "IFrame";

// ── DocumentPreview ─────────────────────────────────────────

export type DocumentKind =
  | "pdf"
  | "image"
  | "text"
  | "audio"
  | "video"
  | "archive"
  | "spreadsheet"
  | "doc"
  | "other";

const KIND_GLYPH: Record<DocumentKind, string> = {
  pdf: "📄",
  image: "🖼",
  text: "📃",
  audio: "🎵",
  video: "🎬",
  archive: "🗜",
  spreadsheet: "📊",
  doc: "📝",
  other: "📁",
};

function formatBytes(n: number | undefined): string {
  if (n === undefined) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export interface DocumentPreviewProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  filename: string;
  size?: number;
  kind?: DocumentKind;
  /** Optional thumbnail URL. Falls back to glyph by `kind`. */
  thumbnail?: string;
  description?: ReactNode;
  onOpen?: () => void;
  onDownload?: () => void;
  /** Disable both action buttons. */
  readOnly?: boolean;
}

export const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  function DocumentPreview(
    {
      src,
      filename,
      size,
      kind = "other",
      thumbnail,
      description,
      onOpen,
      onDownload,
      readOnly,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-doc-preview", className)}
        {...props}
      >
        <div className="vf-doc-preview__thumb" aria-hidden="true">
          {thumbnail ? (
            <img src={thumbnail} alt="" />
          ) : (
            <span className="vf-doc-preview__glyph">{KIND_GLYPH[kind]}</span>
          )}
        </div>
        <div className="vf-doc-preview__meta">
          <div className="vf-doc-preview__name" title={filename}>
            {filename}
          </div>
          <Label className="vf-doc-preview__sub">
            {kind.toUpperCase()}
            {size !== undefined ? ` · ${formatBytes(size)}` : ""}
          </Label>
          {description && (
            <div className="vf-doc-preview__desc">{description}</div>
          )}
        </div>
        {!readOnly && (
          <div className="vf-doc-preview__actions">
            {onOpen && (
              <button
                type="button"
                className="vf-button"
                onClick={onOpen}
                aria-label={`Open ${filename}`}
              >
                Open
              </button>
            )}
            {(onDownload || src) && (
              <a
                href={safeHref(src)}
                download={filename}
                className="vf-button vf-button--ghost"
                onClick={onDownload}
                aria-label={`Download ${filename}`}
              >
                Download
              </a>
            )}
          </div>
        )}
      </div>
    );
  }
);
DocumentPreview.displayName = "DocumentPreview";
