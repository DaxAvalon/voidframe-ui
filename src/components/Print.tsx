// Phase 13 — Print layout + button

import {
  forwardRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { cx } from "../utils/cx";

// ── PrintLayout ─────────────────────────────────────────────

export interface PrintLayoutProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  includeHeader?: boolean;
  includeFooter?: boolean;
  footer?: ReactNode;
  pageBreakInside?: "auto" | "avoid";
  children?: ReactNode;
}

export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  function PrintLayout(
    {
      title,
      subtitle,
      includeHeader = true,
      includeFooter = false,
      footer,
      pageBreakInside = "avoid",
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-print-layout",
          `vf-print-layout--break-${pageBreakInside}`,
          className
        )}
        style={style}
        data-print-layout=""
        {...props}
      >
        {includeHeader && (title || subtitle) && (
          <header className="vf-print-layout__header">
            {title && (
              <h1 className="vf-print-layout__title">{title}</h1>
            )}
            {subtitle && (
              <p className="vf-print-layout__subtitle">{subtitle}</p>
            )}
          </header>
        )}
        <main className="vf-print-layout__body">{children}</main>
        {includeFooter && (
          <footer className="vf-print-layout__footer">{footer}</footer>
        )}
      </div>
    );
  }
);
PrintLayout.displayName = "PrintLayout";

// ── PrintButton ─────────────────────────────────────────────
//
// Triggers the browser print dialog. When `target` is given, clones
// that node's HTML into a temporary iframe and prints just that
// subtree. Otherwise invokes `window.print()`.

export interface PrintButtonProps extends HTMLAttributes<HTMLButtonElement> {
  target?: RefObject<HTMLElement>;
  documentTitle?: string;
  children?: ReactNode;
}

export const PrintButton = forwardRef<HTMLButtonElement, PrintButtonProps>(
  function PrintButton(
    { target, documentTitle, className, children = "Print", onClick, ...props },
    ref
  ) {
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (typeof window === "undefined") return;
        if (target?.current) {
          printNode(target.current, documentTitle);
        } else {
          if (documentTitle) {
            const orig = document.title;
            document.title = documentTitle;
            try {
              window.print();
            } finally {
              document.title = orig;
            }
          } else {
            window.print();
          }
        }
      },
      [target, documentTitle, onClick]
    );
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-print-button", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PrintButton.displayName = "PrintButton";

function printNode(node: HTMLElement, title?: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(`<!doctype html><html><head>`);
  if (title) doc.write(`<title>${escapeHTML(title)}</title>`);
  for (const link of Array.from(document.querySelectorAll('link[rel="stylesheet"]'))) {
    doc.write(link.outerHTML);
  }
  for (const style of Array.from(document.querySelectorAll("style"))) {
    doc.write(style.outerHTML);
  }
  doc.write(`</head><body>`);
  doc.write(node.outerHTML);
  doc.write(`</body></html>`);
  doc.close();
  const cleanup = () => {
    setTimeout(() => document.body.removeChild(iframe), 500);
  };
  iframe.contentWindow?.focus();
  iframe.contentWindow?.addEventListener("afterprint", cleanup);
  try {
    iframe.contentWindow?.print();
  } finally {
    setTimeout(cleanup, 10_000);
  }
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
