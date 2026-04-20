"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type OlHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { safeHref } from "../utils/safeHref";
import { Label } from "./Text";

// ── Breadcrumb ────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Legacy items array. Compound `<Breadcrumb.Item>` children are preferred. */
  items?: BreadcrumbItem[];
  /** Separator between segments. Default "/". */
  separator?: ReactNode;
  /** Collapse the middle segments behind an ellipsis when the count exceeds this. */
  maxItems?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

const BreadcrumbBase = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      items,
      separator = "/",
      maxItems,
      children,
      className,
      style,
      ...props
    },
    ref
  ) {
    // Resolve segments either from `items` prop or from compound children.
    const segments: ReactElement[] = [];
    if (items && items.length > 0) {
      items.forEach((item, i) => {
        const isLast = i === items.length - 1;
        segments.push(
          <BreadcrumbItemComponent
            key={i}
            href={item.href}
            onClick={item.onClick}
            current={isLast}
          >
            {item.label}
          </BreadcrumbItemComponent>
        );
      });
    } else {
      Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;
        segments.push(child as ReactElement);
      });
    }

    // Apply maxItems collapse.
    const collapsed =
      maxItems && segments.length > maxItems
        ? (() => {
            const keep = maxItems;
            const start = segments.slice(0, 1);
            const end = segments.slice(segments.length - (keep - 1));
            const ellipsis = (
              <span
                key="vf-ellipsis"
                aria-hidden="true"
                className="vf-breadcrumb__ellipsis"
              >
                …
              </span>
            );
            return [...start, ellipsis, ...end];
          })()
        : segments;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cx("vf-breadcrumb", className)}
        style={style}
        {...props}
      >
        <ol className="vf-breadcrumb__list">
          {collapsed.map((seg, i) => (
            <li key={i} className="vf-breadcrumb__item-wrap">
              {i > 0 && (
                <span aria-hidden="true" className="vf-breadcrumb__sep">
                  {separator}
                </span>
              )}
              {seg}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);
BreadcrumbBase.displayName = "Breadcrumb";

export interface BreadcrumbItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  /** Mark this item as the current page. */
  current?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const BreadcrumbItemComponent = forwardRef<
  HTMLAnchorElement,
  BreadcrumbItemProps
>(function BreadcrumbItem(
  { current, href, onClick, children, className, ...props },
  ref
) {
  const common = {
    "aria-current": current ? ("page" as const) : undefined,
    className: cx(
      "vf-breadcrumb__link",
      current && "vf-breadcrumb__link--current",
      className
    ),
    ...props,
  };
  if (current || (!href && !onClick)) {
    return (
      <span {...(common as HTMLAttributes<HTMLSpanElement>)}>{children}</span>
    );
  }
  return (
    <a
      ref={ref}
      href={safeHref(href ?? "#")}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      {...common}
    >
      {children}
    </a>
  );
});
BreadcrumbItemComponent.displayName = "BreadcrumbItem";

/**
 * Breadcrumb trail as a WAI-ARIA `nav` + `ol`. Dual API: pass `items`
 * (label/href/onClick) or compose `Breadcrumb.Item` children. Customize
 * the `separator` and collapse middle segments with `maxItems`.
 */
export const Breadcrumb = Object.assign(BreadcrumbBase, {
  Item: BreadcrumbItemComponent,
});

// ── Pagination ────────────────────────────────────────────────

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: number;
  totalPages: number;
  onValueChange: (page: number) => void;
  /** How many page buttons to show on either side of the current page. Default 1. */
  siblingCount?: number;
  /** Always-shown page count at each end (first and last). Default 1. */
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageSize?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  style?: CSSProperties;
}

type PageEntry =
  | { type: "ellipsis"; key: string }
  | { type: "page"; num: number; key: string };

function computePages(
  page: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): PageEntry[] {
  if (totalPages <= 0) return [];
  const boundary = Math.max(0, boundaryCount);
  const sibling = Math.max(0, siblingCount);
  const startBoundary = Array.from(
    { length: Math.min(boundary, totalPages) },
    (_, i) => i + 1
  );
  const endBoundary = Array.from(
    { length: Math.min(boundary, totalPages) },
    (_, i) => totalPages - i
  ).reverse();
  const siblingStart = Math.max(
    Math.min(page - sibling, totalPages - boundary - sibling * 2 - 1),
    boundary + 2
  );
  const siblingEnd = Math.min(
    Math.max(page + sibling, boundary + sibling * 2 + 2),
    endBoundary.length > 0 ? endBoundary[0]! - 2 : totalPages - 1
  );

  const set = new Set<number>();
  for (const p of startBoundary) set.add(p);
  for (let p = siblingStart; p <= siblingEnd; p++) {
    if (p > 0 && p <= totalPages) set.add(p);
  }
  for (const p of endBoundary) set.add(p);
  // Ensure the active page is always represented, even when
  // boundaryCount + siblingCount collapse to zero entries.
  if (page >= 1 && page <= totalPages) set.add(page);

  const sorted = [...set].sort((a, b) => a - b);
  const out: PageEntry[] = [];
  let previous = 0;
  for (const num of sorted) {
    if (previous && num - previous > 1) {
      out.push({ type: "ellipsis", key: `e${previous}-${num}` });
    }
    out.push({ type: "page", num, key: `p${num}` });
    previous = num;
  }
  return out;
}

/**
 * Offset-based page picker with numbered buttons plus optional prev/next
 * and first/last chevrons. Controlled via `value` + `onValueChange(page)`.
 * Tune the visible range with `siblingCount` and `boundaryCount`; toggle
 * a rows-per-page `<select>` with `showPageSize`.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      value,
      totalPages,
      onValueChange,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstLast = false,
      showPrevNext = true,
      showPageSize = false,
      pageSize,
      pageSizeOptions = [10, 25, 50, 100],
      onPageSizeChange,
      className,
      style,
      ...props
    },
    ref
  ) {
    const entries = computePages(value, totalPages, siblingCount, boundaryCount);
    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={cx("vf-pagination", className)}
        style={style}
        {...props}
      >
        {showFirstLast && (
          <PaginationBtn
            aria-label="First page"
            onClick={() => onValueChange(1)}
            disabled={value <= 1}
          >
            «
          </PaginationBtn>
        )}
        {showPrevNext && (
          <PaginationBtn
            aria-label="Previous page"
            onClick={() => value > 1 && onValueChange(value - 1)}
            disabled={value <= 1}
          >
            ‹
          </PaginationBtn>
        )}
        {entries.map((p) =>
          p.type === "ellipsis" ? (
            <span
              key={p.key}
              aria-hidden="true"
              className="vf-pagination__ellipsis"
            >
              …
            </span>
          ) : (
            <PaginationBtn
              key={p.key}
              aria-label={`Page ${p.num}`}
              aria-current={value === p.num ? "page" : undefined}
              onClick={() => onValueChange(p.num)}
            >
              {p.num}
            </PaginationBtn>
          )
        )}
        {showPrevNext && (
          <PaginationBtn
            aria-label="Next page"
            onClick={() => value < totalPages && onValueChange(value + 1)}
            disabled={value >= totalPages}
          >
            ›
          </PaginationBtn>
        )}
        {showFirstLast && (
          <PaginationBtn
            aria-label="Last page"
            onClick={() => onValueChange(totalPages)}
            disabled={value >= totalPages}
          >
            »
          </PaginationBtn>
        )}
        {showPageSize && (
          <label className="vf-pagination__page-size">
            <span className="vf-pagination__page-size-label">Per page</span>
            <select
              value={pageSize ?? pageSizeOptions[0]}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </nav>
    );
  }
);
Pagination.displayName = "Pagination";

interface PaginationBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function PaginationBtn({
  children,
  onClick,
  disabled,
  className,
  ...rest
}: PaginationBtnProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cx("vf-pagination__btn", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── Stepper ───────────────────────────────────────────────────
// Dual API:
//   <Stepper steps={["A", "B", "C"]} current={1} />
//   <Stepper current={1}>
//     <Stepper.Step label="A" description="Basic info" />
//     <Stepper.Step label="B" optional />
//   </Stepper>

export type StepperVariant = "numbered" | "dotted";
export type StepperOrientation = "horizontal" | "vertical";

export interface StepperProps
  extends Omit<OlHTMLAttributes<HTMLOListElement>, "onChange"> {
  /** Legacy string-array form. Compound `<Stepper.Step>` is preferred. */
  steps?: string[];
  current: number;
  orientation?: StepperOrientation;
  variant?: StepperVariant;
  /** When true, clicking a step index fires onChange. */
  clickable?: boolean;
  onChange?: (index: number) => void;
  children?: ReactNode;
  style?: CSSProperties;
}

export interface StepperStepProps extends HTMLAttributes<HTMLLIElement> {
  label: ReactNode;
  description?: ReactNode;
  optional?: boolean;
}

const StepperStepComponent = forwardRef<HTMLLIElement, StepperStepProps>(
  function StepperStep(
    { label, description, optional, className, ...props },
    ref
  ) {
    // Rendering is handled by the parent Stepper. This component is a data
    // carrier, but can also render a standalone item if used outside.
    return (
      <li
        ref={ref}
        className={cx("vf-stepper__step", className)}
        {...props}
        data-label={String(label)}
        data-optional={optional || undefined}
      >
        {label}
        {description && (
          <span className="vf-stepper__description">{description}</span>
        )}
      </li>
    );
  }
);
StepperStepComponent.displayName = "StepperStep";

const StepperBase = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    steps,
    current,
    orientation = "horizontal",
    variant = "numbered",
    clickable,
    onChange,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  interface StepData {
    label: ReactNode;
    description?: ReactNode;
    optional?: boolean;
  }
  const data: StepData[] = [];
  if (steps && steps.length > 0) {
    for (const label of steps) data.push({ label });
  } else {
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const typed = child as ReactElement<StepperStepProps>;
      if ((typed.type as { displayName?: string }).displayName !== "StepperStep") return;
      data.push({
        label: typed.props.label,
        description: typed.props.description,
        optional: typed.props.optional,
      });
    });
  }

  return (
    <ol
      ref={ref}
      className={cx(
        "vf-stepper",
        `vf-stepper--${orientation}`,
        `vf-stepper--${variant}`,
        className
      )}
      style={style}
      aria-label="Progress steps"
      {...props}
    >
      {data.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const bulletClass = done
          ? "vf-stepper__bullet--done"
          : active
            ? "vf-stepper__bullet--active"
            : "vf-stepper__bullet--pending";
        return (
          <li
            key={i}
            className="vf-stepper__step"
            aria-current={active ? "step" : undefined}
            data-clickable={clickable || undefined}
          >
            <button
              type="button"
              className="vf-stepper__node"
              disabled={!clickable}
              onClick={() => clickable && onChange?.(i)}
              aria-label={typeof step.label === "string" ? step.label : undefined}
            >
              <span
                className={cx("vf-stepper__bullet", bulletClass)}
                aria-hidden="true"
              >
                {variant === "dotted"
                  ? ""
                  : done
                    ? "✓"
                    : i + 1}
              </span>
              <span className="vf-stepper__label-block">
                <Label
                  style={{
                    color: done
                      ? "var(--vf-green)"
                      : active
                        ? "var(--vf-amber)"
                        : "var(--vf-text-4)",
                  }}
                >
                  {step.label}
                  {step.optional && (
                    <span className="vf-stepper__optional"> (optional)</span>
                  )}
                </Label>
                {step.description && (
                  <span className="vf-stepper__description">
                    {step.description}
                  </span>
                )}
              </span>
            </button>
            {i < data.length - 1 && (
              <div
                aria-hidden="true"
                className={cx(
                  "vf-stepper__connector",
                  done && "vf-stepper__connector--done"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
});
StepperBase.displayName = "Stepper";

/**
 * Linear step indicator rendered as an `ol` with completed / active /
 * upcoming states. Dual API: pass a `steps` string array or compose
 * `Stepper.Step` children (with `label`, `description`, `optional`).
 * `numbered` or `dotted` variant; `horizontal` or `vertical` orientation;
 * set `clickable` to wire `onChange(index)`.
 */
export const Stepper = Object.assign(StepperBase, {
  Step: StepperStepComponent,
});

// ── NavItem ───────────────────────────────────────────────────

export interface NavItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  active?: boolean;
  icon?: ReactNode;
  /** Optional trailing content (badge, count, etc). */
  badge?: ReactNode;
  /** Href: when provided, NavItem renders an <a>; otherwise a <div>. */
  href?: string;
  onClick?: () => void;
  /** Indentation level (multiplies by 14px). */
  indent?: number;
  /** Render as a polymorphic element via children (Radix-style asChild). */
  asChild?: boolean;
  style?: CSSProperties;
}

/**
 * Single nav/sidebar item: icon, label, optional badge, active state. Wraps
 * a link.
 */
export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  {
    children,
    active,
    icon,
    badge,
    href,
    onClick,
    indent = 0,
    asChild,
    className,
    style,
    ...props
  },
  ref
) {
  const inline: CSSProperties = {
    ...(indent ? { paddingLeft: `calc(var(--vf-sp-5) + ${indent * 14}px)` } : {}),
    ...style,
  };
  const inner = (
    <>
      {icon && <span className="vf-nav-item__icon">{icon}</span>}
      <span className="vf-nav-item__content">{children}</span>
      {badge && <span className="vf-nav-item__badge">{badge}</span>}
    </>
  );
  const commonProps = {
    className: cx("vf-nav-item", className),
    style: inline,
    "data-active": active ? "true" : undefined,
    "aria-current": active ? ("page" as const) : undefined,
  };
  if (asChild && isValidElement(children)) {
    // Let the caller provide the outer element (e.g. router <Link>).
    const child = children as ReactElement<Record<string, unknown>> & {
      ref?: React.Ref<HTMLElement>;
    };
    // Preserve child's own ref (React 18 shape) alongside forwarded ref from NavItem.
    const childRef = child.ref;
    const mergedRef = (node: HTMLElement | null) => {
      if (typeof childRef === "function") childRef(node);
      else if (childRef && typeof childRef === "object") {
        (childRef as { current: HTMLElement | null }).current = node;
      }
      if (typeof ref === "function") ref(node as unknown as HTMLDivElement);
      else if (ref && typeof ref === "object") {
        (ref as { current: HTMLDivElement | null }).current =
          node as unknown as HTMLDivElement;
      }
    };
    return (
      <>
        {typeof child.type === "function" || typeof child.type === "string"
          ? cloneElement(child, {
              ...(props as Record<string, unknown>),
              ...commonProps,
              onClick,
              ref: mergedRef,
            } as Record<string, unknown>)
          : child}
      </>
    );
  }
  if (href) {
    return (
      <a
        href={safeHref(href)}
        onClick={onClick}
        {...(commonProps as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
        {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      ref={ref}
      onClick={onClick}
      {...commonProps}
      {...props}
    >
      {inner}
    </div>
  );
});
NavItem.displayName = "NavItem";

// ── NavGroup ──────────────────────────────────────────────────

export interface NavGroupProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  style?: CSSProperties;
}

/**
 * Grouped section of a nav/sidebar with an optional heading. Used inside
 * `Sidebar` / `Navbar`.
 */
export const NavGroup = forwardRef<HTMLDivElement, NavGroupProps>(function NavGroup(
  { title, children, defaultOpen = true, className, style, ...props },
  ref
) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      ref={ref}
      className={cx("vf-nav-group", className)}
      style={style}
      data-open={open ? "true" : "false"}
      {...props}
    >
      <button
        type="button"
        className="vf-nav-group__head"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Label>{title}</Label>
        <span aria-hidden="true" className="vf-nav-group__caret">
          ▼
        </span>
      </button>
      {open && <div className="vf-nav-group__body">{children}</div>}
    </div>
  );
});
NavGroup.displayName = "NavGroup";
