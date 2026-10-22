// voidframe-ui/codemirror — build a CodeMirror 6 theme from the voidframe
// tokens without depending on CodeMirror at build time.
//
//   import { EditorView } from "@codemirror/view";
//   import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
//   import { tags } from "@lezer/highlight";
//   import { voidframeEditorTheme } from "voidframe-ui/codemirror";
//
//   const extensions = voidframeEditorTheme({ EditorView, HighlightStyle, syntaxHighlighting, tags }, { dark: true });
//
// The CodeMirror modules are injected so this entry stays dependency-free:
// `voidframeEditorThemeSpec()` returns the plain style objects for anyone
// building the extensions by hand (or for Monaco / other editors).

export interface EditorThemeOptions {
  /** Whether the host theme is dark (drives `EditorView.theme(…, { dark })`). Default true. */
  dark?: boolean;
  /** Editor font; default the mono token. */
  fontFamily?: string;
  fontSize?: string;
  /** Line height; default 1.6. */
  lineHeight?: string | number;
  /** Extra CSS-in-JS rules merged over the generated ones (CodeMirror selector syntax, `&` = editor root). */
  overrides?: Record<string, Record<string, string | number>>;
}

export interface HighlightRule {
  /** Name of a `@lezer/highlight` tag, or several joined by `,` (`"keyword"`, `"string,special(string)"`). */
  tag: string;
  color?: string;
  fontStyle?: "italic" | "normal";
  fontWeight?: "bold" | "normal";
  textDecoration?: string;
}

export interface EditorThemeSpec {
  /** Rules for `EditorView.theme()`. */
  styles: Record<string, Record<string, string | number>>;
  /** Rules for `HighlightStyle.define()`; resolve `tag` against `@lezer/highlight` tags. */
  highlight: HighlightRule[];
  dark: boolean;
}

/**
 * The theme as plain data: editor chrome (gutters, active line, selection,
 * bracket match, panels, tooltips) and a token-coloured highlight style.
 * Every colour is a `var(--vf-*)` reference, so the editor follows the
 * active voidframe theme without re-initialising.
 */
export function voidframeEditorThemeSpec(options: EditorThemeOptions = {}): EditorThemeSpec {
  const {
    dark = true,
    fontFamily = "var(--vf-font-mono)",
    fontSize = "var(--vf-font-sm)",
    lineHeight = 1.6,
    overrides = {},
  } = options;
  const styles: Record<string, Record<string, string | number>> = {
    "&": {
      color: "var(--vf-text-0)",
      backgroundColor: "var(--vf-bg-1)",
      fontFamily,
      fontSize,
    },
    ".cm-content": {
      caretColor: "var(--vf-accent)",
      lineHeight,
      padding: "var(--vf-sp-2) 0",
    },
    ".cm-scroller": { fontFamily, lineHeight },
    "&.cm-focused": { outline: "var(--vf-focus-ring-accent)", outlineOffset: "-1px" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--vf-accent)" },
    // Selection: the editor paints its own layer; voidframe's inverted
    // ::selection is excluded for .cm-editor in base.css, so set it here.
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "color-mix(in srgb, var(--vf-accent) 28%, transparent)",
    },
    ".cm-selectionMatch": { backgroundColor: "color-mix(in srgb, var(--vf-accent) 16%, transparent)" },
    ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--vf-text-0) 4%, transparent)" },
    ".cm-gutters": {
      backgroundColor: "var(--vf-bg-1)",
      color: "var(--vf-text-3)",
      borderRight: "1px solid var(--vf-border-1)",
    },
    ".cm-activeLineGutter": { backgroundColor: "color-mix(in srgb, var(--vf-text-0) 6%, transparent)", color: "var(--vf-text-1)" },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 var(--vf-sp-2) 0 var(--vf-sp-3)", minWidth: "3ch" },
    ".cm-foldPlaceholder": { backgroundColor: "var(--vf-bg-3)", border: "1px solid var(--vf-border-2)", color: "var(--vf-text-2)" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "color-mix(in srgb, var(--vf-accent) 22%, transparent)",
      outline: "1px solid color-mix(in srgb, var(--vf-accent) 50%, transparent)",
    },
    ".cm-searchMatch": { backgroundColor: "color-mix(in srgb, var(--vf-warning) 30%, transparent)", outline: "1px solid var(--vf-warning)" },
    ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "color-mix(in srgb, var(--vf-warning) 50%, transparent)" },
    ".cm-panels": { backgroundColor: "var(--vf-bg-2)", color: "var(--vf-text-0)", borderColor: "var(--vf-border-1)" },
    ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--vf-border-1)" },
    ".cm-panels.cm-panels-bottom": { borderTop: "1px solid var(--vf-border-1)" },
    ".cm-panel input, .cm-panel button": { fontFamily: "var(--vf-font-family)", fontSize: "var(--vf-font-xs)" },
    ".cm-tooltip": {
      backgroundColor: "var(--vf-bg-2)",
      border: "1px solid var(--vf-border-2)",
      color: "var(--vf-text-0)",
      fontFamily: "var(--vf-font-family)",
      fontSize: "var(--vf-font-xs)",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": { borderTopColor: "var(--vf-border-2)", borderBottomColor: "var(--vf-border-2)" },
    ".cm-tooltip .cm-tooltip-arrow:after": { borderTopColor: "var(--vf-bg-2)", borderBottomColor: "var(--vf-bg-2)" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--vf-bg-4)", color: "var(--vf-text-0)" },
    ".cm-placeholder": { color: "var(--vf-text-3)" },
    ".cm-lintRange-error": { backgroundImage: "none", textDecoration: "underline wavy var(--vf-danger)" },
    ".cm-lintRange-warning": { backgroundImage: "none", textDecoration: "underline wavy var(--vf-warning)" },
    ".cm-diagnostic-error": { borderLeftColor: "var(--vf-danger)" },
    ".cm-diagnostic-warning": { borderLeftColor: "var(--vf-warning)" },
    ...overrides,
  };
  const highlight: HighlightRule[] = [
    { tag: "keyword,controlKeyword,moduleKeyword,operatorKeyword", color: "var(--vf-purple)" },
    { tag: "definitionKeyword", color: "var(--vf-purple)", fontWeight: "bold" },
    { tag: "name,deleted,character,macroName", color: "var(--vf-text-0)" },
    { tag: "propertyName", color: "var(--vf-cyan)" },
    { tag: "function(variableName),function(propertyName)", color: "var(--vf-blue)" },
    { tag: "definition(variableName)", color: "var(--vf-text-0)" },
    { tag: "labelName", color: "var(--vf-text-1)" },
    { tag: "color,constant(name),standard(name)", color: "var(--vf-amber)" },
    { tag: "typeName,className,namespace", color: "var(--vf-amber)" },
    { tag: "number,changed,annotation,modifier,self", color: "var(--vf-amber)" },
    { tag: "operator", color: "var(--vf-text-1)" },
    { tag: "url,escape,regexp,special(string)", color: "var(--vf-cyan)" },
    { tag: "meta,comment,lineComment,blockComment,docComment", color: "var(--vf-text-3)", fontStyle: "italic" },
    { tag: "string,inserted", color: "var(--vf-green)" },
    { tag: "atom,bool", color: "var(--vf-rose)" },
    { tag: "invalid", color: "var(--vf-danger)", textDecoration: "underline wavy var(--vf-danger)" },
    { tag: "heading", color: "var(--vf-text-0)", fontWeight: "bold" },
    { tag: "strong", fontWeight: "bold" },
    { tag: "emphasis", fontStyle: "italic" },
    { tag: "strikethrough", textDecoration: "line-through" },
    { tag: "link", color: "var(--vf-accent)", textDecoration: "underline" },
    { tag: "tagName,angleBracket", color: "var(--vf-rose)" },
    { tag: "attributeName", color: "var(--vf-cyan)" },
    { tag: "attributeValue", color: "var(--vf-green)" },
    { tag: "processingInstruction,punctuation,separator", color: "var(--vf-text-2)" },
  ];
  return { styles, highlight, dark };
}

/** The pieces of CodeMirror the builder needs, injected by the consumer. */
export interface CodeMirrorModules {
  EditorView: { theme: (spec: Record<string, Record<string, string | number>>, options?: { dark?: boolean }) => unknown };
  HighlightStyle: { define: (specs: Array<Record<string, unknown>>) => unknown };
  syntaxHighlighting: (style: unknown, options?: { fallback?: boolean }) => unknown;
  /** `tags` from `@lezer/highlight`: plain tags are properties, modifiers (`function`, `definition`, `special`, …) are functions. */
  tags: Record<string, unknown>;
}

/**
 * Resolve a `HighlightRule.tag` string ("function(variableName)",
 * "keyword,string") against `@lezer/highlight`'s `tags` object.
 */
export function resolveHighlightTags(spec: string, tags: Record<string, unknown>): unknown[] {
  const out: unknown[] = [];
  for (const part of spec.split(",").map((p) => p.trim()).filter(Boolean)) {
    const m = /^(\w+)\((\w+)\)$/.exec(part);
    if (m) {
      const modifier = tags[m[1]!];
      const base = tags[m[2]!];
      if (typeof modifier === "function" && base !== undefined) out.push((modifier as (t: unknown) => unknown)(base));
    } else if (tags[part] !== undefined && typeof tags[part] !== "function") {
      out.push(tags[part]);
    }
  }
  return out;
}

/**
 * Build the CodeMirror extensions: `EditorView.theme` from the spec's styles
 * and `syntaxHighlighting(HighlightStyle.define(...))` from its highlight
 * rules. Returns an array to spread into `extensions`.
 */
export function voidframeEditorTheme(cm: CodeMirrorModules, options: EditorThemeOptions = {}): unknown[] {
  const spec = voidframeEditorThemeSpec(options);
  const theme = cm.EditorView.theme(spec.styles, { dark: spec.dark });
  const defs: Array<Record<string, unknown>> = [];
  for (const rule of spec.highlight) {
    const resolved = resolveHighlightTags(rule.tag, cm.tags);
    if (resolved.length === 0) continue;
    const { tag: _tag, ...style } = rule;
    defs.push({ tag: resolved.length === 1 ? resolved[0] : resolved, ...style });
  }
  const highlight = cm.HighlightStyle.define(defs);
  return [theme, cm.syntaxHighlighting(highlight, { fallback: true })];
}
