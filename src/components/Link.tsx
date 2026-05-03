"use client";

// Phase B — Link primitive
//
// Voidframe previously shipped no dedicated link component: `Anchor` is a
// scroll-nav widget (confusing name), and consumers fell back to styled
// `<a>` or `<button>` with hand-rolled hover/focus/color rules.
//
// `<Link>` is a minimal text-link primitive that inherits voidframe token
// colors + focus ring and forwards refs to the rendered element. Accepts
// `as` for integration with react-router / next/link / other framework
// link components without losing the voidframe styling.

import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  CSSProperties,
  ComponentType,
  ElementType,
  ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { safeHrefOrWarn } from "../utils/safeHref";
import { toneAttrs } from "../utils/toneAttrs";

export type LinkVariant = "inline" | "standalone" | "muted";
export type LinkTone = "neutral" | "info" | "success" | "danger" | "warning";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  href?: string;
  /**
   * Render as a different element or framework-specific link component
   * (e.g. react-router's `Link`). The value receives the same props the
   * default `<a>` would get. Defaults to native `<a>`.
   */
  as?: ElementType | ComponentType<Record<string, unknown>>;
  /**
   * Visual variant.
   * - `"inline"` (default) — underlined accent-color link, suitable inside
   *   prose.
   * - `"standalone"` — no underline; block-style link for nav / CTAs.
   * - `"muted"` — low-emphasis; muted text color, underline on hover.
   */
  variant?: LinkVariant;
  /**
   * Semantic tone. Mirrors Button/Badge. Emits `data-tone` + primes
   * `--vf-accent` when set.
   */
  tone?: LinkTone;
  /**
   * Mark a link as external. Auto-adds `target="_blank"` + secure rel
   * values (`noopener noreferrer`) if not explicitly set.
   */
  external?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Text link primitive. Inherits voidframe accent + focus treatment. Use
 * `as` to integrate with router-link components while keeping styling.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    as,
    href,
    variant = "inline",
    tone,
    external,
    target,
    rel,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const Component = (as ?? "a") as ElementType;
  const composedStyle: CSSProperties = {
    ...(tone && tone !== "neutral"
      ? ({ "--vf-accent": `var(--vf-${tone})` } as CSSProperties)
      : {}),
    ...style,
  };
  const resolvedHref = href ? safeHrefOrWarn(href, "Link") : undefined;
  const resolvedTarget = target ?? (external ? "_blank" : undefined);
  const resolvedRel =
    rel ?? (external || resolvedTarget === "_blank" ? "noopener noreferrer" : undefined);
  const ta = toneAttrs("vf-link", { tone, variant });
  return (
    <Component
      ref={ref}
      href={resolvedHref}
      target={resolvedTarget}
      rel={resolvedRel}
      className={cx(ta.className, className)}
      style={composedStyle}
      {...ta.attrs}
      {...props}
    >
      {children}
    </Component>
  );
});
Link.displayName = "Link";
