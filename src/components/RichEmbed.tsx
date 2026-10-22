"use client";

// Phase 13 — LegalText + Mermaid (lazy-load wrapper)

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { readToken } from "../utils/readToken";
import { ensureSanitizer, sanitizeHtml } from "../utils/sanitizeHtml";

// ── LegalText ───────────────────────────────────────────────

export interface LegalTextProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size?: "xs" | "sm";
}

/**
 * Small-print legal prose container with conservative typography. Use for
 * ToS excerpts, disclaimers, footnotes.
 */
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

export interface MermaidProps extends Omit<HTMLAttributes<HTMLDivElement>, "onError"> {
  chart: string;
  /**
   * Theme passed to `mermaid.initialize`. `"voidframe"` (default) uses
   * mermaid's `base` theme with `themeVariables` read from the active
   * `--vf-*` tokens at render time, so diagrams follow light, dark and soft
   * themes; any mermaid theme name ("dark", "default", "neutral") is passed
   * through unchanged.
   */
  theme?: "voidframe" | (string & Record<never, never>);
  /** Extra `themeVariables` merged over the derived ones (or over mermaid's, for a named theme). */
  themeVariables?: Record<string, string>;
  /** Called with the rendered SVG markup. */
  onRender?: (svg: string) => void;
  /** Called when loading or rendering fails. */
  onError?: (error: Error) => void;
  /**
   * Mermaid security level. Defaults to `"strict"` — inline HTML in
   * node labels, click handlers, and anchor execution are disabled.
   * Opt into `"loose"` only if you trust every chart source.
   * @see https://mermaid.js.org/config/usage.html#securityLevel
   */
  securityLevel?: "strict" | "loose" | "antiscript" | "sandbox";
  /** Override loader. Useful for tests + SSR. */
  loader?: () => Promise<MermaidApi>;
  /** Text shown while the diagram is loading. */
  loadingMessage?: string;
}

/**
 * Mermaid `themeVariables` derived from the voidframe tokens in effect on
 * `element` (default: the document root). Exported so consumers who call
 * `mermaid.initialize` themselves can match the theme.
 */
export function mermaidThemeVariables(element?: Element | null): Record<string, string> {
  const read = (name: string, fallback: string) => readToken(name, { element, fallback });
  const bg1 = read("bg-1", "#111111");
  const bg2 = read("bg-2", "#1a1a1a");
  const bg3 = read("bg-3", "#222222");
  const text0 = read("text-0", "#eeeeee");
  const text2 = read("text-2", "#aaaaaa");
  const border1 = read("border-1", "#333333");
  const border2 = read("border-2", "#444444");
  const accent = read("accent", "#4caf50");
  const danger = read("danger", "#e5484d");
  const warning = read("warning", "#f5a623");
  const font = read("font-family", "monospace");
  return {
    darkMode: read("color-scheme", "dark") === "dark" ? "true" : "false",
    background: bg1,
    fontFamily: font,
    fontSize: read("font-sm", "13px"),
    primaryColor: bg3,
    primaryTextColor: text0,
    primaryBorderColor: border2,
    secondaryColor: bg2,
    secondaryTextColor: text0,
    secondaryBorderColor: border1,
    tertiaryColor: bg2,
    tertiaryTextColor: text2,
    tertiaryBorderColor: border1,
    lineColor: text2,
    textColor: text0,
    mainBkg: bg3,
    nodeBorder: border2,
    nodeTextColor: text0,
    clusterBkg: bg2,
    clusterBorder: border1,
    edgeLabelBackground: bg2,
    titleColor: text0,
    labelBackground: bg2,
    actorBkg: bg3,
    actorBorder: border2,
    actorTextColor: text0,
    actorLineColor: text2,
    signalColor: text0,
    signalTextColor: text0,
    noteBkgColor: bg2,
    noteTextColor: text0,
    noteBorderColor: accent,
    activationBkgColor: bg2,
    activationBorderColor: accent,
    sectionBkgColor: bg2,
    altSectionBkgColor: bg1,
    taskBkgColor: accent,
    taskBorderColor: accent,
    taskTextColor: bg1,
    activeTaskBkgColor: bg3,
    activeTaskBorderColor: accent,
    doneTaskBkgColor: bg2,
    doneTaskBorderColor: border2,
    critBkgColor: danger,
    critBorderColor: danger,
    todayLineColor: warning,
    errorBkgColor: danger,
    errorTextColor: text0,
    pie1: read("chart-1", accent),
    pie2: read("chart-2", warning),
    pie3: read("chart-3", "#3b82f6"),
    pie4: read("chart-4", danger),
    pie5: read("chart-5", "#06b6d4"),
    pie6: read("chart-6", "#a855f7"),
    pie7: read("chart-7", "#f43f5e"),
    pie8: read("chart-8", text2),
    pieTitleTextColor: text0,
    pieSectionTextColor: bg1,
    pieLegendTextColor: text0,
    pieStrokeColor: bg1,
    gitBranchLabel0: text0,
    commitLabelColor: text0,
    commitLabelBackground: bg2,
  };
}

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  render: (
    id: string,
    src: string
  ) => Promise<{ svg: string; bindFunctions?: (el: Element) => void }>;
}

/**
 * Renders a Mermaid diagram from a source string. Parses at mount; errors
 * surface in a fallback block.
 */
export const Mermaid = forwardRef<HTMLDivElement, MermaidProps>(
  function Mermaid(
    {
      chart,
      theme = "voidframe",
      themeVariables,
      onRender,
      onError,
      securityLevel = "strict",
      loader,
      loadingMessage = "Loading diagram\u2026",
      className,
      ...props
    },
    ref
  ) {
    const onRenderRef = useRef(onRender);
    onRenderRef.current = onRender;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    const themeVarsKey = JSON.stringify(themeVariables ?? null);
    const [state, setState] = useState<
      { svg: string } | { error: string } | { loading: true }
    >({ loading: true });
    const elRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<HTMLDivElement | null>(null);
    const mermaidId = useId();

    useEffect(() => {
      let cancelled = false;
      if (!loader) {
        const message =
          "Mermaid peer dep not configured — pass a `loader` prop that resolves to the mermaid module.";
        setState({ error: message });
        onErrorRef.current?.(new Error(message));
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
          api.initialize(
            theme === "voidframe"
              ? {
                  theme: "base",
                  securityLevel,
                  themeVariables: { ...mermaidThemeVariables(elRef.current), ...themeVariables },
                }
              : { theme, securityLevel, ...(themeVariables ? { themeVariables } : {}) }
          );
          const id = `vf-mermaid-${mermaidId.replace(/:/g, "")}`;
          const { svg, bindFunctions } = await api.render(id, chart);
          if (cancelled) return;
          setState({ svg });
          onRenderRef.current?.(svg);
          if (bindFunctions && svgRef.current) {
            bindFunctions(svgRef.current);
          }
        } catch (err) {
          if (!cancelled) {
            setState({
              error: err instanceof Error ? err.message : String(err),
            });
            onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
          }
        }
      };
      void run();
      return () => {
        cancelled = true;
      };
      // themeVarsKey stands for themeVariables' content.
    }, [chart, theme, securityLevel, loader, mermaidId, themeVarsKey]);

    // Write mermaid SVG imperatively. Even under `securityLevel: "strict"`
    // we run it through our SVG sanitizer as defense-in-depth — a mermaid
    // bug or future config drift shouldn't give a bad chart source a path
    // to script execution.
    useEffect(() => {
      if (!("svg" in state)) return;
      const el = svgRef.current;
      if (!el) return;
      let cancelled = false;
      // The sanitizer is a lazily loaded peer; wait for it rather than
      // writing the escaped fallback into the chart container.
      ensureSanitizer()
        .then(() => {
          if (!cancelled && svgRef.current === el) writeHTML(el, sanitizeHtml(state.svg, "svg"));
        })
        .catch(() => {
          if (!cancelled) writeHTML(el, "");
        });
      return () => {
        cancelled = true;
      };
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
          <div className="vf-mermaid__fallback">{loadingMessage}</div>
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
