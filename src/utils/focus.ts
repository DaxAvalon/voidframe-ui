// ═══════════════════════════════════════════════════════════════
// focus — focusable element query utilities
// Helpers for keyboard navigation, focus traps, and a11y.
// ═══════════════════════════════════════════════════════════════

/**
 * CSS selector for elements that can receive focus.
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"], details > summary';

function isHidden(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hidden) return true;
  const style = el.style;
  if (style.display === "none" || style.visibility === "hidden") return true;
  // Check aria-hidden on the element itself or ancestors
  if (el.closest("[aria-hidden='true']") || el.closest('[aria-hidden="true"]'))
    return true;
  // Check inert attribute
  if (el.closest("[inert]")) return true;
  return false;
}

function isDisabled(el: Element): boolean {
  return (
    el instanceof HTMLElement &&
    ("disabled" in el && (el as HTMLInputElement).disabled === true)
  );
}

/**
 * Get all focusable elements within a container.
 */
export function getFocusableElements(
  container: Element,
  options: { includeDisabled?: boolean; tabbableOnly?: boolean } = {}
): HTMLElement[] {
  const { includeDisabled = false, tabbableOnly = false } = options;
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  const filtered = elements.filter((el) => {
    if (isHidden(el)) return false;
    if (!includeDisabled && isDisabled(el)) return false;
    if (tabbableOnly && el.tabIndex < 0) return false;
    return true;
  });

  // Sort by tabindex: elements with tabindex > 0 first (in order),
  // then elements with tabindex 0 or no tabindex (in DOM order).
  return filtered.sort((a, b) => {
    const aIdx = Math.max(a.tabIndex, 0);
    const bIdx = Math.max(b.tabIndex, 0);
    if (aIdx === 0 && bIdx === 0) return 0;
    if (aIdx === 0) return 1;
    if (bIdx === 0) return -1;
    return aIdx - bIdx;
  });
}

/**
 * Get the first focusable element within a container.
 */
export function getFirstFocusable(container: Element): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] ?? null;
}

/**
 * Get the last focusable element within a container.
 */
export function getLastFocusable(container: Element): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] ?? null;
}

/**
 * Check whether an element can receive focus.
 */
export function isFocusable(element: Element): boolean {
  if (isHidden(element) || isDisabled(element)) return false;
  return element.matches(FOCUSABLE_SELECTOR);
}

/**
 * Check whether an element is tabbable (focusable and not tabindex=-1).
 */
export function isTabbable(element: Element): boolean {
  if (!isFocusable(element)) return false;
  return (element as HTMLElement).tabIndex >= 0;
}
