"use client";

// Phase 7.5 — FileUpload
//
// Upgraded file picker on top of DropZone ergonomics: drag/drop + browse,
// per-file preview cards with image thumbnails, progress, remove-from-list,
// size formatting, accept/maxSize/maxFiles validation, and an optional upload
// callback that receives each file + progress notifier.

import {
  forwardRef,
  useCallback,
  useEffect,
  useId as useReactId,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export type UploadStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error";

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  thumbnail?: string;
}

export interface FileUploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  /** Comma-separated accept list (e.g. "image/*,application/pdf"). */
  accept?: string;
  /** Allow multiple files. Default `true`. */
  multiple?: boolean;
  /** Maximum file count. Extra files are rejected with an error. */
  maxFiles?: number;
  /** Maximum per-file bytes. Larger files are rejected with an error. */
  maxSize?: number;
  /** Called whenever the selection changes. */
  onValueChange?: (items: UploadItem[]) => void;
  /**
   * Upload a single file. Receives a progress callback (0..1) and must
   * resolve when the upload succeeds. Throw to mark the item as errored.
   */
  upload?: (file: File, onProgress: (p: number) => void) => Promise<void>;
  /** Render custom upload surface. Receives the open-browse helper. */
  renderSurface?: (api: { open: () => void; isDragging: boolean }) => ReactNode;
  /** Disable image thumbnail generation. */
  disableThumbnails?: boolean;
  disabled?: boolean;
  id?: string;
  /**
   * Props forwarded to the inner native `<input type="file">` element. Use for
   * `data-testid`, `aria-*`, or other attributes consumers want on the
   * actual control.
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Visual size variant — `"sm" | "md" | "lg"`. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Props forwarded to the outer wrapper `<div>`. */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const patterns = accept.split(",").map((p) => p.trim()).filter(Boolean);
  return patterns.some((p) => {
    if (p.endsWith("/*")) {
      const prefix = p.slice(0, -1); // e.g. "image/"
      return file.type.startsWith(prefix);
    }
    if (p.startsWith(".")) {
      return file.name.toLowerCase().endsWith(p.toLowerCase());
    }
    return file.type === p;
  });
}

function generateThumbnail(file: File): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * File upload control with drag-drop, picker, progress per file, and list
 * management. Supports multiple files and size/type constraints.
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  function FileUpload(
    {
      label,
      accept,
      multiple = true,
      maxFiles,
      maxSize,
      onValueChange,
      upload,
      renderSurface,
      disableThumbnails,
      disabled,
      id,
      size = "md",
      wrapperProps,
      className,
      style,
      inputProps,
      ...props
    },
    ref
  ) {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const rootId = useId(id);
    const reactId = useReactId();
    const counterRef = useRef(0);

    const makeId = useCallback((): string => {
      counterRef.current += 1;
      return `${reactId}-${counterRef.current}`;
    }, [reactId]);

    useEffect(() => {
      onValueChange?.(items);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const startUpload = useCallback(
      async (id: string, file: File) => {
        if (!upload) return;
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, status: "uploading", progress: 0 } : it
          )
        );
        try {
          await upload(file, (p) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === id ? { ...it, progress: Math.max(0, Math.min(1, p)) } : it
              )
            );
          });
          setItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, status: "success", progress: 1 } : it
            )
          );
        } catch (err) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id
                ? {
                    ...it,
                    status: "error",
                    error: err instanceof Error ? err.message : String(err),
                  }
                : it
            )
          );
        }
      },
      [upload]
    );

    const addFiles = useCallback(
      (files: FileList | File[]) => {
        const incoming = Array.from(files);
        const validated: UploadItem[] = [];
        for (const file of incoming) {
          if (!matchesAccept(file, accept)) {
            validated.push({
              id: makeId(),
              file,
              status: "error",
              progress: 0,
              error: `File type not allowed`,
            });
            continue;
          }
          if (maxSize && file.size > maxSize) {
            validated.push({
              id: makeId(),
              file,
              status: "error",
              progress: 0,
              error: `Exceeds max size (${formatBytes(maxSize)})`,
            });
            continue;
          }
          validated.push({
            id: makeId(),
            file,
            status: "queued",
            progress: 0,
          });
        }

        setItems((prev) => {
          const merged = multiple ? [...prev, ...validated] : validated;
          if (maxFiles && merged.length > maxFiles) {
            const overflow = merged.slice(maxFiles).map<UploadItem>((it) => ({
              ...it,
              status: "error",
              error: `Max ${maxFiles} files`,
            }));
            return [...merged.slice(0, maxFiles), ...overflow];
          }
          return merged;
        });

        if (!disableThumbnails) {
          for (const item of validated) {
            if (item.status !== "queued") continue;
            void generateThumbnail(item.file).then((thumbnail) => {
              if (!thumbnail) return;
              setItems((prev) =>
                prev.map((it) => (it.id === item.id ? { ...it, thumbnail } : it))
              );
            });
          }
        }

        if (upload) {
          for (const item of validated) {
            if (item.status === "queued") void startUpload(item.id, item.file);
          }
        }
      },
      [accept, maxSize, maxFiles, multiple, disableThumbnails, upload, startUpload, makeId]
    );

    const openBrowser = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    };

    const removeItem = useCallback((id: string) => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }, []);

    const retryItem = useCallback(
      (id: string) => {
        const item = items.find((it) => it.id === id);
        if (!item) return;
        void startUpload(id, item.file);
      },
      [items, startUpload]
    );

    return (
      <div
        ref={ref}
        className={cx("vf-file-upload", `vf-file-upload--${size}`, className)}
        data-size={size}
        style={style}
        {...wrapperProps}
        {...props}
      >
        {label && <Label as="label" htmlFor={rootId}>{label}</Label>}
        <div
          id={rootId}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label ?? "Upload files"}
          aria-disabled={disabled || undefined}
          className={cx(
            "vf-file-upload__surface",
            dragging && "vf-file-upload__surface--dragging",
            disabled && "vf-file-upload__surface--disabled"
          )}
          onClick={openBrowser}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openBrowser();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDragging(false);
          }}
          onDrop={handleDrop}
        >
          {renderSurface ? (
            renderSurface({ open: openBrowser, isDragging: dragging })
          ) : (
            <>
              <strong className="vf-file-upload__cta">
                {dragging ? "Drop files" : "Click or drop files"}
              </strong>
              <span className="vf-file-upload__hint">
                {accept ?? "Any file type"}
                {maxSize ? ` · up to ${formatBytes(maxSize)}` : ""}
                {maxFiles ? ` · max ${maxFiles}` : ""}
              </span>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="vf-visually-hidden"
          aria-label={label ?? "Upload files"}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
          {...inputProps}
        />
        {items.length > 0 && (
          <ul className="vf-file-upload__list" aria-label="Selected files">
            {items.map((item) => (
              <li
                key={item.id}
                className={cx(
                  "vf-file-upload__item",
                  item.status === "error" && "vf-file-upload__item--error",
                  item.status === "success" && "vf-file-upload__item--success"
                )}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="vf-file-upload__thumb"
                  />
                ) : (
                  <span
                    className="vf-file-upload__thumb vf-file-upload__thumb--placeholder"
                    aria-hidden="true"
                  >
                    📄
                  </span>
                )}
                <div className="vf-file-upload__meta">
                  <div className="vf-file-upload__name">{item.file.name}</div>
                  <div className="vf-file-upload__sub">
                    {formatBytes(item.file.size)}
                    {item.error ? ` · ${item.error}` : ""}
                  </div>
                  {item.status === "uploading" && (
                    <div
                      className="vf-file-upload__progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(item.progress * 100)}
                    >
                      <span
                        className="vf-file-upload__progress-bar"
                        style={{ width: `${Math.round(item.progress * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="vf-file-upload__actions">
                  {item.status === "error" && upload && (
                    <button
                      type="button"
                      className="vf-file-upload__action"
                      onClick={() => retryItem(item.id)}
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    className="vf-file-upload__action"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";
