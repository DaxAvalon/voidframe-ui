// Phase 19 — Test mock factories
//
// `installMatchMedia` returns a controller that lets a test simulate
// viewport resizes without the real matchMedia machinery. `createMockStorage`
// mirrors the Storage interface for persistence-hook testing.

export interface MatchMediaController {
  /** Set the viewport width. Listeners fire only when match state flips. */
  setWidth(px: number): void;
  /** Restore the previous matchMedia implementation. */
  restore(): void;
}

interface FakeMql {
  matches: boolean;
  media: string;
  listeners: Array<(e: MediaQueryListEvent) => void>;
}

/**
 * Install a deterministic matchMedia on the given window-like object.
 * Only `min-width: NNNpx` predicates are honored — which is the only
 * shape voidframe's media hooks emit.
 */
export function installMatchMedia(
  initialWidth: number,
  target: Pick<Window, "matchMedia"> & Record<string, unknown> = globalThis as unknown as Pick<
    Window,
    "matchMedia"
  > &
    Record<string, unknown>
): MatchMediaController {
  const entries = new Map<string, FakeMql>();
  const objects = new Map<string, MediaQueryList>();
  let width = initialWidth;
  const previous = (target as Record<string, unknown>).matchMedia;

  const parseMinPx = (query: string): number => {
    const m = query.match(/min-width:\s*(\d+)px/);
    return m ? parseFloat(m[1]!) : 0;
  };
  const recompute = () => {
    for (const [query, entry] of entries.entries()) {
      const nextMatches = width >= parseMinPx(query);
      entry.matches = nextMatches;
      const obj = objects.get(query);
      if (obj) (obj as unknown as { matches: boolean }).matches = nextMatches;
    }
  };

  const impl = (query: string) => {
    const existing = objects.get(query);
    if (existing) return existing;
    const entry: FakeMql = {
      matches: width >= parseMinPx(query),
      media: query,
      listeners: [],
    };
    entries.set(query, entry);
    const obj = {
      matches: entry.matches,
      media: query,
      addEventListener: (_ev: string, cb: (e: MediaQueryListEvent) => void) =>
        entry.listeners.push(cb),
      removeEventListener: (
        _ev: string,
        cb: (e: MediaQueryListEvent) => void
      ) => {
        const idx = entry.listeners.indexOf(cb);
        if (idx >= 0) entry.listeners.splice(idx, 1);
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
    objects.set(query, obj);
    return obj;
  };

  Object.defineProperty(target, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });

  return {
    setWidth(next: number) {
      const prev = new Map(
        [...entries.entries()].map(([k, v]) => [k, v.matches])
      );
      width = next;
      recompute();
      for (const [query, entry] of entries.entries()) {
        if (prev.get(query) !== entry.matches) {
          entry.listeners.forEach((cb) =>
            cb({ matches: entry.matches, media: query } as MediaQueryListEvent)
          );
        }
      }
    },
    restore() {
      Object.defineProperty(target, "matchMedia", {
        configurable: true,
        writable: true,
        value: previous,
      });
    },
  };
}

export interface MockStorageApi {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove?: (key: string) => void;
  /** Direct access for assertions. */
  store: Map<string, string>;
}

/**
 * Build an in-memory storage adapter compatible with
 * `useThemePersistence` and `WhatsNewPopover`. Useful because happy-dom's
 * real localStorage persists across tests in some configurations.
 */
export function createMockStorage(seed?: Record<string, string>): MockStorageApi {
  const store = new Map<string, string>(
    seed ? Object.entries(seed) : undefined
  );
  return {
    store,
    get: (k) => store.get(k) ?? null,
    set: (k, v) => {
      store.set(k, v);
    },
    remove: (k) => {
      store.delete(k);
    },
  };
}

// ───────────────────────────────────────────────────────────────
// Mock components — lightweight replacements for heavy components.
// Consumers use:
//   vi.mock("voidframe-ui", async () => ({
//     ...(await vi.importActual("voidframe-ui")),
//     ...mockComponents,
//   }));
// ───────────────────────────────────────────────────────────────

import { createElement, useState, type FC, type ReactNode } from "react";

function createMock(name: string, dataProps?: string[]): FC<Record<string, unknown>> {
  const Mock: FC<Record<string, unknown>> = (props) => {
    const dataAttrs: Record<string, string> = {};
    if (dataProps) {
      for (const key of dataProps) {
        const val = props[key];
        if (val !== undefined) dataAttrs[`data-${key}`] = String(val);
      }
    }
    return (
      <div data-testid={`vf-mock-${name.toLowerCase()}`} {...dataAttrs}>
        {props.children as ReactNode}
      </div>
    );
  };
  Mock.displayName = `Mock${name}`;
  return Mock;
}

/**
 * Textarea-backed editor mock: `value` / `defaultValue`, `onValueChange`,
 * `placeholder`, `aria-label` (or `label`) and `readOnly` work, so a test can
 * type into "the editor" with user-event. Extra data attributes mirror the
 * props named in `dataProps`.
 */
function createEditorMock(name: string, dataProps: string[] = []): FC<Record<string, unknown>> {
  const Mock: FC<Record<string, unknown>> = (props) => {
    const controlled = typeof props.value === "string";
    const [internal, setInternal] = useState<string>(
      typeof props.defaultValue === "string" ? (props.defaultValue as string) : ""
    );
    const current = controlled ? (props.value as string) : internal;
    const dataAttrs: Record<string, string> = {};
    for (const key of dataProps) {
      const val = props[key];
      if (val !== undefined) dataAttrs[`data-${key}`] = String(val);
    }
    const onValueChange = props.onValueChange as ((v: string) => void) | undefined;
    const onChange = props.onChange as ((v: string) => void) | undefined;
    return createElement(
      "div",
      { "data-testid": `vf-mock-${name.toLowerCase()}`, ...dataAttrs },
      createElement("textarea", {
        "data-testid": `vf-mock-${name.toLowerCase()}-input`,
        "aria-label": (props["aria-label"] as string | undefined) ?? (typeof props.label === "string" ? props.label : name),
        placeholder: props.placeholder as string | undefined,
        readOnly: Boolean(props.readOnly),
        disabled: Boolean(props.disabled),
        value: current,
        onChange: (e: { target: { value: string } }) => {
          if (!controlled) setInternal(e.target.value);
          onValueChange?.(e.target.value);
          onChange?.(e.target.value);
        },
      }),
      props.children as ReactNode
    );
  };
  Mock.displayName = `Mock${name}`;
  return Mock;
}

/**
 * Overlay mock: renders the trigger and the content inline, always visible,
 * so tests can assert on tooltip / popover text without portals or timers.
 */
function createInlineOverlayMock(name: string): FC<Record<string, unknown>> {
  const Mock: FC<Record<string, unknown>> = (props) =>
    createElement(
      "span",
      { "data-testid": `vf-mock-${name.toLowerCase()}` },
      props.children as ReactNode,
      createElement(
        "span",
        { role: name === "Tooltip" ? "tooltip" : "dialog", "data-testid": `vf-mock-${name.toLowerCase()}-content` },
        props.content as ReactNode
      )
    );
  Mock.displayName = `Mock${name}`;
  return Mock;
}

const passthrough =
  (name: string, role?: string): FC<Record<string, unknown>> => {
    const Mock: FC<Record<string, unknown>> = (props) =>
      createElement("div", { "data-testid": `vf-mock-${name.toLowerCase()}`, role }, props.children as ReactNode);
    Mock.displayName = `Mock${name}`;
    return Mock;
  };

export const MockDataGrid = createMock("DataGrid", ["columns", "data"]);
export const MockCalendar = createMock("Calendar", ["view", "selectedDate"]);
export const MockRichTextEditor = createEditorMock("RichTextEditor", ["value"]);
export const MockMarkdownEditor = createEditorMock("MarkdownEditor", ["value"]);
export const MockCodeEditor = createEditorMock("CodeEditor", ["value", "language"]);
export const MockConversation = createMock("Conversation");
export const MockTooltip = createInlineOverlayMock("Tooltip");
export const MockPopover = createInlineOverlayMock("Popover");
/** Compound `PopoverV2` stand-in: Root, Trigger and Content render inline, always open. */
export const MockPopoverV2 = Object.assign(passthrough("PopoverV2"), {
  Trigger: passthrough("PopoverTrigger"),
  Content: passthrough("PopoverContent", "dialog"),
});

export const mockComponents = {
  DataGrid: MockDataGrid,
  Calendar: MockCalendar,
  RichTextEditor: MockRichTextEditor,
  MarkdownEditor: MockMarkdownEditor,
  CodeEditor: MockCodeEditor,
  Conversation: MockConversation,
  Tooltip: MockTooltip,
  Popover: MockPopover,
  PopoverV2: MockPopoverV2,
} as const;

// ───────────────────────────────────────────────────────────────
// Peer stubs
// ───────────────────────────────────────────────────────────────

export interface MockMermaidLoaderOptions {
  /** SVG markup `render` resolves with. Default a minimal `<svg>`. */
  svg?: string;
  /** Make `render` reject with this error. */
  error?: Error;
}

export interface MockMermaidLoader {
  /** Pass as `<Mermaid loader={loader} />`. */
  loader: () => Promise<{
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, src: string) => Promise<{ svg: string }>;
  }>;
  /** Every `initialize` config, for assertions on the theme. */
  initializeCalls: Array<Record<string, unknown>>;
  /** Every `(id, src)` render call. */
  renderCalls: Array<{ id: string; src: string }>;
}

/** A `Mermaid` loader that records `initialize` and `render` calls instead of loading mermaid. */
export function mockMermaidLoader(options: MockMermaidLoaderOptions = {}): MockMermaidLoader {
  const initializeCalls: Array<Record<string, unknown>> = [];
  const renderCalls: Array<{ id: string; src: string }> = [];
  const svg = options.svg ?? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';
  return {
    initializeCalls,
    renderCalls,
    loader: async () => ({
      initialize: (config) => {
        initializeCalls.push(config);
      },
      render: async (id, src) => {
        renderCalls.push({ id, src });
        if (options.error) throw options.error;
        return { svg };
      },
    }),
  };
}
