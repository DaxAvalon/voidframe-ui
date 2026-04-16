import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import DocsApp, { DocBlock } from "../App";
import { guides } from "../guides";
import { curated } from "../curated";
import { playgroundScope } from "../scope";

describe("docs App", () => {
  it("renders without crashing", () => {
    const { container } = render(<DocsApp />);
    expect(container.querySelector(".vf-docs")).toBeTruthy();
  });

  it("shows the top-bar counter with all surface totals", () => {
    const { container } = render(<DocsApp />);
    const count = container.querySelector(".vf-docs__count");
    expect(count?.textContent).toMatch(/guides/);
    expect(count?.textContent).toMatch(/components/);
    expect(count?.textContent).toMatch(/hooks/);
    expect(count?.textContent).toMatch(/utilities/);
  });

  it("lists every guide in the sidebar", () => {
    const { container } = render(<DocsApp />);
    const links = Array.from(
      container.querySelectorAll(".vf-docs__nav-link")
    ).map((el) => el.textContent?.trim());
    for (const g of guides) {
      expect(links).toContain(g.title);
    }
  });

  it("switches active page when a sidebar link is clicked", () => {
    const { container } = render(<DocsApp />);
    const link = Array.from(
      container.querySelectorAll(".vf-docs__nav-link")
    ).find((el) => el.textContent?.trim() === "Theming") as HTMLButtonElement;
    expect(link).toBeDefined();
    fireEvent.click(link);
    const title = container.querySelector(".vf-docs__page-head");
    expect(title?.textContent).toMatch(/Theming/);
  });

  it("search filters the sidebar", () => {
    const { container } = render(<DocsApp />);
    const input = container.querySelector(
      ".vf-docs__search input"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Button" } });
    const links = Array.from(
      container.querySelectorAll(".vf-docs__nav-link")
    ).map((el) => el.textContent?.trim());
    expect(links.some((l) => l?.includes("Button"))).toBe(true);
    // Anything unrelated should be filtered out.
    expect(links.includes("Theming")).toBe(false);
  });

  it("renders empty state when search matches nothing", () => {
    const { container } = render(<DocsApp />);
    const input = container.querySelector(
      ".vf-docs__search input"
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { value: "zzzzzzzzzzzz-not-a-real-component" },
    });
    expect(container.textContent).toMatch(/No entries match/);
  });
});

describe("docs DocBlock", () => {
  it("renders a labeled block with children", () => {
    const { container } = render(
      <DocBlock title="Test">
        <span>child</span>
      </DocBlock>
    );
    expect(container.querySelector(".vf-docs__block")).toBeTruthy();
    expect(container.textContent).toContain("Test");
    expect(container.textContent).toContain("child");
  });
});

describe("docs curated overrides", () => {
  it("each curated entry has a summary and at least one example", () => {
    for (const [name, over] of Object.entries(curated)) {
      expect(over.summary).toBeDefined();
      expect(Array.isArray(over.examples)).toBe(true);
      expect(over.examples.length).toBeGreaterThan(0);
      for (const ex of over.examples) {
        expect(ex.title).toBeTruthy();
        expect(ex.code).toContain(name.split(".")[0]);
      }
    }
  });
});

describe("docs guides", () => {
  it("each guide exposes id + title + render()", () => {
    expect(guides.length).toBeGreaterThan(0);
    for (const g of guides) {
      expect(g.id).toBeTruthy();
      expect(g.title).toBeTruthy();
      const node = g.render();
      expect(node).toBeDefined();
    }
  });

  it("guides render without crashing", () => {
    for (const g of guides) {
      const { container, unmount } = render(<>{g.render()}</>);
      expect(container.firstChild).toBeTruthy();
      unmount();
    }
  });
});

describe("docs scope", () => {
  it("playgroundScope includes React + common hooks", () => {
    expect(playgroundScope.useState).toBeDefined();
    expect(playgroundScope.useEffect).toBeDefined();
    expect(playgroundScope.useMemo).toBeDefined();
    expect(playgroundScope.useRef).toBeDefined();
    expect(playgroundScope.React).toBeDefined();
  });

  it("playgroundScope includes voidframe surface", () => {
    expect(playgroundScope.Button).toBeDefined();
    expect(playgroundScope.Card).toBeDefined();
    expect(playgroundScope.Dialog).toBeDefined();
  });
});
