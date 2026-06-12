/**
 * Ground-truth audit of every docs playground snippet.
 *
 * Evaluates each snippet through react-live's real pipeline
 * (generateElement / renderElementAsync — the same path LiveProvider
 * uses in the browser) and mounts the result under VoidframeProvider
 * in the test DOM. Classifies each entry:
 *
 *   - "throws"        — evaluation or render raised an error
 *   - "console-error" — rendered, but React logged an error
 *   - "empty"         — rendered nothing visible (no text, media,
 *                       form control, or vf-* element — checked in
 *                       both the audit root and body-level portals)
 *   - "ok"            — rendered something real
 *
 * Consumed by docs/__tests__/playgroundRender.test.tsx (CI gate with
 * a baseline ratchet) and by `npm run docs:audit` (triage report).
 */
import * as React from "react";
import { render, cleanup } from "@testing-library/react";
import { generateElement, renderElementAsync } from "react-live";
import { VoidframeProvider } from "../../src/provider/VoidframeProvider";
import { playgroundScope } from "../scope";
import { curated } from "../curated";
import { patterns } from "../patterns";
import { generatePlaygroundCode, hasOverride } from "../autoPlayground";
import { LIVE_NON_ELEMENTS } from "../usageSnippets";
import propsData from "../data/props.json";
import type { ComponentDoc } from "../../src/dev";

export type SnippetSource = "curated" | "override" | "autogen" | "pattern";

export type Classification = "ok" | "empty" | "throws" | "console-error";

export interface AuditEntry {
  /** Stable id: `${source}:${name}:${title}` */
  id: string;
  name: string;
  title: string;
  code: string;
  source: SnippetSource;
}

export interface AuditResult extends AuditEntry {
  classification: Classification;
  /** First error message, when classification is throws/console-error. */
  error?: string;
}

/**
 * Every playground snippet the docs site can show, with the same
 * precedence ComponentPage uses: curated examples win, otherwise
 * generatePlaygroundCode (override or auto-generated). Patterns are
 * appended after components.
 *
 * Mirrors the app's kind logic: only entries that render a LIVE
 * playground are enumerated — non-element kinds outside
 * LIVE_NON_ELEMENTS get static usage docs, not demos.
 */
export function enumeratePlaygroundEntries(): AuditEntry[] {
  const docs = propsData as ComponentDoc[];
  const entries: AuditEntry[] = [];

  for (const doc of docs) {
    const kind = doc.kind ?? "element";
    if (kind !== "element" && !LIVE_NON_ELEMENTS.has(doc.name)) continue;
    const over = curated[doc.name];
    if (over) {
      for (const ex of over.examples) {
        entries.push({
          id: `curated:${doc.name}:${ex.title}`,
          name: doc.name,
          title: ex.title,
          code: ex.code,
          source: "curated",
        });
      }
      continue;
    }
    const code = generatePlaygroundCode(doc);
    if (!code) continue;
    const source: SnippetSource = hasOverride(doc.name) ? "override" : "autogen";
    entries.push({
      id: `${source}:${doc.name}:default`,
      name: doc.name,
      title: "default",
      code,
      source,
    });
  }

  for (const pattern of patterns) {
    entries.push({
      id: `pattern:${pattern.id}:${pattern.title}`,
      name: pattern.id,
      title: pattern.title,
      code: pattern.code,
      source: "pattern",
    });
  }

  return entries;
}

/**
 * Evaluate a snippet exactly the way LiveProvider does: sucrase
 * transpile + eval against playgroundScope. Returns the renderable
 * component, or the evaluation error. `lateErrors` keeps receiving
 * errors the component reports during mount — generateElement wires
 * its errorCallback into componentDidCatch, which only fires once the
 * component renders.
 */
function evaluateSnippet(
  code: string,
  lateErrors: Error[],
): { Component: React.ComponentType } | { error: Error } {
  const noInline = /\brender\s*\(/.test(code);
  const options = {
    code,
    scope: { ...playgroundScope },
    enableTypeScript: true,
  };

  try {
    if (noInline) {
      let result: React.ComponentType | null = null;
      let evalError: Error | null = null;
      renderElementAsync(
        options,
        (Component) => {
          result = Component;
        },
        (error) => {
          evalError = error;
          lateErrors.push(error);
        },
      );
      // renderElementAsync is callback-based but resolves synchronously
      // (sucrase transpile + eval) — the render() call inside the
      // snippet fires the callback before this line.
      if (evalError) return { error: evalError };
      if (!result) return { error: new Error("render() was never called") };
      return { Component: result };
    }

    let evalError: Error | null = null;
    let evaluated = false;
    const Component = generateElement(options, (error) => {
      if (evaluated) lateErrors.push(error);
      else evalError = error;
    });
    evaluated = true;
    if (evalError) return { error: evalError };
    return { Component: Component as unknown as React.ComponentType };
  } catch (error) {
    return { error: error as Error };
  }
}

const VISIBLE_TAGS =
  "svg, canvas, img, input, textarea, select, button, video, audio, iframe";

/** True when the element subtree contains something a user would see. */
function subtreeHasVisibleOutput(el: Element): boolean {
  if (el.textContent && el.textContent.trim().length > 0) return true;
  if (el.matches(VISIBLE_TAGS) || el.querySelector(VISIBLE_TAGS)) return true;
  // Any vf-* classed element implies a styled component rendered.
  for (const node of el.querySelectorAll("[class]")) {
    for (const cls of Array.from(node.classList)) {
      if (cls.startsWith("vf-")) return true;
    }
  }
  return false;
}

/**
 * Render one snippet and classify the outcome. Cleans up after itself
 * (unmount + body portal sweep) so entries don't contaminate each other.
 */
export function auditEntry(entry: AuditEntry): AuditResult {
  const lateErrors: Error[] = [];
  const evaluated = evaluateSnippet(entry.code, lateErrors);
  if ("error" in evaluated) {
    return {
      ...entry,
      classification: "throws",
      error: String(evaluated.error?.message ?? evaluated.error),
    };
  }

  const consoleErrors: string[] = [];
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(" "));
  };

  const bodyChildrenBefore = new Set(Array.from(document.body.children));
  const { Component } = evaluated;

  try {
    const result = render(
      React.createElement(
        VoidframeProvider,
        null,
        React.createElement(
          "div",
          { "data-audit-root": true },
          React.createElement(Component),
        ),
      ),
    );

    // generateElement components swallow render errors in
    // componentDidCatch and report via errorCallback — but a snippet
    // that threw during mount reaches here with an error boundary
    // that rendered null. React also logs those through console.error.
    const auditRoot = result.container.querySelector("[data-audit-root]");
    let visible = auditRoot ? subtreeHasVisibleOutput(auditRoot) : false;

    if (!visible) {
      // Portal-based components (Dialog, Toast, Tooltip…) render into
      // document.body outside the container.
      for (const child of Array.from(document.body.children)) {
        if (bodyChildrenBefore.has(child)) continue;
        if (child === result.container) continue;
        if (subtreeHasVisibleOutput(child)) {
          visible = true;
          break;
        }
      }
    }

    if (lateErrors.length > 0) {
      return {
        ...entry,
        classification: "throws",
        error: String(lateErrors[0]?.message ?? lateErrors[0]).slice(0, 500),
      };
    }
    if (hasReactError(consoleErrors)) {
      return {
        ...entry,
        classification: "console-error",
        error: firstReactError(consoleErrors)?.slice(0, 500),
      };
    }
    return { ...entry, classification: visible ? "ok" : "empty" };
  } catch (error) {
    return {
      ...entry,
      classification: "throws",
      error: String((error as Error)?.message ?? error).slice(0, 500),
    };
  } finally {
    console.error = origError;
    cleanup();
    // Sweep anything a portal left behind.
    for (const child of Array.from(document.body.children)) {
      if (!bodyChildrenBefore.has(child)) child.remove();
    }
  }
}

/**
 * console.error lines that indicate a genuinely broken render, as
 * opposed to benign dev-mode chatter. Deliberately narrow: prop-type
 * warnings and act() noise should not fail the gate.
 */
function isReactErrorLine(line: string): boolean {
  return (
    line.includes("The above error occurred") ||
    line.includes("Error: Uncaught") ||
    line.includes("Cannot read properties") ||
    line.includes("is not a function") ||
    line.includes("Objects are not valid as a React child") ||
    line.includes("Element type is invalid")
  );
}

function hasReactError(lines: string[]): boolean {
  return lines.some(isReactErrorLine);
}

function firstReactError(lines: string[]): string | undefined {
  return lines.find(isReactErrorLine);
}
