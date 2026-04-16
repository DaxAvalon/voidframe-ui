// ═══════════════════════════════════════════════════════════════
// HTML sanitization
// ═══════════════════════════════════════════════════════════════
//
// Thin wrapper over DOMPurify with a conservative allowlist geared
// for our RichTextEditor and Mermaid SVG surfaces. Consumers rendering
// arbitrary third-party HTML should still pass their own allowlist.
//
// The wrapper exists so:
//   - Every sanitize call goes through one audited config.
//   - Running in an SSR context (no `window`) is a no-op that returns
//     the empty string instead of crashing.

import DOMPurify from "dompurify";

export type SanitizeProfile = "rich-text" | "svg" | "strict";

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "u",
    "ul",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|sms):|[#/?])/i,
  ADD_ATTR: ["target", "rel"],
};

const SVG_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|sms):|[#/?])/i,
};

const STRICT_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "p", "span"],
  ALLOWED_ATTR: ["class"],
};

interface Purifier {
  sanitize: (html: string, cfg: Record<string, unknown>) => string;
  addHook: (event: string, cb: (node: Element) => void) => void;
  removeAllHooks: () => void;
}

function getPurifier(): Purifier | null {
  if (typeof window === "undefined") return null;
  return DOMPurify(window) as unknown as Purifier;
}

/**
 * Sanitize an HTML string against one of the built-in allowlists.
 * Returns the empty string in SSR / non-browser contexts — callers
 * should treat the output as client-only.
 */
export function sanitizeHtml(
  html: string,
  profile: SanitizeProfile = "rich-text"
): string {
  const purify = getPurifier();
  if (!purify) return "";
  const cfg =
    profile === "svg"
      ? SVG_CONFIG
      : profile === "strict"
        ? STRICT_CONFIG
        : RICH_TEXT_CONFIG;
  // Ensure any emitted `<a target="_blank">` gets noopener/noreferrer.
  purify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noreferrer noopener");
    }
  });
  try {
    return purify.sanitize(html, cfg);
  } finally {
    purify.removeAllHooks();
  }
}
