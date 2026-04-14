// ═══════════════════════════════════════════════════════════════
// Slot — Radix-style asChild primitive
// Merges its props onto a single child element instead of wrapping it.
// Enables `<Button asChild><Link href="/">Home</Link></Button>` patterns.
// ═══════════════════════════════════════════════════════════════

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { warn } from "../utils/warn";

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Renders its single child element with merged props from the parent.
 *
 * Rules:
 * - Exactly one child element required (dev-warns otherwise).
 * - Event handlers compose: parent's fires after child's.
 * - `style` and `className` merge (child wins on conflict for `style`,
 *   className strings concatenate).
 * - `ref` is merged with the child's existing ref.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef
) {
  if (!isValidElement(children)) {
    warn(
      false,
      "<Slot> expects a single React element child. Got: " +
        (children == null ? "null/undefined" : typeof children)
    );
    return null;
  }

  const child = Children.only(children) as ReactElement & {
    ref?: Ref<HTMLElement>;
  };

  const merged = mergeSlotProps(
    slotProps as Record<string, unknown>,
    (child.props as Record<string, unknown>) ?? {}
  );

  const childRef = (child as { ref?: Ref<HTMLElement> }).ref;
  // useMergedRefs is a hook — calling it conditionally would violate rules,
  // so we always call it. `null` refs are skipped inside.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mergedRef = useMergedRefs(forwardedRef, childRef ?? null);

  return cloneElement(child, { ...merged, ref: mergedRef });
});

Slot.displayName = "Slot";

/** Merge two prop bags following Radix Slot semantics. */
export function mergeSlotProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...childProps };

  for (const key in slotProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    // Event handlers: compose. Both fire; child first, slot second.
    if (/^on[A-Z]/.test(key) && typeof slotValue === "function") {
      if (typeof childValue === "function") {
        out[key] = (...args: unknown[]) => {
          (childValue as (...args: unknown[]) => void)(...args);
          (slotValue as (...args: unknown[]) => void)(...args);
        };
      } else {
        out[key] = slotValue;
      }
      continue;
    }

    // style: merge — slot first, child overrides specific keys.
    if (key === "style") {
      out.style = {
        ...(slotValue as CSSProperties | undefined),
        ...(childValue as CSSProperties | undefined),
      };
      continue;
    }

    // className: concatenate non-empty strings.
    if (key === "className") {
      const parts = [slotValue, childValue].filter(
        (v): v is string => typeof v === "string" && v.length > 0
      );
      out.className = parts.join(" ");
      continue;
    }

    // Default: only set if slot defines it (don't clobber child).
    if (slotValue !== undefined) {
      out[key] = slotValue;
    }
  }

  return out;
}
