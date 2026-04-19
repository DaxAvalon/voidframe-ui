"use client";

// Anchor — scrollspy-driven table of contents that highlights the
// currently visible section.

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

// ── Types ────────────────────────────────────────────────────

export interface AnchorItem {
  key: string;
  label: string;
  href: string; // #section-id
  children?: AnchorItem[];
}

export interface AnchorProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  items: AnchorItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onActiveChange?: (key: string) => void;
  /** Scroll offset for fixed headers. Default 80. */
  offset?: number;
  /** Smooth scroll on click. Default true. */
  smooth?: boolean;
  /** Make the nav sticky. Default false. */
  affix?: boolean;
  /** Top offset when affix is true. */
  affixOffset?: number;
  orientation?: "vertical" | "horizontal";
  /** Active indicator style. Default "line". */
  indicator?: "line" | "dot" | "none";
}

// ── Component ────────────────────────────────────────────────

const AnchorBase = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  {
    items,
    activeKey,
    defaultActiveKey,
    onActiveChange,
    offset = 80,
    smooth = true,
    affix = false,
    affixOffset,
    orientation = "vertical",
    indicator = "line",
    className,
    style,
    ...props
  },
  ref,
) {
  const [current, setCurrent] = useControllableState<string>({
    value: activeKey,
    defaultValue: defaultActiveKey ?? "",
    onChange: onActiveChange,
    componentName: "Anchor",
  });

  const handleClick = useCallback(
    (key: string, href: string, e: MouseEvent) => {
      e.preventDefault();
      setCurrent(key);

      // Scroll to target element
      const id = href.replace(/^#/, "");
      if (typeof document !== "undefined") {
        const el = document.getElementById(id);
        if (el) {
          const top =
            el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top,
            behavior: smooth ? "smooth" : "auto",
          });
        }
      }
    },
    [offset, smooth, setCurrent],
  );

  // Flatten items into [key, id] pairs for IntersectionObserver.
  const observableEntries = useMemo(() => {
    const out: { key: string; id: string }[] = [];
    const walk = (list: AnchorItem[]) => {
      for (const item of list) {
        if (item.href.startsWith("#")) {
          const id = item.href.slice(1);
          if (id) out.push({ key: item.key, id });
        }
        if (item.children) walk(item.children);
      }
    };
    walk(items);
    return out;
  }, [items]);

  // Scrollspy — observe each target section, set the first-intersecting one
  // as the current active key. Preserves the click-driven `setCurrent` path.
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const targets: { el: Element; key: string }[] = [];
    for (const entry of observableEntries) {
      const el = document.getElementById(entry.id);
      if (el) targets.push({ el, key: entry.key });
    }
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the first intersecting entry with the greatest intersectionRatio.
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        intersecting.sort(
          (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
        );
        const top = intersecting[0]!;
        const match = targets.find((t) => t.el === top.target);
        if (match) setCurrent(match.key);
      },
      {
        rootMargin: `-${offset}px 0px 0px 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    for (const t of targets) io.observe(t.el);
    return () => io.disconnect();
  }, [observableEntries, offset, setCurrent]);

  const affixStyle: CSSProperties | undefined =
    affix
      ? {
          position: "sticky" as const,
          top: affixOffset ?? 0,
          ...style,
        }
      : style;

  const renderItems = (list: AnchorItem[], nested = false) => (
    <ul className="vf-anchor__list">
      {list.map((item) => {
        const isActive = current === item.key;
        return (
          <li
            key={item.key}
            className={cx(
              "vf-anchor__item",
              nested && "vf-anchor__item--nested",
            )}
          >
            {indicator !== "none" && isActive && (
              <span
                className={cx(
                  "vf-anchor__indicator",
                  `vf-anchor__indicator--${indicator}`,
                )}
              />
            )}
            <a
              href={item.href}
              className={cx(
                "vf-anchor__link",
                isActive && "vf-anchor__link--active",
              )}
              aria-current={isActive ? "true" : undefined}
              onClick={(e) => handleClick(item.key, item.href, e)}
            >
              {item.label}
            </a>
            {item.children && item.children.length > 0 && (
              renderItems(item.children, true)
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      ref={ref}
      className={cx(
        "vf-anchor",
        `vf-anchor--${orientation}`,
        `vf-anchor--indicator-${indicator}`,
        affix && "vf-anchor--affix",
        className,
      )}
      style={affixStyle}
      aria-label="Table of contents"
      {...props}
    >
      {renderItems(items)}
    </nav>
  );
});

export const Anchor = memo(AnchorBase);
(Anchor as unknown as { displayName: string }).displayName = "Anchor";
