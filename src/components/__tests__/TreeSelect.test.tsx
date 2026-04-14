import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TreeSelect, type TreeNode } from "../TreeSelect";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const tree: TreeNode[] = [
  {
    value: "fruits",
    label: "Fruits",
    children: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
  {
    value: "veg",
    label: "Vegetables",
    children: [
      { value: "carrot", label: "Carrot" },
      { value: "potato", label: "Potato", disabled: true },
    ],
  },
];

describe("TreeSelect", () => {
  it("renders a closed trigger with placeholder", () => {
    renderWithTheme(<TreeSelect label="Category" nodes={tree} />);
    expect(screen.getByRole("button", { name: "Category" })).toHaveTextContent(
      "Select…"
    );
  });

  it("clicking the trigger opens the tree", async () => {
    renderWithTheme(<TreeSelect label="Category" nodes={tree} />);
    await userEvent.click(screen.getByRole("button", { name: "Category" }));
    expect(screen.getByRole("tree")).toBeInTheDocument();
    // Only roots are visible initially.
    expect(screen.getByRole("treeitem", { name: /Fruits/ })).toBeInTheDocument();
    expect(screen.queryByRole("treeitem", { name: /Apple/ })).not.toBeInTheDocument();
  });

  it("clicking disclosure expands children", async () => {
    renderWithTheme(<TreeSelect label="Category" nodes={tree} />);
    await userEvent.click(screen.getByRole("button", { name: "Category" }));
    await userEvent.click(screen.getByRole("button", { name: "Expand Fruits" }));
    expect(screen.getByRole("treeitem", { name: /Apple/ })).toBeInTheDocument();
  });

  it("selecting a leaf emits onChange and closes", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TreeSelect
        label="Category"
        nodes={tree}
        defaultExpanded={["fruits"]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Category" }));
    await userEvent.click(screen.getByRole("treeitem", { name: /Apple/ }));
    expect(onChange).toHaveBeenCalledWith("apple");
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });

  it("selectableBranches=false leaves branches click-to-expand only", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TreeSelect
        label="Category"
        nodes={tree}
        selectableBranches={false}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Category" }));
    await userEvent.click(screen.getByRole("treeitem", { name: /Fruits/ }));
    expect(onChange).not.toHaveBeenCalled();
    // And children should now be visible (expanded).
    expect(screen.getByRole("treeitem", { name: /Apple/ })).toBeInTheDocument();
  });

  it("disabled leaf cannot be selected", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TreeSelect
        label="Category"
        nodes={tree}
        defaultExpanded={["veg"]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Category" }));
    await userEvent.click(screen.getByRole("treeitem", { name: /Potato/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no a11y violations (closed)", async () => {
    const { container } = renderWithTheme(
      <TreeSelect label="Category" nodes={tree} />
    );
    await expectNoA11yViolations(container);
  });
});
