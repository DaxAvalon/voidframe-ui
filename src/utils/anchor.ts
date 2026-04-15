// Shared anchored-overlay positioning math.
//
// Used by Popover, Tooltip, HoverCard, and chart tooltips to place a floating
// element relative to a trigger rect with viewport-edge flip and clamping.

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface AnchorPosition {
  top: number;
  left: number;
  side: "top" | "bottom" | "left" | "right";
}

export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface AnchorSize {
  width: number;
  height: number;
}

/**
 * Compute the pixel top/left for a floating element anchored to a trigger.
 *
 * Behavior:
 * - `placement` picks the primary side and alignment (e.g. `"bottom-start"`).
 * - If the chosen side overflows the viewport, flips to the opposite side.
 * - After placement, clamps the position 8px inside the viewport on both axes.
 */
export function computeAnchoredPosition(
  triggerRect: AnchorRect,
  contentSize: AnchorSize,
  placement: Placement,
  offset: number
): AnchorPosition {
  const [side, align = "center"] = placement.split("-") as [
    "top" | "bottom" | "left" | "right",
    string?,
  ];
  let top = 0;
  let left = 0;
  if (side === "top") top = triggerRect.top - contentSize.height - offset;
  if (side === "bottom") top = triggerRect.bottom + offset;
  if (side === "left") left = triggerRect.left - contentSize.width - offset;
  if (side === "right") left = triggerRect.right + offset;
  if (side === "top" || side === "bottom") {
    if (align === "start") left = triggerRect.left;
    else if (align === "end") left = triggerRect.right - contentSize.width;
    else left = triggerRect.left + (triggerRect.width - contentSize.width) / 2;
  } else {
    if (align === "start") top = triggerRect.top;
    else if (align === "end") top = triggerRect.bottom - contentSize.height;
    else top = triggerRect.top + (triggerRect.height - contentSize.height) / 2;
  }
  if (typeof window !== "undefined") {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    if (side === "top" && top < 0) top = triggerRect.bottom + offset;
    if (side === "bottom" && top + contentSize.height > vh)
      top = triggerRect.top - contentSize.height - offset;
    if (side === "left" && left < 0) left = triggerRect.right + offset;
    if (side === "right" && left + contentSize.width > vw)
      left = triggerRect.left - contentSize.width - offset;
    left = Math.max(8, Math.min(vw - contentSize.width - 8, left));
    top = Math.max(8, Math.min(vh - contentSize.height - 8, top));
  }
  return { top, left, side };
}
