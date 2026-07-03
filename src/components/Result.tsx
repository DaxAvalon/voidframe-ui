"use client";

import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export type ResultStatus =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "403"
  | "404"
  | "500";

export interface ResultProps extends HTMLAttributes<HTMLDivElement> {
  status: ResultStatus;
  title: string;
  description?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
}

// Monochrome glyphs only - color-emoji presentations (the old \u26D4 /
// \uD83D\uDD0D / \u2620) break the monochrome identity. \uFE0E pins the
// warning/info marks to text presentation on emoji-happy platforms.
const defaultIcons: Record<ResultStatus, string> = {
  success: "\u2713",
  error: "\u2717",
  warning: "\u26A0\uFE0E",
  info: "\u2139\uFE0E",
  "403": "\u2298",
  "404": "\u2315",
  "500": "\u2A2F",
};

const ResultImpl = forwardRef<HTMLDivElement, ResultProps>(function Result(
  { status, title, description, icon, extra, children, className, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("vf-result", `vf-result--${status}`, className)}
      style={style}
      role="status"
      {...props}
    >
      <div className="vf-result__icon" aria-hidden="true">
        {icon ?? (
          <span className="vf-result__default-icon">
            {defaultIcons[status]}
          </span>
        )}
      </div>
      <h2 className="vf-result__title">{title}</h2>
      {description && (
        <p className="vf-result__description">{description}</p>
      )}
      {extra && <div className="vf-result__extra">{extra}</div>}
      {children && <div className="vf-result__children">{children}</div>}
    </div>
  );
});
ResultImpl.displayName = "Result";
/**
 * Centred result page (404 / 403 / 500 / success). Icon, title, description,
 * and action slot.
 */
export const Result = memo(ResultImpl);
(Result as unknown as { displayName: string }).displayName = "Result";
