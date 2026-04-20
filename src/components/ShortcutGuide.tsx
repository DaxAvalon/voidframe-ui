"use client";

// Phase 8 — ShortcutGuide
//
// Overlay listing every shortcut currently registered via `useShortcut` under
// a `ShortcutProvider`. Toggled by default with `?` (and closed with
// `Escape`). Shortcuts are grouped when an explicit `group` is provided.

import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import { Shortcut } from "./NavigationExtended";
import { useShortcutRegistry } from "../hooks/useShortcuts";

function shortcutMatches(keys: string, e: KeyboardEvent): boolean {
  const parts = keys.split("+").map((p) => p.trim().toLowerCase());
  const wantsMod = parts.includes("mod") || parts.includes("cmd");
  const wantsCtrl = parts.includes("ctrl");
  const wantsShift = parts.includes("shift");
  const wantsAlt = parts.includes("alt") || parts.includes("opt");
  const key = parts.find(
    (p) => !["mod", "cmd", "ctrl", "shift", "alt", "opt"].includes(p)
  );
  if (!key) return false;
  if (e.key.toLowerCase() !== key.toLowerCase()) return false;
  if (wantsMod && !(e.metaKey || e.ctrlKey)) return false;
  if (wantsCtrl && !e.ctrlKey) return false;
  if (wantsShift !== e.shiftKey) return false;
  if (wantsAlt !== e.altKey) return false;
  return true;
}

export interface ShortcutGuideProps extends HTMLAttributes<HTMLDivElement> {
  /** Key combo that toggles the guide. Default "?". */
  triggerKeys?: string;
  /** When true, the guide is always visible (useful for docs). */
  alwaysVisible?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  /** Don't bind the trigger key globally. */
  noAutoBind?: boolean;
  style?: CSSProperties;
}

/**
 * Overlay that lists all registered keyboard shortcuts grouped by scope.
 * Populated via `ShortcutProvider`.
 *
 * Non-modal by design: the guide is intended as an on-demand reference
 * (press `?` → peek → dismiss) rather than a task-blocking dialog, so it
 * does not portal, trap focus, or scroll-lock the page. If you need a
 * modal cheat-sheet, wrap it in a `<Dialog>` instead.
 */
export const ShortcutGuide = forwardRef<HTMLDivElement, ShortcutGuideProps>(
  function ShortcutGuide(
    {
      triggerKeys = "?",
      alwaysVisible,
      open,
      onOpenChange,
      title = "Keyboard shortcuts",
      noAutoBind,
      className,
      style,
      ...props
    },
    ref
  ) {
    const registry = useShortcutRegistry();
    const [internal, setInternal] = useState(false);
    const isOpen = alwaysVisible || (open ?? internal);
    const setOpen = (next: boolean) => {
      if (open === undefined) setInternal(next);
      onOpenChange?.(next);
    };

    // Bind the trigger + Escape directly rather than via useShortcut so the
    // guide's own bindings don't pollute the list it displays.
    useEffect(() => {
      if (noAutoBind || alwaysVisible) return;
      const listener = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        const inInput =
          target instanceof HTMLElement &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);
        if (inInput) return;
        if (shortcutMatches(triggerKeys, e)) {
          e.preventDefault();
          setOpen(!isOpen);
        } else if (e.key === "Escape" && isOpen) {
          e.preventDefault();
          setOpen(false);
        }
      };
      window.addEventListener("keydown", listener);
      return () => window.removeEventListener("keydown", listener);
    }, [triggerKeys, isOpen, alwaysVisible, noAutoBind]);

    if (!isOpen) return null;

    // Group entries by `group ?? "General"`.
    const list = registry?.list ?? [];
    const groups = new Map<string, typeof list>();
    for (const entry of list) {
      const g = entry.group ?? "General";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(entry);
    }

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx("vf-shortcut-guide", className)}
        style={style}
        onClick={(e) => {
          // Click on the backdrop (the root) closes the guide.
          if (e.target === e.currentTarget && !alwaysVisible) setOpen(false);
        }}
        {...props}
      >
        <div className="vf-shortcut-guide__panel">
          <header className="vf-shortcut-guide__header">
            <h2 className="vf-shortcut-guide__title">{title}</h2>
            {!alwaysVisible && (
              <button
                type="button"
                className="vf-shortcut-guide__close"
                aria-label="Close shortcut guide"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            )}
          </header>
          {groups.size === 0 ? (
            <p className="vf-shortcut-guide__empty">
              No shortcuts registered.
            </p>
          ) : (
            [...groups.entries()].map(([groupName, entries]) => (
              <section
                key={groupName}
                className="vf-shortcut-guide__group"
                aria-label={groupName}
              >
                <h3 className="vf-shortcut-guide__group-title">{groupName}</h3>
                <ul className="vf-shortcut-guide__list">
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      className={cx(
                        "vf-shortcut-guide__row",
                        !entry.enabled && "vf-shortcut-guide__row--disabled"
                      )}
                    >
                      <span className="vf-shortcut-guide__description">
                        {entry.description ?? entry.id}
                      </span>
                      <Shortcut keys={entry.keys} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    );
  }
);
ShortcutGuide.displayName = "ShortcutGuide";
