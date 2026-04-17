// ═══════════════════════════════════════════════════════════════
// portalContainer — manage shared portal mount points
// Creates and ref-counts portal containers in the DOM.
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_PORTAL_ID = "vf-portal-root";

const containers = new Map<
  string,
  { element: HTMLElement; refCount: number }
>();

/**
 * Get (or create) a portal container element.
 * Each call increments the internal ref count.
 */
export function getPortalContainer(name?: string): HTMLElement {
  const id = name ?? DEFAULT_PORTAL_ID;
  const entry = containers.get(id);

  if (entry) {
    entry.refCount++;
    return entry.element;
  }

  const element = document.createElement("div");
  element.id = id;
  element.setAttribute("data-vf-portal", "");
  document.body.appendChild(element);

  containers.set(id, { element, refCount: 1 });
  return element;
}

/**
 * Release a portal container. Decrements the ref count and
 * removes the element from the DOM when it reaches zero.
 */
export function releasePortalContainer(name?: string): void {
  const id = name ?? DEFAULT_PORTAL_ID;
  const entry = containers.get(id);
  if (!entry) return;

  entry.refCount--;

  if (entry.refCount <= 0) {
    entry.element.remove();
    containers.delete(id);
  }
}
