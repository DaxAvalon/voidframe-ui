import { forwardRef, useEffect, useState, type HTMLAttributes } from "react";
import { visuallyHiddenStyle } from "./VisuallyHidden";

export type LiveRegionPoliteness = "polite" | "assertive";

export interface LiveRegionProps extends HTMLAttributes<HTMLDivElement> {
  /** Message text. Setting it announces to screen readers. */
  message?: string;
  politeness?: LiveRegionPoliteness;
  /** Clear the message this many ms after it's announced. */
  clearAfter?: number;
}

/**
 * Declarative `aria-live` region. Consumers drive announcements via `message`.
 *
 * For imperative announcements (Toast queues etc.) use `useAnnouncer()`.
 */
export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(
  function LiveRegion(
    { message, politeness = "polite", clearAfter, style, ...props },
    ref
  ) {
    const [current, setCurrent] = useState(message ?? "");

    useEffect(() => {
      setCurrent(message ?? "");
      if (!message || !clearAfter) return;
      const id = setTimeout(() => setCurrent(""), clearAfter);
      return () => clearTimeout(id);
    }, [message, clearAfter]);

    return (
      <div
        ref={ref}
        role={politeness === "assertive" ? "alert" : "status"}
        aria-live={politeness}
        aria-atomic="true"
        style={{ ...visuallyHiddenStyle, ...style }}
        {...props}
      >
        {current}
      </div>
    );
  }
);
LiveRegion.displayName = "LiveRegion";
