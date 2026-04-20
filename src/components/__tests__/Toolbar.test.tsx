import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toolbar } from "../Toolbar";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Toolbar", () => {
  it("renders with role=toolbar and children", () => {
    renderWithTheme(
      <Toolbar>
        <Toolbar.Button>Bold</Toolbar.Button>
      </Toolbar>
    );
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("renders ToolbarLink as an anchor", () => {
    renderWithTheme(
      <Toolbar>
        <Toolbar.Link href="/docs">Docs</Toolbar.Link>
      </Toolbar>
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("vf-toolbar__link");
  });

  it("renders ToolbarSeparator with role=separator", () => {
    renderWithTheme(
      <Toolbar>
        <Toolbar.Button>A</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Button>B</Toolbar.Button>
      </Toolbar>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("single-toggle group toggles one item at a time", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Toolbar>
        <Toolbar.ToggleGroup type="single" onValueChange={onChange}>
          <Toolbar.ToggleItem value="left">L</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="right">R</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>
    );
    await userEvent.click(screen.getByRole("button", { name: "L" }));
    expect(onChange).toHaveBeenLastCalledWith("left");
    await userEvent.click(screen.getByRole("button", { name: "R" }));
    expect(onChange).toHaveBeenLastCalledWith("right");
  });

  it("multiple-toggle group preserves a list of selections", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Toolbar>
        <Toolbar.ToggleGroup type="multiple" onValueChange={onChange}>
          <Toolbar.ToggleItem value="b">B</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="i">I</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>
    );
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    await userEvent.click(screen.getByRole("button", { name: "I" }));
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toEqual(["b", "i"]);
  });
});
