// Coverage-gap tests for provider:
//   - ThemeScope.tsx: nested scopes, density/contrast/direction attrs,
//     partial theme overrides, themeName resolution

import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ThemeScope } from "../ThemeScope";
import {
  darkTheme,
  lightTheme,
  midnightTheme,
  useTokens,
} from "../../index";

// ── ThemeScope: nested scopes ────────────────────────────

describe("ThemeScope — nested scopes", () => {
  it("inner scope overrides outer scope tokens", () => {
    let outerBg = "";
    let innerBg = "";
    function OuterProbe() {
      outerBg = useTokens().bg0;
      return null;
    }
    function InnerProbe() {
      innerBg = useTokens().bg0;
      return null;
    }
    renderWithTheme(
      <ThemeScope themeName="dark">
        <OuterProbe />
        <ThemeScope themeName="light">
          <InnerProbe />
        </ThemeScope>
      </ThemeScope>
    );
    expect(outerBg).toBe(darkTheme.bg0);
    expect(innerBg).toBe(lightTheme.bg0);
    expect(outerBg).not.toBe(innerBg);
  });
});

// ── ThemeScope: data attributes ──────────────────────────

describe("ThemeScope — data attributes", () => {
  it("sets data-vf-density when not comfortable", () => {
    const { container } = renderWithTheme(
      <ThemeScope density="compact">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).toHaveAttribute("data-vf-density", "compact");
  });

  it("omits data-vf-density when comfortable (default)", () => {
    const { container } = renderWithTheme(
      <ThemeScope density="comfortable">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).not.toHaveAttribute("data-vf-density");
  });

  it("sets data-vf-contrast when not normal", () => {
    const { container } = renderWithTheme(
      <ThemeScope contrast="high">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).toHaveAttribute("data-vf-contrast", "high");
  });

  it("omits data-vf-contrast when normal", () => {
    const { container } = renderWithTheme(
      <ThemeScope contrast="normal">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).not.toHaveAttribute("data-vf-contrast");
  });

  it("sets data-vf-motion when not auto", () => {
    const { container } = renderWithTheme(
      <ThemeScope reducedMotion="always">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).toHaveAttribute("data-vf-motion", "always");
  });

  it("omits data-vf-motion when auto", () => {
    const { container } = renderWithTheme(
      <ThemeScope reducedMotion="auto">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).not.toHaveAttribute("data-vf-motion");
  });

  it("sets dir=rtl when direction is rtl", () => {
    const { container } = renderWithTheme(
      <ThemeScope direction="rtl">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).toHaveAttribute("dir", "rtl");
  });

  it("omits dir when direction is ltr", () => {
    const { container } = renderWithTheme(
      <ThemeScope direction="ltr">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).not.toHaveAttribute("dir");
  });
});

// ── ThemeScope: partial overrides ────────────────────────

describe("ThemeScope — partial theme overrides", () => {
  it("merges partial overrides with outer tokens", () => {
    let captured = "";
    function Probe() {
      captured = useTokens().green;
      return null;
    }
    renderWithTheme(
      <ThemeScope theme={{ green: "#00ff00" }}>
        <Probe />
      </ThemeScope>
    );
    expect(captured).toBe("#00ff00");
  });

  it("uses full token set when theme is a complete set", () => {
    let captured = "";
    function Probe() {
      captured = useTokens().bg0;
      return null;
    }
    renderWithTheme(
      <ThemeScope theme={midnightTheme}>
        <Probe />
      </ThemeScope>
    );
    expect(captured).toBe(midnightTheme.bg0);
  });
});

// ── ThemeScope: themeName prop ────────────────────────────

describe("ThemeScope — themeName prop", () => {
  it("sets data-vf-theme attribute", () => {
    const { container } = renderWithTheme(
      <ThemeScope themeName="midnight">
        <div>x</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope");
    expect(scope).toHaveAttribute("data-vf-theme", "midnight");
  });

  it("resolves built-in theme by name", () => {
    let captured = "";
    function Probe() {
      captured = useTokens().bg0;
      return null;
    }
    renderWithTheme(
      <ThemeScope themeName="midnight">
        <Probe />
      </ThemeScope>
    );
    expect(captured).toBe(midnightTheme.bg0);
  });

  it("falls back to outer tokens for unknown themeName", () => {
    let outerBg = "";
    let innerBg = "";
    function OuterProbe() {
      outerBg = useTokens().bg0;
      return null;
    }
    function InnerProbe() {
      innerBg = useTokens().bg0;
      return null;
    }
    renderWithTheme(
      <>
        <OuterProbe />
        <ThemeScope themeName="nonexistent-theme">
          <InnerProbe />
        </ThemeScope>
      </>
    );
    // Unknown theme should fall back to outer tokens
    expect(innerBg).toBe(outerBg);
  });
});
