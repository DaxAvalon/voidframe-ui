// Phase 13 — Help + Changelog

import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── HelpTooltip ─────────────────────────────────────────────
// Lightweight "?" icon with a CSS-positioned tooltip. No portal or
// focus-scope — for richer needs, use <HoverCard> or <TooltipV2>.

export interface HelpTooltipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  content: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  label?: string;
}

export const HelpTooltip = forwardRef<HTMLSpanElement, HelpTooltipProps>(
  function HelpTooltip(
    { content, placement = "top", label = "Help", className, ...props },
    ref
  ) {
    const [open, setOpen] = useState(false);
    return (
      <span
        ref={ref}
        className={cx(
          "vf-help-tooltip",
          `vf-help-tooltip--${placement}`,
          open && "vf-help-tooltip--open",
          className
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        {...props}
      >
        <button
          type="button"
          className="vf-help-tooltip__trigger"
          aria-label={label}
          aria-expanded={open}
          tabIndex={0}
        >
          ?
        </button>
        <span
          role="tooltip"
          className="vf-help-tooltip__content"
          aria-hidden={!open}
        >
          {content}
        </span>
      </span>
    );
  }
);
HelpTooltip.displayName = "HelpTooltip";

// ── ContextHelp ─────────────────────────────────────────────
// Side-panel help that pairs with a focused element via `for`. Consumer
// controls `open` — this is pure presentation.

export interface ContextHelpProps extends HTMLAttributes<HTMLElement> {
  open?: boolean;
  onClose?: () => void;
  titleLabel?: ReactNode;
  /** Optional anchor id — added to the rendered `data-for` attribute. */
  for?: string;
  children?: ReactNode;
}

export const ContextHelp = forwardRef<HTMLElement, ContextHelpProps>(
  function ContextHelp(
    { open = true, onClose, titleLabel = "Help", for: forId, className, children, ...props },
    ref
  ) {
    if (!open) return null;
    return (
      <aside
        ref={ref}
        role="complementary"
        aria-label={typeof titleLabel === "string" ? titleLabel : "Context help"}
        data-for={forId}
        className={cx("vf-context-help", className)}
        {...props}
      >
        <header className="vf-context-help__header">
          <span className="vf-context-help__title">{titleLabel}</span>
          {onClose && (
            <button
              type="button"
              className="vf-context-help__close"
              aria-label="Close help"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </header>
        <div className="vf-context-help__body">{children}</div>
      </aside>
    );
  }
);
ContextHelp.displayName = "ContextHelp";

// ── Changelog ───────────────────────────────────────────────

export type ChangelogChangeKind =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "deprecated"
  | "security";

export interface ChangelogChange {
  kind?: ChangelogChangeKind;
  description: ReactNode;
}

export interface ChangelogEntry {
  version: ReactNode;
  date?: ReactNode;
  title?: ReactNode;
  changes: ChangelogChange[];
}

export interface ChangelogProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  entries: ChangelogEntry[];
  /** Collapse all but the latest entry by default. */
  collapsed?: boolean;
  title?: ReactNode;
}

export const Changelog = forwardRef<HTMLElement, ChangelogProps>(
  function Changelog(
    { entries, collapsed = false, title = "Changelog", className, ...props },
    ref
  ) {
    const [expanded, setExpanded] = useState(() =>
      new Set(collapsed ? [0] : entries.map((_, i) => i))
    );
    const toggle = (i: number) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      });
    };
    return (
      <section
        ref={ref}
        className={cx("vf-changelog", className)}
        aria-label={typeof title === "string" ? title : "Changelog"}
        {...props}
      >
        {title && <header className="vf-changelog__title">{title}</header>}
        <ol className="vf-changelog__entries">
          {entries.map((entry, i) => {
            const isOpen = expanded.has(i);
            return (
              <li key={i} className="vf-changelog__entry">
                <button
                  type="button"
                  className="vf-changelog__head"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                >
                  <span className="vf-changelog__caret" aria-hidden="true">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="vf-changelog__version">{entry.version}</span>
                  {entry.date && (
                    <span className="vf-changelog__date">{entry.date}</span>
                  )}
                  {entry.title && (
                    <span className="vf-changelog__entry-title">
                      {entry.title}
                    </span>
                  )}
                </button>
                {isOpen && (
                  <ul className="vf-changelog__changes">
                    {entry.changes.map((c, j) => (
                      <li
                        key={j}
                        className={cx(
                          "vf-changelog__change",
                          c.kind && `vf-changelog__change--${c.kind}`
                        )}
                      >
                        {c.kind && (
                          <span className="vf-changelog__kind">{c.kind}</span>
                        )}
                        <span className="vf-changelog__desc">
                          {c.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    );
  }
);
Changelog.displayName = "Changelog";

// ── WhatsNewPopover ─────────────────────────────────────────

export interface WhatsNewFeature {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}

export interface WhatsNewPopoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  version: string;
  features: WhatsNewFeature[];
  open?: boolean;
  onDismiss?: () => void;
  /** localStorage key to remember dismissed versions. */
  storageKey?: string;
  /** Supply a custom storage for tests / SSR. */
  storage?: { get: (k: string) => string | null; set: (k: string, v: string) => void };
  title?: ReactNode;
  ctaLabel?: ReactNode;
}

export const WhatsNewPopover = forwardRef<HTMLDivElement, WhatsNewPopoverProps>(
  function WhatsNewPopover(
    {
      version,
      features,
      open,
      onDismiss,
      storageKey = "vf-whatsnew",
      storage,
      title = "What's new",
      ctaLabel = "Got it",
      className,
      ...props
    },
    ref
  ) {
    const [dismissed, setDismissed] = useState<string | null>(null);
    useEffect(() => {
      if (open !== undefined) return;
      try {
        const seen = storage
          ? storage.get(storageKey)
          : typeof localStorage !== "undefined"
          ? localStorage.getItem(storageKey)
          : null;
        setDismissed(seen);
      } catch {
        setDismissed(null);
      }
    }, [storageKey, storage, open]);
    const effectiveOpen = open ?? dismissed !== version;
    if (!effectiveOpen) return null;
    const dismiss = () => {
      try {
        if (storage) storage.set(storageKey, version);
        else if (typeof localStorage !== "undefined")
          localStorage.setItem(storageKey, version);
        setDismissed(version);
      } catch {
        /* noop */
      }
      onDismiss?.();
    };
    return (
      <div
        ref={ref}
        role="dialog"
        aria-label={typeof title === "string" ? title : "What's new"}
        className={cx("vf-whats-new", className)}
        {...props}
      >
        <header className="vf-whats-new__header">
          <span className="vf-whats-new__title">{title}</span>
          <span className="vf-whats-new__version">v{version}</span>
          <button
            type="button"
            className="vf-whats-new__close"
            aria-label="Close"
            onClick={dismiss}
          >
            ✕
          </button>
        </header>
        <ul className="vf-whats-new__features">
          {features.map((f, i) => (
            <li key={i} className="vf-whats-new__feature">
              {f.icon && (
                <span className="vf-whats-new__feature-icon" aria-hidden="true">
                  {f.icon}
                </span>
              )}
              <span className="vf-whats-new__feature-body">
                <span className="vf-whats-new__feature-title">{f.title}</span>
                {f.description && (
                  <span className="vf-whats-new__feature-desc">
                    {f.description}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <footer className="vf-whats-new__footer">
          <button
            type="button"
            className="vf-whats-new__cta"
            onClick={dismiss}
          >
            {ctaLabel}
          </button>
        </footer>
      </div>
    );
  }
);
WhatsNewPopover.displayName = "WhatsNewPopover";
