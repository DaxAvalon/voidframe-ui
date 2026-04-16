import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { TreeTable } from "../TreeTable";

interface Row {
  name: string;
  size: number;
  children?: Row[];
}

const data: Row[] = [
  {
    name: "src",
    size: 0,
    children: [
      { name: "index.ts", size: 120 },
      { name: "utils.ts", size: 80 },
    ],
  },
  { name: "README.md", size: 50 },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "size", header: "Size", render: (r: Row) => `${r.size} KB` },
];

describe("TreeTable", () => {
  it("renders top-level rows", () => {
    renderWithTheme(
      <TreeTable
        columns={columns}
        data={data}
        getChildren={(r) => r.children}
        rowKey={(r) => r.name}
      />
    );
    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("README.md")).toBeInTheDocument();
  });

  it("expand/collapse toggles children rows", async () => {
    renderWithTheme(
      <TreeTable
        columns={columns}
        data={data}
        getChildren={(r) => r.children}
        rowKey={(r) => r.name}
      />
    );
    // Children not visible initially
    expect(screen.queryByText("index.ts")).not.toBeInTheDocument();
    // Expand
    await userEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByText("index.ts")).toBeInTheDocument();
    expect(screen.getByText("utils.ts")).toBeInTheDocument();
    // Collapse
    await userEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.queryByText("index.ts")).not.toBeInTheDocument();
  });

  it("uses column render function when provided", async () => {
    renderWithTheme(
      <TreeTable
        columns={columns}
        data={data}
        getChildren={(r) => r.children}
        rowKey={(r) => r.name}
        defaultExpanded={["src"]}
      />
    );
    // The render function for size should produce "120 KB"
    expect(screen.getByText("120 KB")).toBeInTheDocument();
  });

  it("renders column values by key when no render function", () => {
    renderWithTheme(
      <TreeTable
        columns={[{ key: "name", header: "Name" }]}
        data={data}
        getChildren={(r) => r.children}
        rowKey={(r) => r.name}
      />
    );
    expect(screen.getByText("src")).toBeInTheDocument();
  });
});
