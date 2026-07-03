"use client";

// Phase 12 — Attachments

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { CodeBlock } from "./Viewers";
import { AudioPlayer } from "./MediaPlayer";
import { cx } from "../utils/cx";

export type AttachmentKind =
  | "image"
  | "video"
  | "audio"
  | "file"
  | "pdf"
  | "code";

export interface AttachmentProps extends HTMLAttributes<HTMLDivElement> {
  kind?: AttachmentKind;
  name?: ReactNode;
  size?: ReactNode;
  thumbnail?: ReactNode;
  icon?: ReactNode;
  onOpen?: () => void;
  onDownload?: () => void;
  onRemove?: () => void;
  /** When true, hides the default action buttons (for read-only displays). */
  readOnly?: boolean;
  children?: ReactNode;
}

// Monochrome glyphs only - color emoji break the monochrome identity.
const KIND_ICON: Record<AttachmentKind, string> = {
  image: "\u25A6",
  video: "\u25B6\uFE0E",
  audio: "\u266A",
  file: "\u25A4",
  pdf: "\u25A4",
  code: "<>",
};

/**
 * Single attachment chip: icon, filename, size, optional preview / download
 * affordances. Used inside `AttachmentList` and the composer.
 */
export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(
  function Attachment(
    {
      kind = "file",
      name,
      size,
      thumbnail,
      icon,
      onOpen,
      onDownload,
      onRemove,
      readOnly,
      className,
      children,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-kind={kind}
        className={cx(
          "vf-attachment",
          `vf-attachment--${kind}`,
          onOpen && "vf-attachment--clickable",
          className
        )}
        {...props}
      >
        <button
          type="button"
          className="vf-attachment__body"
          onClick={onOpen}
          disabled={!onOpen}
          aria-label={typeof name === "string" ? `Open ${name}` : undefined}
        >
          {thumbnail ? (
            <span className="vf-attachment__thumb" aria-hidden="true">
              {thumbnail}
            </span>
          ) : (
            <span className="vf-attachment__icon" aria-hidden="true">
              {icon ?? KIND_ICON[kind]}
            </span>
          )}
          <span className="vf-attachment__meta">
            {name && <span className="vf-attachment__name">{name}</span>}
            {size && <span className="vf-attachment__size">{size}</span>}
          </span>
        </button>
        {children && (
          <div className="vf-attachment__extra">{children}</div>
        )}
        {!readOnly && (onDownload || onRemove) && (
          <div className="vf-attachment__actions">
            {onDownload && (
              <button
                type="button"
                className="vf-attachment__action"
                aria-label="Download"
                onClick={onDownload}
              >
                ⤓
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                className="vf-attachment__action"
                aria-label="Remove"
                onClick={onRemove}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
Attachment.displayName = "Attachment";

export interface AttachmentListProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  children?: ReactNode;
}

/**
 * Horizontal list of `Attachment` chips with overflow handling. Feed `items`
 * as `{ id, name, size, kind, url }[]`.
 */
export const AttachmentList = forwardRef<HTMLDivElement, AttachmentListProps>(
  function AttachmentList(
    { orientation = "horizontal", className, children, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="list"
        aria-label="Attachments"
        className={cx(
          "vf-attachment-list",
          `vf-attachment-list--${orientation}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AttachmentList.displayName = "AttachmentList";

// ── ImageAttachment — inline image with click target ─────────

export interface ImageAttachmentProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  name?: ReactNode;
  onOpen?: () => void;
  onRemove?: () => void;
}

/**
 * Attachment variant for images — shows a thumbnail plus filename/size
 * metadata.
 */
export const ImageAttachment = forwardRef<HTMLDivElement, ImageAttachmentProps>(
  function ImageAttachment(
    { src, alt, width, height, name, onOpen, onRemove, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-attachment",
          "vf-attachment--image",
          "vf-image-attachment",
          className
        )}
        {...props}
      >
        <button
          type="button"
          className="vf-image-attachment__button"
          onClick={onOpen}
          disabled={!onOpen}
          aria-label={alt || "Open image"}
        >
          <img
            src={src}
            alt={alt ?? ""}
            width={width}
            height={height}
            className="vf-image-attachment__img"
          />
        </button>
        {name && <div className="vf-image-attachment__name">{name}</div>}
        {onRemove && (
          <button
            type="button"
            className="vf-attachment__action vf-image-attachment__remove"
            aria-label="Remove image"
            onClick={onRemove}
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);
ImageAttachment.displayName = "ImageAttachment";

// ── FileAttachment — simple chip ─────────────────────────────

export interface FileAttachmentProps
  extends Omit<AttachmentProps, "kind" | "thumbnail"> {
  extension?: string;
}

/**
 * Attachment variant for a generic file — shows filename, size, and
 * kind-specific icon.
 */
export const FileAttachment = forwardRef<HTMLDivElement, FileAttachmentProps>(
  function FileAttachment({ extension, icon, ...props }, ref) {
    return (
      <Attachment
        ref={ref}
        kind="file"
        icon={icon ?? (extension ? extension.toUpperCase() : "▤")}
        {...props}
      />
    );
  }
);
FileAttachment.displayName = "FileAttachment";

// ── CodeAttachment — inline code preview via CodeBlock ──────

export interface CodeAttachmentProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: ReactNode;
  lines?: number;
  onOpen?: () => void;
  onRemove?: () => void;
  onDownload?: () => void;
}

/**
 * Attachment variant for code snippets: filename, language badge,
 * collapsible preview.
 */
export const CodeAttachment = forwardRef<HTMLDivElement, CodeAttachmentProps>(
  function CodeAttachment(
    {
      code,
      language,
      filename,
      lines = 8,
      onOpen,
      onRemove,
      onDownload,
      className,
      ...props
    },
    ref
  ) {
    const preview = code.split("\n").slice(0, lines).join("\n");
    const truncated = code.split("\n").length > lines;
    return (
      <div
        ref={ref}
        className={cx(
          "vf-attachment",
          "vf-attachment--code",
          "vf-code-attachment",
          className
        )}
        {...props}
      >
        <header className="vf-code-attachment__header">
          <span className="vf-code-attachment__icon" aria-hidden="true">
            &lt;/&gt;
          </span>
          {filename && (
            <span className="vf-code-attachment__filename">{filename}</span>
          )}
          {language && (
            <span className="vf-code-attachment__lang">{language}</span>
          )}
          <span className="vf-code-attachment__spacer" aria-hidden="true" />
          {onOpen && (
            <button
              type="button"
              className="vf-code-attachment__action"
              onClick={onOpen}
              aria-label="Open code"
            >
              ⤢
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              className="vf-code-attachment__action"
              onClick={onDownload}
              aria-label="Download code"
            >
              ⤓
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="vf-code-attachment__action"
              onClick={onRemove}
              aria-label="Remove code"
            >
              ✕
            </button>
          )}
        </header>
        <CodeBlock
          code={preview + (truncated ? "\n…" : "")}
          language={language}
        />
      </div>
    );
  }
);
CodeAttachment.displayName = "CodeAttachment";

// ── AudioAttachment — delegates to AudioPlayer ──────────────

export interface AudioAttachmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  src: string;
  title?: ReactNode;
  duration?: number;
  onRemove?: () => void;
  onDownload?: () => void;
}

/**
 * Attachment variant for audio files — shows duration and a compact inline
 * `AudioPlayer` on expand.
 */
export const AudioAttachment = forwardRef<HTMLDivElement, AudioAttachmentProps>(
  function AudioAttachment(
    { src, title, duration, onRemove, onDownload, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-attachment",
          "vf-attachment--audio",
          "vf-audio-attachment",
          className
        )}
        {...props}
      >
        {(title ||
          (duration !== undefined && duration > 0) ||
          onDownload ||
          onRemove) && (
          <header className="vf-audio-attachment__header">
            {title && <span className="vf-audio-attachment__title">{title}</span>}
            {duration !== undefined && duration > 0 && (
              <span className="vf-audio-attachment__duration">
                {formatDuration(duration)}
              </span>
            )}
            <span className="vf-audio-attachment__spacer" aria-hidden="true" />
            {onDownload && (
              <button
                type="button"
                className="vf-audio-attachment__action"
                onClick={onDownload}
                aria-label="Download audio"
              >
                ⤓
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                className="vf-audio-attachment__action"
                onClick={onRemove}
                aria-label="Remove audio"
              >
                ✕
              </button>
            )}
          </header>
        )}
        <AudioPlayer src={src} />
      </div>
    );
  }
);
AudioAttachment.displayName = "AudioAttachment";

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
