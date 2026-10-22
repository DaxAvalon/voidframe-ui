"use client";

// DateDivider — the pill between messages when the day changes. Label from
// `dayLabel` (Today, Yesterday, a weekday, a date) in the active locale, or
// your own text.

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useMessages } from "../../i18n/MessagesProvider";
import { dayLabel, isDateLike, toDate } from "./helpers";

export interface DateDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** The day; rendered through `dayLabel` unless `children` is given. */
  date?: Date | string | number;
  children?: ReactNode;
}

export const DateDivider = forwardRef<HTMLDivElement, DateDividerProps>(function DateDivider(
  { date, children, className, ...props },
  ref
) {
  const i18n = useMessages();
  const label = children ?? (date !== undefined && isDateLike(date) ? dayLabel(date, { locale: i18n.locale }) : null);
  return (
    <div ref={ref} role="separator" aria-label={typeof label === "string" ? label : undefined} className={cx("vf-date-divider", className)} {...props}>
      {date !== undefined && isDateLike(date) ? (
        <time className="vf-date-divider__label" dateTime={toDate(date).toISOString().slice(0, 10)}>{label}</time>
      ) : (
        <span className="vf-date-divider__label">{label}</span>
      )}
    </div>
  );
});
DateDivider.displayName = "DateDivider";
