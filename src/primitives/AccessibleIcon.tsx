import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { VisuallyHidden } from "./VisuallyHidden";

export interface AccessibleIconProps {
  /** Accessible name for screen readers. */
  label: string;
  children: ReactNode;
}

/**
 * Wrap a decorative SVG/glyph with an accessible label. The icon itself
 * is marked `aria-hidden`, and the label renders in a `VisuallyHidden` sibling.
 *
 * @example
 * <AccessibleIcon label="Close"><XIcon /></AccessibleIcon>
 */
export function AccessibleIcon({ label, children }: AccessibleIconProps) {
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement, {
        "aria-hidden": true,
        focusable: false,
      } as never)
    : Children.only(children);

  return (
    <>
      {child}
      <VisuallyHidden>{label}</VisuallyHidden>
    </>
  );
}
