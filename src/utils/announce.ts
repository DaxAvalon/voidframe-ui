// ═══════════════════════════════════════════════════════════════
// announce — imperative screen reader announcements
// Creates visually-hidden aria-live regions on demand.
// ═══════════════════════════════════════════════════════════════

const regions: Record<string, HTMLElement> = {};

function getRegion(politeness: "polite" | "assertive"): HTMLElement | null {
  if (typeof document === "undefined") return null;

  if (regions[politeness]) return regions[politeness];

  const el = document.createElement("div");
  el.setAttribute("aria-live", politeness);
  el.setAttribute("aria-atomic", "true");
  el.setAttribute("role", politeness === "assertive" ? "alert" : "status");

  // Visually hidden but accessible to screen readers
  Object.assign(el.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  });

  el.dataset.vfAnnouncer = politeness;
  document.body.appendChild(el);
  regions[politeness] = el;
  return el;
}

/**
 * Announce a message to screen readers via an aria-live region.
 *
 * @param message    The text to announce
 * @param options.politeness  "polite" (default) or "assertive"
 * @param options.clearAfter  Milliseconds before clearing the region (default 5000)
 */
export function announce(
  message: string,
  options: { politeness?: "polite" | "assertive"; clearAfter?: number } = {}
): void {
  const { politeness = "polite", clearAfter = 5000 } = options;
  const region = getRegion(politeness);
  if (!region) return;

  // Clear first, then set — ensures SR re-reads even if same message
  region.textContent = "";
  // Use a microtask gap so the SR detects the change
  setTimeout(() => {
    region.textContent = message;
  }, 0);

  setTimeout(() => {
    if (region.textContent === message) {
      region.textContent = "";
    }
  }, clearAfter);
}

/**
 * Remove all announcer regions from the DOM and reset internal state.
 */
export function clearAnnouncer(): void {
  for (const key of Object.keys(regions)) {
    const el = regions[key];
    el?.parentNode?.removeChild(el);
    delete regions[key];
  }
}
