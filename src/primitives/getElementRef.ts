import { isValidElement, version as reactVersion } from "react";
import type { ReactElement, Ref } from "react";

const REACT_MAJOR = Number.parseInt(reactVersion, 10);

/**
 * Read the `ref` attached to a React element across React majors.
 *
 * React 18 strips `ref` from `props` and exposes it as `element.ref`.
 * React 19 keeps it in `props.ref` and turns `element.ref` into a getter
 * that logs a deprecation warning when read. Reading the wrong one either
 * loses the ref or warns on every render, so every `asChild`/clone path
 * goes through this helper.
 */
export function getElementRef<T = HTMLElement>(
  element: unknown
): Ref<T> | null {
  if (!isValidElement(element)) return null;
  const el = element as ReactElement<{ ref?: Ref<T> | null }> & { ref?: Ref<T> | null };
  if (REACT_MAJOR >= 19) {
    return el.props?.ref ?? null;
  }
  return el.ref ?? null;
}
