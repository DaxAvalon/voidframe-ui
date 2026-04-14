import { forwardRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── Breadcrumb ────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: string;
  style?: CSSProperties;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ items, separator = "/", className, style, ...props }, ref) {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cx("vf-breadcrumb", className)}
        style={style}
        {...props}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <div key={i} className="vf-breadcrumb__item">
              {i > 0 && (
                <span aria-hidden="true" className="vf-breadcrumb__sep">
                  {separator}
                </span>
              )}
              <span
                onClick={!isLast ? item.onClick : undefined}
                aria-current={isLast ? "page" : undefined}
                className="vf-breadcrumb__link"
                style={!isLast && item.onClick ? undefined : { cursor: "default" }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

// ── Pagination ────────────────────────────────────────────────

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  total: number;
  onChange: (page: number) => void;
  style?: CSSProperties;
}

type PageEntry =
  | { type: "ellipsis"; key: string }
  | { type: "page"; num: number; key: number };

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination({ page, total, onChange, className, style, ...props }, ref) {
    const pages: PageEntry[] = [];
    const show = (n: number) =>
      n === 1 || n === total || (n >= page - 1 && n <= page + 1);
    let lastShown = 0;
    for (let i = 1; i <= total; i++) {
      if (show(i)) {
        if (lastShown && i - lastShown > 1) {
          pages.push({ type: "ellipsis", key: `e${i}` });
        }
        pages.push({ type: "page", num: i, key: i });
        lastShown = i;
      }
    }
    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={cx("vf-pagination", className)}
        style={style}
        {...props}
      >
        <PaginationBtn
          aria-label="Previous page"
          onClick={() => page > 1 && onChange(page - 1)}
          disabled={page <= 1}
        >
          ◂
        </PaginationBtn>
        {pages.map((p) =>
          p.type === "ellipsis" ? (
            <span key={p.key} aria-hidden="true" className="vf-pagination__ellipsis">
              …
            </span>
          ) : (
            <PaginationBtn
              key={p.key}
              aria-label={`Page ${p.num}`}
              aria-current={page === p.num ? "page" : undefined}
              onClick={() => onChange(p.num)}
            >
              {p.num}
            </PaginationBtn>
          )
        )}
        <PaginationBtn
          aria-label="Next page"
          onClick={() => page < total && onChange(page + 1)}
          disabled={page >= total}
        >
          ▸
        </PaginationBtn>
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

function PaginationBtn({ children, onClick, disabled, className, ...rest }: PaginationBtnProps) {
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

export interface StepperProps extends React.OlHTMLAttributes<HTMLOListElement> {
  steps: string[];
  current: number;
  style?: CSSProperties;
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, className, style, ...props },
  ref
) {
  return (
    <ol
      ref={ref}
      className={cx("vf-stepper", className)}
      style={style}
      aria-label="Progress steps"
      {...(props as React.OlHTMLAttributes<HTMLOListElement>)}
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const bulletClass = done
          ? "vf-stepper__bullet--done"
          : active
            ? "vf-stepper__bullet--active"
            : "vf-stepper__bullet--pending";
        const stepStyle: CSSProperties = {
          flex: i < steps.length - 1 ? 1 : "none",
          listStyle: "none",
          display: "flex",
          alignItems: "center",
        };
        return (
          <li
            key={i}
            className="vf-stepper__step"
            style={stepStyle}
            aria-current={active ? "step" : undefined}
          >
            <div className="vf-stepper__node">
              <div
                className={cx("vf-stepper__bullet", bulletClass)}
                aria-hidden="true"
              >
                {done ? "✓" : i + 1}
              </div>
              <Label
                style={{
                  color: done
                    ? "var(--vf-green)"
                    : active
                      ? "var(--vf-amber)"
                      : "var(--vf-text-4)",
                }}
              >
                {step}
              </Label>
            </div>
            {i < steps.length - 1 && (
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
Stepper.displayName = "Stepper";

// ── NavItem ───────────────────────────────────────────────────

export interface NavItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  active?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  /** Indentation level (multiplies by 14px). */
  indent?: number;
  style?: CSSProperties;
}

export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  { children, active, icon, onClick, indent = 0, className, style, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(indent ? { paddingLeft: `calc(var(--vf-sp-5) + ${indent * 14}px)` } : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      onClick={onClick}
      data-active={active ? "true" : undefined}
      className={cx("vf-nav-item", className)}
      style={inline}
      {...props}
    >
      {icon && <span className="vf-nav-item__icon">{icon}</span>}
      {children}
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
      <div className="vf-nav-group__head" onClick={() => setOpen(!open)}>
        <Label>{title}</Label>
        <span aria-hidden="true" className="vf-nav-group__caret">
          ▼
        </span>
      </div>
      {open && children}
    </div>
  );
});
NavGroup.displayName = "NavGroup";
