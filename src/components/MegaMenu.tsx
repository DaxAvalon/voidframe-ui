// Phase 8 — MegaMenu
//
// Multi-column dropdown for large navigation structures (product catalogs,
// docs sections). Uses the same trigger/open pattern as Menu but lays out its
// content as a CSS grid of labeled sections.

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useClickOutside, useId } from "../hooks";
import { cx } from "../utils/cx";

interface MegaMenuContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  contentId: string;
  triggerId: string;
}
const MegaMenuContext = createContext<MegaMenuContextValue | null>(null);
function useMegaMenu(): MegaMenuContextValue {
  const ctx = useContext(MegaMenuContext);
  if (!ctx) throw new Error("MegaMenu.* must be used inside <MegaMenu>");
  return ctx;
}

export interface MegaMenuProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

const MegaMenuBase = forwardRef<HTMLDivElement, MegaMenuProps>(function MegaMenu(
  { open, defaultOpen, onOpenChange, className, children, ...props },
  ref
) {
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const isOpen = open ?? internal;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  const contentId = useId();
  const triggerId = useId();
  const ctxValue = useMemo<MegaMenuContextValue>(
    () => ({ open: isOpen, setOpen, contentId, triggerId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, contentId, triggerId]
  );
  return (
    <MegaMenuContext.Provider value={ctxValue}>
      <div
        ref={ref}
        className={cx("vf-megamenu", className)}
        {...props}
      >
        {children}
      </div>
    </MegaMenuContext.Provider>
  );
});
MegaMenuBase.displayName = "MegaMenu";

export interface MegaMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

function MegaMenuTrigger({
  children,
  className,
  onClick,
  ...props
}: MegaMenuTriggerProps) {
  const ctx = useMegaMenu();
  return (
    <button
      type="button"
      id={ctx.triggerId}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      aria-controls={ctx.contentId}
      className={cx("vf-megamenu__trigger", className)}
      onClick={(e) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export interface MegaMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns the content grid spans. Default 3. */
  columns?: number;
  /** Max content width. */
  width?: number | string;
  children?: ReactNode;
}

function MegaMenuContent({
  columns = 3,
  width = 720,
  className,
  style,
  children,
  ...props
}: MegaMenuContentProps) {
  const ctx = useMegaMenu();
  const outsideRef = useClickOutside<HTMLDivElement>(() => ctx.setOpen(false));

  useEffect(() => {
    if (!ctx.open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);

  if (!ctx.open) return null;

  const merged: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    width: typeof width === "number" ? `${width}px` : width,
    ...style,
  };

  return (
    <div
      ref={outsideRef}
      id={ctx.contentId}
      role="menu"
      aria-labelledby={ctx.triggerId}
      className={cx("vf-megamenu__content", className)}
      style={merged}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MegaMenuSectionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  children?: ReactNode;
}

function MegaMenuSection({
  title,
  className,
  children,
  ...props
}: MegaMenuSectionProps) {
  return (
    <div
      role="group"
      className={cx("vf-megamenu__section", className)}
      {...props}
    >
      {title && (
        <div className="vf-megamenu__section-title">{title}</div>
      )}
      <ul className="vf-megamenu__section-list">{children}</ul>
    </div>
  );
}

export interface MegaMenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  description?: ReactNode;
}

const MegaMenuLink = forwardRef<HTMLAnchorElement, MegaMenuLinkProps>(
  function MegaMenuLink({ description, className, children, ...props }, ref) {
    return (
      <li className="vf-megamenu__link-item">
        <a
          ref={ref}
          role="menuitem"
          className={cx("vf-megamenu__link", className)}
          {...props}
        >
          <span className="vf-megamenu__link-label">{children}</span>
          {description && (
            <span className="vf-megamenu__link-description">{description}</span>
          )}
        </a>
      </li>
    );
  }
);
MegaMenuLink.displayName = "MegaMenuLink";

export const MegaMenu = Object.assign(MegaMenuBase, {
  Trigger: MegaMenuTrigger,
  Content: MegaMenuContent,
  Section: MegaMenuSection,
  Link: MegaMenuLink,
});
