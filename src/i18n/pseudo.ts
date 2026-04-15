// Phase 17 — Pseudolocalization
//
// Wraps every character in a diacritic-heavy variant and pads the total
// length ~40% to stress-test text expansion. Applied recursively across
// any PartialMessages tree so consumers can preview mobile/desktop
// layout with realistic non-English text lengths.

import type { PartialMessages, VoidframeMessages } from "./messages";

const MAP: Record<string, string> = {
  a: "á",
  b: "ƀ",
  c: "ç",
  d: "đ",
  e: "é",
  f: "ƒ",
  g: "ǧ",
  h: "ĥ",
  i: "í",
  j: "ǰ",
  k: "ǩ",
  l: "ĺ",
  m: "ɱ",
  n: "ñ",
  o: "ó",
  p: "ṕ",
  q: "ʠ",
  r: "ř",
  s: "š",
  t: "ť",
  u: "ú",
  v: "ṽ",
  w: "ẃ",
  x: "ẋ",
  y: "ý",
  z: "ž",
};

function wrap(input: string): string {
  if (!input) return input;
  let out = "";
  for (const ch of input) {
    const lower = ch.toLowerCase();
    const mapped = MAP[lower];
    if (!mapped) {
      out += ch;
      continue;
    }
    out += ch === lower ? mapped : mapped.toUpperCase();
  }
  // Pad to ~40% longer.
  const pad = Math.max(1, Math.round(out.length * 0.4));
  return `⟦${out}${"‥".repeat(pad)}⟧`;
}

function transform(value: unknown): unknown {
  if (typeof value === "string") return wrap(value);
  if (typeof value === "function") {
    return (args: Record<string, unknown>) => wrap((value as (a: Record<string, unknown>) => string)(args));
  }
  if (Array.isArray(value)) return value.map(transform);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = transform(v);
    return out;
  }
  return value;
}

/**
 * Produce a full pseudolocalized copy of the messages catalog. Use with
 * `<VoidframeProvider messages={pseudolocalize(enMessages)}>` during
 * layout QA to catch text-expansion issues.
 */
export function pseudolocalize(
  messages: VoidframeMessages | PartialMessages
): PartialMessages {
  return transform(messages) as PartialMessages;
}
