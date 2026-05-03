#!/usr/bin/env node
// Export voidframe design tokens in multiple formats.
// Usage:
//   node scripts/export-tokens.mjs --format json
//   node scripts/export-tokens.mjs --format scss
//   node scripts/export-tokens.mjs --format css
//   node scripts/export-tokens.mjs --format figma
//   node scripts/export-tokens.mjs --format all

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

// We can't import .ts directly from an mjs script, so we duplicate the token values.
// This is the trade-off for a zero-dependency export script.
// In production, this would be generated from the build output.

const themes = {
  dark: {
    bg0: "#050505", bg1: "#0a0a0a", bg2: "#0d0d0d", bg3: "#111111", bg4: "#161616", bg5: "#1a1a1a",
    border0: "#111111", border1: "#1a1a1a", border2: "#222222", border3: "#333333", border4: "#444444",
    text0: "#ffffff", text1: "#cccccc", text2: "#888888", text3: "#555555", text4: "#333333", text5: "#1a1a1a",
    green: "#4ade80", red: "#f87171", amber: "#c8aa3e", blue: "#6b9fdd", purple: "#a855f7", cyan: "#22d3ee", rose: "#ff6b6b",
    success: "#4ade80", danger: "#f87171", warning: "#c8aa3e", info: "#6b9fdd",
    fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
    fontXxs: 8, fontXs: 9, fontSm: 10, fontMd: 12, fontLg: 14, fontXl: 18, fontXxl: 24, font3xl: 32,
    lineHeight: 1.6, letterSpacing: 1.5, labelSpacing: 2,
    sp1: 2, sp2: 4, sp3: 6, sp4: 8, sp5: 10, sp6: 12, sp7: 14, sp8: 16, sp9: 20, sp10: 24, sp11: 32, sp12: 48,
    radius: 0, transition: "all 0.15s ease",
  },
  light: {
    bg0: "#f5f5f0", bg1: "#eaeae5", bg2: "#e0e0db", bg3: "#d6d6d1", bg4: "#c0c0bb", bg5: "#b0b0a8",
    border0: "#c8c8c3", border1: "#b8b8b3", border2: "#8e8e89", border3: "#5e5e5a", border4: "#3a3a37",
    text0: "#000000", text1: "#1a1a1a", text2: "#3e3e3e", text3: "#5e5e5e", text4: "#7a7a7a", text5: "#9a9a9a",
    green: "#0f7f38", red: "#b91c1c", amber: "#854d0e", blue: "#1d4ed8", purple: "#6d28d9", cyan: "#0e7490", rose: "#be123c",
    success: "#0f7f38", danger: "#b91c1c", warning: "#854d0e", info: "#1d4ed8",
    fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
    fontXxs: 8, fontXs: 9, fontSm: 10, fontMd: 12, fontLg: 14, fontXl: 18, fontXxl: 24, font3xl: 32,
    lineHeight: 1.6, letterSpacing: 1.5, labelSpacing: 2,
    sp1: 2, sp2: 4, sp3: 6, sp4: 8, sp5: 10, sp6: 12, sp7: 14, sp8: 16, sp9: 20, sp10: 24, sp11: 32, sp12: 48,
    radius: 0, transition: "all 0.15s ease",
  },
  midnight: {
    bg0: "#000000", bg1: "#040407", bg2: "#07070d", bg3: "#0b0b14", bg4: "#11111c", bg5: "#161624",
    border0: "#0b0b14", border1: "#14141f", border2: "#1b1b2a", border3: "#2a2a3f", border4: "#3a3a55",
    text0: "#e8e8f5", text1: "#bbbbd0", text2: "#7d7d94", text3: "#4f4f66", text4: "#2e2e44", text5: "#161624",
    green: "#6ee7a8", red: "#f47a7a", amber: "#e2c256", blue: "#7db0ee", purple: "#b983ff", cyan: "#7fe8f3", rose: "#ff95b6",
    success: "#6ee7a8", danger: "#f47a7a", warning: "#e2c256", info: "#7db0ee",
    fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
    fontXxs: 8, fontXs: 9, fontSm: 10, fontMd: 12, fontLg: 14, fontXl: 18, fontXxl: 24, font3xl: 32,
    lineHeight: 1.6, letterSpacing: 1.5, labelSpacing: 2,
    sp1: 2, sp2: 4, sp3: 6, sp4: 8, sp5: 10, sp6: 12, sp7: 14, sp8: 16, sp9: 20, sp10: 24, sp11: 32, sp12: 48,
    radius: 0, transition: "all 0.15s ease",
  },
  grey: {
    bg0: "#2a2a2a", bg1: "#2f2f2f", bg2: "#353535", bg3: "#3b3b3b", bg4: "#424242", bg5: "#4a4a4a",
    border0: "#3b3b3b", border1: "#484848", border2: "#5a5a5a", border3: "#6e6e6e", border4: "#8a8a8a",
    text0: "#f5f5f5", text1: "#dcdcdc", text2: "#b0b0b0", text3: "#8a8a8a", text4: "#6a6a6a", text5: "#4a4a4a",
    green: "#6ee7a8", red: "#fb7185", amber: "#f1c96b", blue: "#8fb8f0", purple: "#c4a3ff", cyan: "#7fe8f3", rose: "#ff95b6",
    success: "#6ee7a8", danger: "#fb7185", warning: "#f1c96b", info: "#8fb8f0",
    fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
    fontXxs: 8, fontXs: 9, fontSm: 10, fontMd: 12, fontLg: 14, fontXl: 18, fontXxl: 24, font3xl: 32,
    lineHeight: 1.6, letterSpacing: 1.5, labelSpacing: 2,
    sp1: 2, sp2: 4, sp3: 6, sp4: 8, sp5: 10, sp6: 12, sp7: 14, sp8: 16, sp9: 20, sp10: 24, sp11: 32, sp12: 48,
    radius: 0, transition: "all 0.15s ease",
  },
};

// Classify token type
function tokenType(key, value) {
  if (/^(bg|border|text|green|red|amber|blue|purple|cyan|rose|success|danger|warning|info)/.test(key)) return "color";
  if (/^font/.test(key) && key !== "fontFamily") return "dimension";
  if (key === "fontFamily") return "fontFamily";
  if (/^sp\d+$/.test(key)) return "dimension";
  if (/^bp/.test(key)) return "dimension";
  if (key === "radius") return "dimension";
  if (key === "lineHeight" || key === "letterSpacing" || key === "labelSpacing") return "number";
  if (key === "transition") return "string";
  return typeof value === "number" ? "dimension" : "string";
}

// CSS variable name
function cssVarName(key) {
  return "--vf-" + key.replace(/([A-Z])/g, "-$1").toLowerCase()
    .replace(/(\d+)/, "-$1");
}

// Format value for CSS
function cssValue(key, value) {
  if (typeof value === "string") return value;
  if (/^(font|sp\d|bp|radius|borderWidth)/.test(key)) return value + "px";
  return String(value);
}

// ── Formatters ──────────────────────────────────────────────

function toJSON(themeTokens) {
  const result = {};
  for (const [key, value] of Object.entries(themeTokens)) {
    const type = tokenType(key, value);
    // Group by category
    let category;
    if (/^bg/.test(key)) category = "color.surface";
    else if (/^border/.test(key)) category = "color.border";
    else if (/^text/.test(key)) category = "color.text";
    else if (/^(green|red|amber|blue|purple|cyan|rose)/.test(key)) category = "color.accent";
    else if (/^(success|danger|warning|info)/.test(key)) category = "color.semantic";
    else if (/^font/.test(key)) category = "typography";
    else if (/^sp/.test(key)) category = "spacing";
    else if (/^bp/.test(key)) category = "breakpoint";
    else category = "misc";

    const parts = category.split(".");
    let target = result;
    for (const part of parts) {
      target[part] = target[part] || {};
      target = target[part];
    }
    target[key] = { value: cssValue(key, value), type };
  }
  return result;
}

function toSCSS(themeTokens) {
  const lines = ["// Voidframe design tokens (auto-generated)", "// Do not edit manually.", ""];
  for (const [key, value] of Object.entries(themeTokens)) {
    const varName = "$vf-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
    const val = typeof value === "string" ? (value.includes(",") ? `"${value}"` : value) : cssValue(key, value);
    lines.push(`${varName}: ${val};`);
  }
  return lines.join("\n") + "\n";
}

function toCSS(themeTokens, themeName) {
  const lines = [
    `/* Voidframe design tokens — ${themeName} theme (auto-generated) */`,
    `[data-vf-theme="${themeName}"] {`,
  ];
  for (const [key, value] of Object.entries(themeTokens)) {
    lines.push(`  ${cssVarName(key)}: ${cssValue(key, value)};`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

function toFigma(allThemes) {
  const modes = Object.keys(allThemes).map(name => ({ name: name.charAt(0).toUpperCase() + name.slice(1), modeId: name }));
  const variables = [];
  const darkTokens = allThemes.dark;
  for (const key of Object.keys(darkTokens)) {
    const type = tokenType(key, darkTokens[key]);
    if (type !== "color") continue; // Figma variables are primarily for colors
    const valuesByMode = {};
    for (const [themeName, tokens] of Object.entries(allThemes)) {
      const hex = tokens[key];
      if (typeof hex === "string" && hex.startsWith("#")) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        valuesByMode[themeName] = { r: r / 255, g: g / 255, b: b / 255, a: 1 };
      }
    }
    variables.push({
      name: `color/${key.replace(/([A-Z])/g, "/$1").toLowerCase()}`,
      resolvedType: "COLOR",
      valuesByMode,
    });
  }
  return { variableCollections: [{ name: "Voidframe Tokens", modes, variables }] };
}

// ── CLI ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const formatIdx = args.indexOf("--format");
const format = formatIdx >= 0 ? args[formatIdx + 1] : "all";
const outDir = resolve("dist/tokens");

mkdirSync(outDir, { recursive: true });

const formats = format === "all" ? ["json", "scss", "css", "figma"] : [format];

for (const fmt of formats) {
  switch (fmt) {
    case "json": {
      const data = toJSON(themes.dark);
      writeFileSync(resolve(outDir, "tokens.json"), JSON.stringify(data, null, 2) + "\n");
      console.log("✓ tokens.json");
      break;
    }
    case "scss": {
      writeFileSync(resolve(outDir, "tokens.scss"), toSCSS(themes.dark));
      console.log("✓ tokens.scss");
      break;
    }
    case "css": {
      const parts = Object.entries(themes).map(([name, tokens]) => toCSS(tokens, name));
      writeFileSync(resolve(outDir, "tokens.css"), parts.join("\n"));
      console.log("✓ tokens.css");
      break;
    }
    case "figma": {
      writeFileSync(resolve(outDir, "figma-variables.json"), JSON.stringify(toFigma(themes), null, 2) + "\n");
      console.log("✓ figma-variables.json");
      break;
    }
    default:
      console.error(`Unknown format: ${fmt}`);
      process.exit(1);
  }
}

console.log(`\nTokens exported to ${outDir}/`);
