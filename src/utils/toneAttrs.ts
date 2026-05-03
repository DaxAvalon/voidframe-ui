// ═══════════════════════════════════════════════════════════════
// toneAttrs — shared tone/variant/size attribute emitter
// ═══════════════════════════════════════════════════════════════
//
// Tone-capable components (Badge, Stat, AlertV2, Callout, Message,
// MetricCard, Progress, …) have historically emitted tone as a BEM
// class modifier only (`vf-stat--success`). Tests and consumer CSS
// that want attribute-based hooks had no option, so migrating code
// from libraries that use `data-tone` (shadcn, Chakra, Mantine)
// needed rewrites.
//
// Every tone-capable component should call this helper so both the
// BEM class and the `data-tone` / `data-variant` / `data-size`
// attributes are emitted consistently.
//
// Example:
//   const ta = toneAttrs("vf-stat", { tone, variant, size });
//   return <div className={cx(ta.className, className)} {...ta.attrs} ... />

import { cx } from "./cx";

export interface ToneAttrsInput {
  tone?: string;
  variant?: string;
  size?: string;
}

export interface ToneAttrs {
  /** BEM-style class list: `"vf-stat vf-stat--success vf-stat--sm"`. */
  className: string;
  /**
   * `data-*` attributes. Spread this directly onto the element so
   * `[data-tone="success"]`-style selectors resolve.
   */
  attrs: {
    "data-tone"?: string;
    "data-variant"?: string;
    "data-size"?: string;
  };
}

/**
 * Build a combined BEM class list + `data-*` attribute object from
 * tone/variant/size props. Emits both representations so consumers
 * can target either.
 *
 * @param base  BEM base class (e.g. `"vf-stat"`). Always included.
 * @param input Tone/variant/size values. Undefined values are omitted.
 */
export function toneAttrs(base: string, input: ToneAttrsInput = {}): ToneAttrs {
  const { tone, variant, size } = input;
  const className = cx(
    base,
    tone && `${base}--${tone}`,
    variant && `${base}--${variant}`,
    size && `${base}--${size}`
  );
  const attrs: ToneAttrs["attrs"] = {};
  if (tone) attrs["data-tone"] = tone;
  if (variant) attrs["data-variant"] = variant;
  if (size) attrs["data-size"] = size;
  return { className, attrs };
}
