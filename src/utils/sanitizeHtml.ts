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
//
// `dompurify` is declared `external` in vite.config.ts and an optional
// peer dep. It is loaded lazily on first use, so importing the root entry
// or `voidframe-ui/forms` (which carries RichTextEditor) does not require
// it to be installed. Until the module has loaded, `sanitizeHtml` returns
// the input with all markup escaped — never raw HTML, never silently
// empty. Components that sanitise call `ensureSanitizer()` on mount so the
// purifier is ready by the time content flows through them.

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

type PurifierFactory = (w: Window) => Purifier;

let factory: PurifierFactory | null = null;
let pending: Promise<void> | null = null;

/**
 * Load the optional `dompurify` peer. Resolves once `sanitizeHtml` can
 * sanitise for real; rejects with an error naming the missing package when
 * it is not installed. Safe to call repeatedly.
 */
export function ensureSanitizer(): Promise<void> {
  if (factory) return Promise.resolve();
  if (!pending) {
    pending = import("dompurify")
      .then((mod) => {
        const candidate = (mod as { default?: unknown }).default ?? mod;
        factory = candidate as PurifierFactory;
      })
      .catch((cause) => {
        pending = null;
        throw new Error(
          '[voidframe] sanitizeHtml requires the optional peer dependency "dompurify". ' +
            "Install it with: npm install dompurify" +
            (cause instanceof Error ? ` (${cause.message})` : "")
        );
      });
  }
  return pending;
}

/** Whether the sanitizer module has loaded (true after `ensureSanitizer()` resolves). */
export function isSanitizerReady(): boolean {
  return factory !== null;
}

/** Markup-free fallback used before the purifier has loaded. */
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPurifier(): Purifier | null {
  if (typeof window === "undefined" || !factory) return null;
  return factory(window);
}

/**
 * Sanitize an HTML string against one of the built-in allowlists.
 * Returns the empty string in SSR / non-browser contexts — callers
 * should treat the output as client-only. Before the lazily loaded
 * purifier is ready (see `ensureSanitizer`) the markup is escaped instead.
 */
export function sanitizeHtml(
  html: string,
  profile: SanitizeProfile = "rich-text"
): string {
  if (typeof window === "undefined") return "";
  const purify = getPurifier();
  if (!purify) {
    void ensureSanitizer().catch(() => {
      /* reported to callers of ensureSanitizer() */
    });
    return escapeHtml(html);
  }
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
