// Regression: split-mode line numbers must count per side, not by row index
// (pad rows used to consume a number on the padded side).
import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { DiffViewer, lineDiff } from "../Viewers/DiffViewer";

const nums = (root: HTMLElement, side: "old" | "new") =>
  Array.from(root.querySelectorAll(`.vf-diff__line[data-side="${side}"] .vf-diff__num`)).map(
    (n) => n.textContent
  );

describe("DiffViewer split numbering", () => {
  it("keeps old-side numbers contiguous across an insertion on the new side", () => {
    const { container } = renderWithTheme(
      <DiffViewer kind="split" oldValue={"a\nb\nc"} newValue={"a\nX\nY\nb\nc"} />
    );
    const root = container.querySelector(".vf-diff") as HTMLElement;
    expect(nums(root, "old")).toEqual(["1", "", "", "2", "3"]);
    expect(nums(root, "new")).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("keeps new-side numbers contiguous across a deletion", () => {
    const { container } = renderWithTheme(
      <DiffViewer kind="split" oldValue={"a\nb\nc\nd"} newValue={"a\nd"} />
    );
    const root = container.querySelector(".vf-diff") as HTMLElement;
    expect(nums(root, "old")).toEqual(["1", "2", "3", "4"]);
    expect(nums(root, "new")).toEqual(["1", "", "", "2"]);
  });

  it("numbers a changed line pair on both sides", () => {
    const { container } = renderWithTheme(
      <DiffViewer kind="split" oldValue={"a\nfoo bar\nc"} newValue={"a\nfoo baz\nc"} />
    );
    const root = container.querySelector(".vf-diff") as HTMLElement;
    expect(nums(root, "old")).toEqual(["1", "2", "3"]);
    expect(nums(root, "new")).toEqual(["1", "2", "3"]);
    expect(root.querySelectorAll(".vf-diff__row")).toHaveLength(3);
  });

  it("renders titles, wrap and size modifiers", () => {
    const { container } = renderWithTheme(
      <DiffViewer kind="split" oldValue="a" newValue="b" oldTitle="Before" newTitle="After" wrap size="md" />
    );
    const root = container.querySelector(".vf-diff") as HTMLElement;
    expect(root.className).toContain("vf-diff--wrap");
    expect(root.className).toContain("vf-diff--md");
    const titles = root.querySelectorAll(".vf-diff__title");
    expect(titles[0]).toHaveTextContent("Before");
    expect(titles[1]).toHaveTextContent("After");
  });

  it("unified mode shows old and new numbers per line", () => {
    const { container } = renderWithTheme(<DiffViewer oldValue={"a\nb"} newValue={"a\nc"} />);
    const lines = container.querySelectorAll(".vf-diff__line");
    const pairs = Array.from(lines).map((l) =>
      Array.from(l.querySelectorAll(".vf-diff__num")).map((n) => n.textContent)
    );
    expect(pairs).toEqual([["1", "1"], ["2", ""], ["", "2"]]);
  });

  it("exports lineDiff as a pure helper", () => {
    expect(lineDiff("a\nb", "a\nc")).toEqual([
      { op: "equal", line: "a" },
      { op: "delete", line: "b" },
      { op: "insert", line: "c" },
    ]);
  });
});
