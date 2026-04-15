"use client";

// Phase 14 — Third-party icon-library adapters
//
// These wrap an icon from Lucide / Phosphor / Heroicons / Tabler into a
// voidframe-styled <Icon>, so sizing, color, spin, and RTL mirroring all
// work consistently.

import { createElement, forwardRef, type ComponentType } from "react";
import { Icon, type IconProps } from "./Icon";

type AnyIcon = ComponentType<Record<string, unknown>>;

/**
 * Wraps any icon component that accepts a `size` prop (Lucide, Phosphor,
 * Heroicons, Tabler, etc.) into a voidframe-styled icon wrapper.
 *
 * ```tsx
 * import { Search } from "lucide-react";
 * const SearchIcon = adaptIcon(Search, { defaultLabel: "Search" });
 * ```
 */
export function adaptIcon(
  Component: AnyIcon,
  options: { defaultLabel?: string; directional?: boolean } = {}
) {
  const Wrapped = forwardRef<SVGSVGElement, IconProps>(function Adapted(
    { label, directional, ...props },
    ref
  ) {
    return (
      <Icon
        ref={ref}
        label={label ?? options.defaultLabel}
        directional={directional ?? options.directional}
        {...props}
      >
        {createElement(Component, { size: "100%" })}
      </Icon>
    );
  });
  Wrapped.displayName = `Adapted(${
    Component.displayName ?? Component.name ?? "Icon"
  })`;
  return Wrapped;
}
