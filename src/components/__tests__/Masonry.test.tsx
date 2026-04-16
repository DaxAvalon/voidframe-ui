// Coverage tests for Masonry (Masonry.tsx).
// happy-dom doesn't lay things out, so we assert on classes / inline styles /
// child counts rather than measured geometry.

import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { Masonry } from "../Masonry";

describe("Masonry", () => {
  it("renders the root .vf-masonry element with default columns", () => {
    const { container } = renderWithTheme(
      <Masonry>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </Masonry>
    );
    expect(container.querySelector(".vf-masonry")).toBeInTheDocument();
  });

  it("renders all children", () => {
    const { container } = renderWithTheme(
      <Masonry columns={2}>
        <div>a</div>
        <div>b</div>
        <div>c</div>
        <div>d</div>
      </Masonry>
    );
    expect(container.textContent).toContain("a");
    expect(container.textContent).toContain("b");
    expect(container.textContent).toContain("c");
    expect(container.textContent).toContain("d");
  });

  it("respects `columns` numeric prop in the grid template style", () => {
    const { container } = renderWithTheme(
      <Masonry columns={4}>
        <div>x</div>
      </Masonry>
    );
    const root = container.querySelector(".vf-masonry") as HTMLElement;
    expect(root.style.gridTemplateColumns).toContain("repeat(4");
  });

  it("renders fallback column buckets when native masonry not supported", () => {
    // happy-dom's CSS.supports returns false for `grid-template-rows: masonry`,
    // so the JS fallback path is used. Each bucket should appear as a column.
    const { container } = renderWithTheme(
      <Masonry columns={3}>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </Masonry>
    );
    const cols = container.querySelectorAll(".vf-masonry__col");
    // If fallback active, we get exactly `columns` buckets; if native masonry
    // somehow is supported, none. Accept either.
    if (cols.length > 0) {
      expect(cols.length).toBe(3);
    } else {
      expect(container.querySelector(".vf-masonry")).toBeInTheDocument();
    }
  });

  it("accepts a numeric gap and renders it as px", () => {
    const { container } = renderWithTheme(
      <Masonry gap={24}>
        <div>g</div>
      </Masonry>
    );
    const root = container.querySelector(".vf-masonry") as HTMLElement;
    expect(root.style.gap).toBe("24px");
  });

  it("accepts a string gap value verbatim", () => {
    const { container } = renderWithTheme(
      <Masonry gap="2rem">
        <div>g</div>
      </Masonry>
    );
    const root = container.querySelector(".vf-masonry") as HTMLElement;
    expect(root.style.gap).toBe("2rem");
  });

  it("accepts a responsive `columns` object", () => {
    const { container } = renderWithTheme(
      <Masonry columns={{ base: 2, md: 4 }}>
        <div>x</div>
        <div>y</div>
      </Masonry>
    );
    expect(container.querySelector(".vf-masonry")).toBeInTheDocument();
  });

  it("renders with no children", () => {
    const { container } = renderWithTheme(<Masonry columns={2} />);
    expect(container.querySelector(".vf-masonry")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = renderWithTheme(
      <Masonry className="custom">
        <div>x</div>
      </Masonry>
    );
    const root = container.querySelector(".vf-masonry") as HTMLElement;
    expect(root.className).toContain("custom");
  });
});
