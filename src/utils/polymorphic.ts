// ═══════════════════════════════════════════════════════════════
// Polymorphic component types
// Lets a component accept an `as` prop and infer the correct
// element + ref + native attribute set.
// ═══════════════════════════════════════════════════════════════

import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
} from "react";

/** `{ as?: C }` */
export type AsProp<C extends ElementType> = { as?: C };

/** Keys that should be omitted from native props when our component owns them. */
export type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);

/**
 * Polymorphic component props (no ref).
 *
 * Use when the component does not forward refs.
 */
export type PolymorphicComponentProps<
  C extends ElementType,
  Props = Record<string, unknown>,
> = PropsWithChildren<Props & AsProp<C>> &
  Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

/**
 * Ref type matching the element produced by `C`.
 */
export type PolymorphicRef<C extends ElementType> =
  ComponentPropsWithRef<C>["ref"];

/**
 * Polymorphic component props including a `ref`.
 *
 * Use when the component forwards refs (most cases).
 */
export type PolymorphicComponentPropsWithRef<
  C extends ElementType,
  Props = Record<string, unknown>,
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };
