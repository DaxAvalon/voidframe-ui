// Shared "selected item" grammar for collection rows that do not own their
// selection (Activity.Item, DataList.Item, Timeline.Item): the consumer says
// which item is selected and what selecting does; this adds the class
// modifiers, the attributes and the keyboard/pointer handlers so every
// collection paints and behaves the same way (1.4.0 selection grammar:
// bg-3 + text-0 + a 2px accent edge).

import type { HTMLAttributes, KeyboardEvent, MouseEvent } from "react";

export interface SelectableInput<E extends HTMLElement = HTMLElement> {
  selected?: boolean;
  onSelect?: () => void;
  /** The consumer's own handlers, called before selection. */
  onClick?: (e: MouseEvent<E>) => void;
  onKeyDown?: (e: KeyboardEvent<E>) => void;
}

export interface SelectableOutput<E extends HTMLElement = HTMLElement> {
  /** Modifier classes to add after the base class. */
  classNames: (string | false | undefined)[];
  attrs: Pick<HTMLAttributes<E>, "tabIndex" | "onClick" | "onKeyDown" | "aria-current"> & {
    "data-selected"?: "true";
    "data-selectable"?: "true";
  };
}

export function selectableAttrs<E extends HTMLElement = HTMLElement>(
  base: string,
  input: SelectableInput<E>
): SelectableOutput<E> {
  const { selected, onSelect, onClick, onKeyDown } = input;
  const selectable = typeof onSelect === "function";
  const attrs: SelectableOutput<E>["attrs"] = {};
  if (selected) {
    attrs["data-selected"] = "true";
    attrs["aria-current"] = "true";
  }
  if (selectable) {
    attrs["data-selectable"] = "true";
    attrs.tabIndex = 0;
    attrs.onClick = (e: MouseEvent<E>) => {
      onClick?.(e);
      if (!e.defaultPrevented) onSelect();
    };
    attrs.onKeyDown = (e: KeyboardEvent<E>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    };
  } else {
    if (onClick) attrs.onClick = onClick;
    if (onKeyDown) attrs.onKeyDown = onKeyDown;
  }
  return {
    classNames: [selected && `${base}--selected`, selectable && `${base}--selectable`],
    attrs,
  };
}
