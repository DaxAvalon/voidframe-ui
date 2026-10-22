"use client";

// Disclosure — one expand/collapse region with a ReactNode trigger: the
// standalone primitive behind collapsible cards and sections. Controlled
// (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`); the content
// unmounts when closed unless `keepMounted`.

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useDisclosure } from "../hooks/useDisclosure";
import { useId } from "../hooks/useId";

export interface DisclosureProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** What the toggle shows: text, or a row with badges and counts. */
  trigger: ReactNode;
  /** Controls rendered beside the trigger, outside the toggle button. */
  actions?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `card` draws the Card surface (border, bg-2, padding); `none` is bare. Default `none`. */
  surface?: "none" | "card";
  /** Keep the content mounted (hidden) when closed. Default false: it unmounts. */
  keepMounted?: boolean;
  /** Chevron side. Default `start`. */
  chevron?: "start" | "end" | "none";
  /** Heading element wrapping the toggle, for document outline. Default none. */
  headingAs?: "h2" | "h3" | "h4" | "h5" | "h6";
  disabled?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export const Disclosure = forwardRef<HTMLDivElement, DisclosureProps>(function Disclosure(
  {
    trigger,
    actions,
    open,
    defaultOpen = false,
    onOpenChange,
    surface = "none",
    keepMounted = false,
    chevron = "start",
    headingAs,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const disclosure = useDisclosure({ open, defaultOpen, onOpenChange });
  const id = useId();
  const triggerId = `${id}-trigger`;
  const contentId = `${id}-content`;
  const button = (
    <button
      id={triggerId}
      type="button"
      className="vf-disclosure__trigger"
      aria-expanded={disclosure.open}
      aria-controls={contentId}
      disabled={disabled}
      onClick={disclosure.toggle}
    >
      {chevron === "start" && (
        <span className="vf-disclosure__chevron" aria-hidden="true">
          {disclosure.open ? "▾" : "▸"}
        </span>
      )}
      <span className="vf-disclosure__label">{trigger}</span>
      {chevron === "end" && (
        <span className="vf-disclosure__chevron vf-disclosure__chevron--end" aria-hidden="true">
          {disclosure.open ? "▾" : "▸"}
        </span>
      )}
    </button>
  );
  const Heading = headingAs;
  const showContent = disclosure.open || keepMounted;
  return (
    <div
      ref={ref}
      className={cx("vf-disclosure", surface === "card" && "vf-disclosure--card", className)}
      data-open={disclosure.open ? "true" : "false"}
      {...props}
    >
      <div className="vf-disclosure__header">
        {Heading ? <Heading className="vf-disclosure__heading">{button}</Heading> : button}
        {actions && <div className="vf-disclosure__actions">{actions}</div>}
      </div>
      {showContent && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          className="vf-disclosure__content"
          hidden={!disclosure.open}
        >
          {children}
        </div>
      )}
    </div>
  );
});
Disclosure.displayName = "Disclosure";
