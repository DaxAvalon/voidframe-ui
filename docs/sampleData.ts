/**
 * Sample-data registry for auto-generated playgrounds.
 *
 * Consulted by getDefaultValueForProp before its inline ladder:
 * matchers pair a prop name with a type-name pattern and produce a
 * code-string literal that satisfies the prop with realistic data.
 * Add a matcher here when a new component's required prop defeats
 * auto-generation (the docs render audit will flag it).
 */
import type { PropDoc } from "../src/dev";

interface SampleMatcher {
  /** Exact prop name, or regex over the prop name. */
  prop: string | RegExp;
  /** Regex over the prop's type string (case-insensitive). */
  type: RegExp;
  /** JSX attribute value, including the braces/quotes wrapper. */
  value: string;
}

const MATCHERS: SampleMatcher[] = [
  {
    prop: "options",
    type: /mentionoption\[\]/i,
    value:
      '{[{ value: "alice", label: "alice", description: "Design" }, { value: "bob", label: "bob", description: "Backend" }, { value: "carol", label: "carol", description: "Infra" }]}',
  },
  {
    prop: "commands",
    type: /slashcommandoption\[\]/i,
    value:
      '{[{ value: "summarize", label: "summarize", description: "Summarize the thread" }, { value: "search", label: "search", description: "Search the docs" }]}',
  },
  // Debug/inspector surfaces take arbitrary data — show a small object.
  {
    prop: "data",
    type: /unknown|any/i,
    value:
      '{{ name: "voidframe", version: "1.3.0", themes: ["dark", "light", "midnight", "grey"], strict: true }}',
  },
  // ReactNode-valued required props render fine with a string.
  { prop: "value", type: /reactnode/i, value: '{"42,318"}' },
  { prop: "content", type: /reactnode/i, value: '{"Shown on hover — explains the thing next to it."}' },
  { prop: "title", type: /reactnode/i, value: '{"Title"}' },
  { prop: "label", type: /reactnode/i, value: '{"Label"}' },
];

/**
 * Return a JSX attribute value for the prop, or null when no matcher
 * fits. Checked before autoPlayground's inline ladder.
 */
export function sampleValueFor(prop: PropDoc): string | null {
  const type = prop.type ?? "";
  for (const m of MATCHERS) {
    const nameHit =
      typeof m.prop === "string" ? m.prop === prop.name : m.prop.test(prop.name);
    if (nameHit && m.type.test(type)) return m.value;
  }
  return null;
}
