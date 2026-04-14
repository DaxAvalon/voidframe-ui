import { useEffect, useState, type RefObject } from "react";

/**
 * `true` when any descendant of the element has focus.
 */
export function useFocusWithin<T extends HTMLElement>(ref: RefObject<T>): boolean {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = () => setFocused(true);
    const onBlur = (e: FocusEvent) => {
      // relatedTarget = element receiving focus. If it's still inside us, stay true.
      if (!el.contains(e.relatedTarget as Node | null)) {
        setFocused(false);
      }
    };
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);
    return () => {
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
    };
  }, [ref]);

  return focused;
}
