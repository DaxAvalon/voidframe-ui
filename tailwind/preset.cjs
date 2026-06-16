// Voidframe UI — Tailwind CSS preset.
//
// Maps voidframe's `--vf-*` design tokens onto Tailwind's theme scales so you
// can use voidframe's tokens as first-class Tailwind utilities — and have them
// re-theme automatically when VoidframeProvider swaps the active theme, since
// every value resolves to a CSS custom property at runtime.
//
//   // tailwind.config.js
//   module.exports = { presets: [require("voidframe-ui/tailwind")] };
//
//   <div class="bg-vf-bg-1 text-vf-text-0 border border-vf-border-2 p-vf-4 font-vf-mono" />
//
// Color/spacing/typography utilities reference `var(--vf-*)`, so they follow
// the active theme. Breakpoints are emitted as literal pixel values (CSS media
// queries cannot read custom properties) taken from the default theme.

/** Accent ramp: DEFAULT plus the 5/10/20/40/60 opacity variants. */
function accent(name) {
  return {
    DEFAULT: `var(--vf-${name})`,
    5: `var(--vf-${name}-5)`,
    10: `var(--vf-${name}-10)`,
    20: `var(--vf-${name}-20)`,
    40: `var(--vf-${name}-40)`,
    60: `var(--vf-${name}-60)`,
  };
}

/** Numbered scale: { [from..to]: var(--vf-<prefix>-<n>) }. */
function scale(prefix, from, to) {
  const out = {};
  for (let i = from; i <= to; i++) out[i] = `var(--vf-${prefix}-${i})`;
  return out;
}

module.exports = {
  theme: {
    extend: {
      colors: {
        vf: {
          bg: scale("bg", 0, 5),
          border: scale("border", 0, 4),
          text: scale("text", 0, 5),
          green: accent("green"),
          red: accent("red"),
          amber: accent("amber"),
          blue: accent("blue"),
          purple: accent("purple"),
          cyan: accent("cyan"),
          rose: accent("rose"),
          success: "var(--vf-success)",
          danger: "var(--vf-danger)",
          warning: "var(--vf-warning)",
          info: "var(--vf-info)",
        },
      },
      spacing: {
        "vf-1": "var(--vf-sp-1)",
        "vf-2": "var(--vf-sp-2)",
        "vf-3": "var(--vf-sp-3)",
        "vf-4": "var(--vf-sp-4)",
        "vf-5": "var(--vf-sp-5)",
        "vf-6": "var(--vf-sp-6)",
        "vf-7": "var(--vf-sp-7)",
        "vf-8": "var(--vf-sp-8)",
        "vf-9": "var(--vf-sp-9)",
        "vf-10": "var(--vf-sp-10)",
        "vf-11": "var(--vf-sp-11)",
        "vf-12": "var(--vf-sp-12)",
      },
      fontFamily: {
        vf: "var(--vf-font-family)",
        "vf-mono": "var(--vf-font-mono)",
        "vf-sans": "var(--vf-font-sans)",
        "vf-display": "var(--vf-font-display)",
      },
      fontSize: {
        "vf-xxs": "var(--vf-font-xxs)",
        "vf-xs": "var(--vf-font-xs)",
        "vf-sm": "var(--vf-font-sm)",
        "vf-md": "var(--vf-font-md)",
        "vf-lg": "var(--vf-font-lg)",
        "vf-xl": "var(--vf-font-xl)",
        "vf-xxl": "var(--vf-font-xxl)",
        "vf-3xl": "var(--vf-font-3xl)",
      },
      lineHeight: {
        vf: "var(--vf-line-height)",
      },
      letterSpacing: {
        vf: "var(--vf-letter-spacing)",
        "vf-label": "var(--vf-label-spacing)",
        "vf-heading": "var(--vf-heading-tracking)",
      },
      borderRadius: {
        vf: "var(--vf-radius)",
        "vf-1": "var(--vf-radius-1)",
        "vf-2": "var(--vf-radius-2)",
      },
      borderWidth: {
        "vf-0": "var(--vf-border-width-0)",
        "vf-1": "var(--vf-border-width-1)",
        "vf-2": "var(--vf-border-width-2)",
        "vf-3": "var(--vf-border-width-3)",
        "vf-4": "var(--vf-border-width-4)",
      },
      transitionProperty: {
        vf: "all",
      },
      screens: {
        // Literal px from the default theme — media queries can't read vars.
        "vf-sm": "640px",
        "vf-md": "768px",
        "vf-lg": "1024px",
        "vf-xl": "1280px",
        "vf-xxl": "1536px",
      },
    },
  },
};
