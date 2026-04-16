import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { TreeView, type TreeNode } from "../TreeView";

const items: TreeNode[] = [
  {
    id: "a",
    label: "Alpha",
    children: [
      { id: "a1", label: "Alpha-1" },
      { id: "a2", label: "Alpha-2" },
    ],
  },
  { id: "b", label: "Beta" },
  { id: "c", label: "Charlie" },
];

describe("TreeView", () => {
  it("renders root items", () => {
    renderWithTheme(<TreeView items={items} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("children are hidden until expanded", async () => {
    renderWithTheme(<TreeView items={items} />);
    expect(screen.queryByText("Alpha-1")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByText("Alpha-1")).toBeInTheDocument();
  });

  it("defaultExpanded opens specified nodes", () => {
    renderWithTheme(<TreeView items={items} defaultExpanded={["a"]} />);
    expect(screen.getByText("Alpha-1")).toBeInTheDocument();
    expect(screen.getByText("Alpha-2")).toBeInTheDocument();
  });

  it("fires onSelectionChange on click", async () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <TreeView items={items} onSelectionChange={onSelectionChange} />
    );
    await userEvent.click(screen.getByText("Beta"));
    expect(onSelectionChange).toHaveBeenCalledWith("b");
  });

  it("multiSelect mode toggles selection", async () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <TreeView items={items} multiSelect onSelectionChange={onSelectionChange} />
    );
    await userEvent.click(screen.getByText("Beta"));
    expect(onSelectionChange).toHaveBeenCalledWith(["b"]);
    await userEvent.click(screen.getByText("Charlie"));
    expect(onSelectionChange).toHaveBeenCalledWith(["b", "c"]);
  });

  it("checkable mode renders checkboxes", () => {
    renderWithTheme(<TreeView items={items} checkable />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThanOrEqual(3);
  });

  it("checkable fires onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(
      <TreeView items={items} checkable onCheckedChange={onCheckedChange} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Check Beta" });
    await userEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(["b"]);
  });

  it("has tree role with aria-multiselectable for multi mode", () => {
    renderWithTheme(<TreeView items={items} multiSelect />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
  });

  it("selected item has aria-selected=true", async () => {
    renderWithTheme(<TreeView items={items} selected="b" />);
    const beta = screen.getByText("Beta").closest("[role='treeitem']")!;
    expect(beta).toHaveAttribute("aria-selected", "true");
  });

  it("disabled items cannot be selected", async () => {
    const disabledItems: TreeNode[] = [
      { id: "x", label: "Disabled", disabled: true },
      { id: "y", label: "Enabled" },
    ];
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <TreeView items={disabledItems} onSelectionChange={onSelectionChange} />
    );
    await userEvent.click(screen.getByText("Disabled"));
    // onSelectionChange should not have been called (disabled items are skipped)
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("fires onExpandedChange", async () => {
    const onExpandedChange = vi.fn();
    renderWithTheme(
      <TreeView items={items} onExpandedChange={onExpandedChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(onExpandedChange).toHaveBeenCalled();
  });
});
