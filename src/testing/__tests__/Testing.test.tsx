import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import {
  createMockStorage,
  installMatchMedia,
  renderWithTheme,
} from "../index";
import { expectNoA11yViolations } from "../axe";
import { ar } from "../../i18n";

describe("voidframe/testing — renderWithTheme", () => {
  it("wraps children in a provider and returns a root() accessor", () => {
    const result = renderWithTheme(<button>go</button>);
    expect(screen.getByRole("button", { name: "go" })).toBeInTheDocument();
    expect(result.root()).toBeTruthy();
  });

  it("applies density / contrast / direction data attrs", () => {
    const { container } = renderWithTheme(<div>x</div>, {
      density: "compact",
      contrast: "high",
      direction: "rtl",
    });
    const root = container.querySelector(".vf-root");
    expect(root).toHaveAttribute("data-vf-density", "compact");
    expect(root).toHaveAttribute("data-vf-contrast", "high");
    expect(root).toHaveAttribute("dir", "rtl");
  });

  it("accepts a locale pack", () => {
    const { container } = renderWithTheme(<div>x</div>, { locale: ar });
    expect(container.querySelector(".vf-root")).toHaveAttribute("dir", "rtl");
  });
});

describe("voidframe/testing — expectNoA11yViolations", () => {
  it("passes for accessible markup", async () => {
    const { container } = renderWithTheme(
      <button type="button" aria-label="Submit">
        Submit
      </button>
    );
    await expectNoA11yViolations(container);
  });
});

describe("voidframe/testing — installMatchMedia", () => {
  it("returns deterministic matches + fires listeners on width change", () => {
    const ctl = installMatchMedia(320);
    const mql = window.matchMedia("(min-width: 768px)");
    expect(mql.matches).toBe(false);
    let fired = 0;
    mql.addEventListener("change", () => {
      fired += 1;
    });
    ctl.setWidth(1024);
    expect(mql.matches).toBe(true);
    expect(fired).toBe(1);
    ctl.restore();
  });
});

describe("voidframe/testing — createMockStorage", () => {
  it("round-trips set / get / remove through the in-memory store", () => {
    const s = createMockStorage({ preset: "seed" });
    expect(s.get("preset")).toBe("seed");
    s.set("theme", "light");
    expect(s.store.get("theme")).toBe("light");
    s.remove?.("theme");
    expect(s.get("theme")).toBeNull();
  });
});
