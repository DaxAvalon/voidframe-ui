import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { VisuallyHidden } from "./VisuallyHidden";

export interface AccessibleIconProps {
  /** Accessible name for screen readers. */
  label: string;
  children: ReactNode;
}

/**
 * Wrap a decorative SVG/glyph with an accessible label. The icon itself
 * is marked `aria-hidden`, and the label renders in a `VisuallyHidden` sibling.
 * The forwarded ref targets the wrapped icon element (typically an `<svg>`),
 * so consumers can measure or focus-control it through the primitive.
 *
 * @example
 * <AccessibleIcon label="Close"><XIcon /></AccessibleIcon>
 */
export const AccessibleIcon = forwardRef<Element, AccessibleIconProps>(
  function AccessibleIcon({ label, children }, ref) {
    const child = isValidElement(children)
      ? cloneElement(children as ReactElement, {
          ref: ref as Ref<Element>,
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
);
AccessibleIcon.displayName = "AccessibleIcon";
