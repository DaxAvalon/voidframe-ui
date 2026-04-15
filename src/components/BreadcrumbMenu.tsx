"use client";

// Phase 8 — BreadcrumbMenu
//
// Variant of Breadcrumb where each non-current segment can expose a dropdown
// of sibling pages. Each item accepts a `siblings` array; clicking the caret
// next to the label opens a menu, clicking the label navigates.

import {
  forwardRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useClickOutside, useId } from "../hooks";
import { cx } from "../utils/cx";

export interface BreadcrumbMenuSibling {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbMenuItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Sibling list surfaced via the disclosure caret. */
  siblings?: BreadcrumbMenuSibling[];
}

export interface BreadcrumbMenuProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbMenuItem[];
  separator?: ReactNode;
  style?: CSSProperties;
}

export const BreadcrumbMenu = forwardRef<HTMLElement, BreadcrumbMenuProps>(
  function BreadcrumbMenu(
    { items, separator = "/", className, style, ...props },
    ref
  ) {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cx("vf-breadcrumb-menu", className)}
        style={style}
        {...props}
      >
        <ol className="vf-breadcrumb-menu__list">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="vf-breadcrumb-menu__item-wrap">
                {i > 0 && (
                  <span aria-hidden="true" className="vf-breadcrumb-menu__sep">
                    {separator}
                  </span>
                )}
                <BreadcrumbMenuSegment item={item} current={isLast} />
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
BreadcrumbMenu.displayName = "BreadcrumbMenu";

interface SegmentProps {
  item: BreadcrumbMenuItem;
  current: boolean;
}

function BreadcrumbMenuSegment({ item, current }: SegmentProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const hasSiblings = !current && (item.siblings?.length ?? 0) > 0;

  const Label = (
    <LinkOrSpan
      href={item.href}
      onClick={item.onClick}
      current={current}
      className="vf-breadcrumb-menu__link"
    >
      {item.label}
    </LinkOrSpan>
  );

  return (
    <div className="vf-breadcrumb-menu__segment" ref={ref}>
      {Label}
      {hasSiblings && (
        <>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={`Sibling pages of ${typeof item.label === "string" ? item.label : "this segment"}`}
            className="vf-breadcrumb-menu__caret"
            onClick={() => setOpen(!open)}
          >
            ▾
          </button>
          {open && (
            <ul
              id={menuId}
              role="menu"
              className="vf-breadcrumb-menu__popover"
            >
              {item.siblings!.map((sib, i) => (
                <li key={i} role="none">
                  <LinkOrSpan
                    href={sib.href}
                    onClick={() => {
                      sib.onClick?.();
                      setOpen(false);
                    }}
                    role="menuitem"
                    className="vf-breadcrumb-menu__sibling"
                  >
                    {sib.label}
                  </LinkOrSpan>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

interface LinkOrSpanProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  current?: boolean;
  onClick?: () => void;
  role?: string;
}

function LinkOrSpan({
  href,
  onClick,
  current,
  children,
  className,
  role,
  ...props
}: LinkOrSpanProps) {
  if (current || (!href && !onClick)) {
    return (
      <span
        aria-current={current ? "page" : undefined}
        className={className}
        {...(props as HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    );
  }
  return (
    <a
      href={href ?? "#"}
      role={role}
      className={className}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      {...props}
    >
      {children}
    </a>
  );
}
