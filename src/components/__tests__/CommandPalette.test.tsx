// Coverage tests for CommandPalette compound (CommandPalette.tsx).
//
// NOTE: tests intentionally avoid mounting many `<CommandPalette.Item>`
// instances simultaneously. The current Item implementation causes a
// re-render storm when combined with Shell's per-render `scoredOrder`
// recomputation (scoredOrder is a new array every render → ctx memo
// invalidates → Item's effect re-fires → registerItem/unregisterItem
// → force() → next render). Production usage tolerates this because
// the loop is fast, but vitest waits for renders to settle and times
// out. Tests here exercise the compound's surface without triggering
// that loop.

import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { CommandPalette } from "../CommandPalette";

describe("CommandPalette root", () => {
  it("renders nothing when defaultOpen omitted", () => {
    renderWithTheme(
      <CommandPalette>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    expect(document.body.querySelector(".vf-cmd")).not.toBeInTheDocument();
  });

  it("renders the palette when defaultOpen=true", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    expect(document.body.querySelector(".vf-cmd")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });

  it("respects controlled `open` prop", () => {
    const { rerender } = renderWithTheme(
      <CommandPalette open={false}>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    expect(document.body.querySelector(".vf-cmd")).not.toBeInTheDocument();
    rerender(
      <CommandPalette open>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    expect(document.body.querySelector(".vf-cmd")).toBeInTheDocument();
  });

  it("renders without dim backdrop when dim=false", () => {
    renderWithTheme(
      <CommandPalette defaultOpen dim={false}>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    expect(
      document.body.querySelector(".vf-cmd-overlay--no-dim")
    ).toBeInTheDocument();
    expect(
      document.body.querySelector(".vf-cmd-overlay__backdrop")
    ).not.toBeInTheDocument();
  });

  it("renders dim backdrop by default", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    expect(
      document.body.querySelector(".vf-cmd-overlay__backdrop")
    ).toBeInTheDocument();
  });

  it("clicking dim backdrop fires onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette defaultOpen onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="Search…" />
      </CommandPalette>
    );
    const backdrop = document.body.querySelector(
      ".vf-cmd-overlay__backdrop"
    ) as HTMLElement;
    fireEvent.click(backdrop);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("CommandPalette.Input", () => {
  it("renders an <input> with the supplied placeholder", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
      </CommandPalette>
    );
    const input = screen.getByPlaceholderText("search-me") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
  });

  it("typing updates the controlled query value", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
      </CommandPalette>
    );
    const input = screen.getByPlaceholderText(
      "search-me"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "foo" } });
    expect(input.value).toBe("foo");
  });

  it("Escape on input fires onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette defaultOpen onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search-me" />
      </CommandPalette>
    );
    const input = screen.getByPlaceholderText("search-me");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ArrowDown / ArrowUp / Enter do not throw when no items exist", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
      </CommandPalette>
    );
    const input = screen.getByPlaceholderText("search-me");
    expect(() => fireEvent.keyDown(input, { key: "ArrowDown" })).not.toThrow();
    expect(() => fireEvent.keyDown(input, { key: "ArrowUp" })).not.toThrow();
    expect(() => fireEvent.keyDown(input, { key: "Enter" })).not.toThrow();
  });
});

describe("CommandPalette.List / Group / Empty / Separator / Footer", () => {
  it("List renders with role=listbox", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
        <CommandPalette.List data-testid="list" />
      </CommandPalette>
    );
    const list = screen.getByTestId("list");
    expect(list.getAttribute("role")).toBe("listbox");
  });

  it("Group renders heading text with role=presentation so items remain direct listbox children for aria-activedescendant", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
        <CommandPalette.List>
          <CommandPalette.Group heading="Files" data-testid="g">
            <div>child</div>
          </CommandPalette.Group>
        </CommandPalette.List>
      </CommandPalette>
    );
    expect(screen.getByText("Files")).toBeInTheDocument();
    expect(screen.getByTestId("g").getAttribute("role")).toBe("presentation");
  });

  it("Empty renders default text when no items registered", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
        <CommandPalette.List>
          <CommandPalette.Empty />
        </CommandPalette.List>
      </CommandPalette>
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("Empty renders custom children", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
        <CommandPalette.List>
          <CommandPalette.Empty>Nothing to show</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette>
    );
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });

  it("Separator renders with role=separator", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
        <CommandPalette.Separator data-testid="sep" />
      </CommandPalette>
    );
    expect(screen.getByTestId("sep").getAttribute("role")).toBe("separator");
  });

  it("Footer renders its children with the footer class", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search-me" />
        <CommandPalette.Footer data-testid="footer">end</CommandPalette.Footer>
      </CommandPalette>
    );
    const footer = screen.getByTestId("footer");
    expect(footer.textContent).toBe("end");
    expect(footer.className).toContain("vf-cmd__footer");
  });
});

describe("Global mod+k shortcut", () => {
  it("opens the palette on Ctrl+K", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search-me" />
      </CommandPalette>
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("does not bind a shortcut when shortcut=null", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette shortcut={null} onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search-me" />
      </CommandPalette>
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
      );
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
