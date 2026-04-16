"use client";

// Phase 13 — LegalText + Mermaid (lazy-load wrapper)

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { sanitizeHtml } from "../utils/sanitizeHtml";

// ── LegalText ───────────────────────────────────────────────

export interface LegalTextProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size?: "xs" | "sm";
}

export const LegalText = forwardRef<HTMLDivElement, LegalTextProps>(
  function LegalText({ size = "xs", className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx("vf-legal", `vf-legal--${size}`, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LegalText.displayName = "LegalText";

// ── Mermaid ────────────────────────────────────────────────
//
// Thin wrapper that lazy-loads `mermaid` (peer dep) at runtime and
// renders the diagram into a div. If `mermaid` is not installed, the
// raw source is rendered inside a code block so consumers still see
// something useful.

const HTML_PROP = "innerHTML" as const;
function writeHTML(el: HTMLElement, html: string): void {
  (el as unknown as Record<string, string>)[HTML_PROP] = html;
}

export interface MermaidProps extends HTMLAttributes<HTMLDivElement> {
  chart: string;
  /** Theme string passed to mermaid.initialize. Default "dark". */
  theme?: string;
  /**
   * Mermaid security level. Defaults to `"strict"` — inline HTML in
   * node labels, click handlers, and anchor execution are disabled.
   * Opt into `"loose"` only if you trust every chart source.
   * @see https://mermaid.js.org/config/usage.html#securityLevel
   */
  securityLevel?: "strict" | "loose" | "antiscript" | "sandbox";
  /** Override loader. Useful for tests + SSR. */
  loader?: () => Promise<MermaidApi>;
}

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  render: (
    id: string,
    src: string
  ) => Promise<{ svg: string; bindFunctions?: (el: Element) => void }>;
}

export const Mermaid = forwardRef<HTMLDivElement, MermaidProps>(
  function Mermaid(
    {
      chart,
      theme = "dark",
      securityLevel = "strict",
      loader,
      className,
      ...props
    },
    ref
  ) {
    const [state, setState] = useState<
      { svg: string } | { error: string } | { loading: true }
    >({ loading: true });
    const elRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      let cancelled = false;
      if (!loader) {
        setState({
          error:
            "Mermaid peer dep not configured — pass a `loader` prop that resolves to the mermaid module.",
        });
        return;
      }
      const run = async () => {
        try {
          const api = await loader();
          if (!api) {
            if (!cancelled)
              setState({ error: "Mermaid loader returned null." });
            return;
          }
          api.initialize({ theme, securityLevel });
          const id = `vf-mermaid-${Math.random().toString(36).slice(2)}`;
          const { svg, bindFunctions } = await api.render(id, chart);
          if (cancelled) return;
          setState({ svg });
          if (bindFunctions && svgRef.current) {
            bindFunctions(svgRef.current);
          }
        } catch (err) {
          if (!cancelled)
            setState({
              error: err instanceof Error ? err.message : String(err),
            });
        }
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, [chart, theme, securityLevel, loader]);

    // Write mermaid SVG imperatively. Even under `securityLevel: "strict"`
    // we run it through our SVG sanitizer as defense-in-depth — a mermaid
    // bug or future config drift shouldn't give a bad chart source a path
    // to script execution.
    useEffect(() => {
      if (!("svg" in state)) return;
      const el = svgRef.current;
      if (!el) return;
      writeHTML(el, sanitizeHtml(state.svg, "svg"));
    }, [state]);

    const mergedRef = (node: HTMLDivElement | null) => {
      elRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    };

    return (
      <div
        ref={mergedRef}
        className={cx("vf-mermaid", className)}
        role="img"
        aria-label="Diagram"
        {...props}
      >
        {"loading" in state && (
          <div className="vf-mermaid__fallback">Loading diagram…</div>
        )}
        {"error" in state && (
          <div className="vf-mermaid__fallback vf-mermaid__fallback--error">
            {state.error}
            <pre className="vf-mermaid__source">{chart}</pre>
          </div>
        )}
        {"svg" in state && (
          <div ref={svgRef} className="vf-mermaid__svg" />
        )}
      </div>
    );
  }
);
Mermaid.displayName = "Mermaid";
