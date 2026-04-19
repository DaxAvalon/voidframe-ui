import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb, Pagination, Stepper } from "../Navigation";
import { Divider } from "../Text";
import { Kbd } from "../Interactive";
import { renderWithTheme } from "../../../test/renderWithTheme";

// ── Divider ──

describe("Divider (upgrade)", () => {
  it("renders a labeled horizontal divider", () => {
    renderWithTheme(<Divider label="OR" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveClass("vf-divider--labeled");
    expect(within(sep).getByText("OR")).toBeInTheDocument();
  });

  it("vertical orientation exposes aria-orientation", () => {
    renderWithTheme(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
  });
});

// ── Kbd ──

describe("Kbd (upgrade)", () => {
  it("renders children directly", () => {
    renderWithTheme(<Kbd>⌘</Kbd>);
    expect(screen.getByText("⌘").tagName).toBe("KBD");
  });

  it("still accepts the legacy `keys` string prop", () => {
    renderWithTheme(<Kbd keys="Cmd+K" />);
    expect(screen.getByText("Cmd+K")).toBeInTheDocument();
  });
});

// ── Breadcrumb compound + maxItems ──

describe("Breadcrumb (upgrade)", () => {
  it("supports compound <Breadcrumb.Item> children", () => {
    renderWithTheme(
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/users">Users</Breadcrumb.Item>
        <Breadcrumb.Item current>Alice</Breadcrumb.Item>
      </Breadcrumb>
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("Alice")).toHaveAttribute("aria-current", "page");
  });

  it("collapses middle segments when over maxItems", () => {
    renderWithTheme(
      <Breadcrumb
        maxItems={3}
        items={[
          { label: "Home" },
          { label: "Category" },
          { label: "Subcat" },
          { label: "Leaf" },
          { label: "Current" },
        ]}
      />
    );
    expect(screen.getByText("…")).toBeInTheDocument();
    // Middle items shouldn't be visible; first and last two should be.
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Category")).not.toBeInTheDocument();
    expect(screen.queryByText("Subcat")).not.toBeInTheDocument();
    expect(screen.getByText("Leaf")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("custom separator is rendered between items", () => {
    renderWithTheme(
      <Breadcrumb
        separator={<span data-testid="sep">›</span>}
        items={[{ label: "A" }, { label: "B" }]}
      />
    );
    expect(screen.getAllByTestId("sep").length).toBe(1);
  });
});

// ── Pagination upgrades ──

describe("Pagination (upgrade)", () => {
  it("shows first/last buttons when enabled", () => {
    renderWithTheme(
      <Pagination
        value={5}
        totalPages={10}
        onValueChange={() => {}}
        showFirstLast
      />
    );
    expect(screen.getByRole("button", { name: "First page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Last page" })).toBeInTheDocument();
  });

  it("respects siblingCount to widen visible pages", () => {
    renderWithTheme(
      <Pagination
        value={10}
        totalPages={20}
        onValueChange={() => {}}
        siblingCount={2}
        boundaryCount={1}
      />
    );
    // With siblingCount=2, pages 8..12 should be visible around current=10.
    for (const n of [8, 9, 10, 11, 12]) {
      expect(
        screen.getByRole("button", { name: `Page ${n}` })
      ).toBeInTheDocument();
    }
  });

  it("renders page-size select when enabled", async () => {
    const onPageSizeChange = vi.fn();
    renderWithTheme(
      <Pagination
        value={1}
        totalPages={1}
        onValueChange={() => {}}
        showPageSize
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
      />
    );
    const select = screen.getByLabelText("Rows per page");
    await userEvent.selectOptions(select, "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

});

// ── Stepper upgrades ──

describe("Stepper (upgrade)", () => {
  it("supports compound <Stepper.Step> with description + optional", () => {
    renderWithTheme(
      <Stepper current={1}>
        <Stepper.Step label="Account" description="Basic info" />
        <Stepper.Step label="Profile" optional />
        <Stepper.Step label="Confirm" />
      </Stepper>
    );
    expect(screen.getByText("Basic info")).toBeInTheDocument();
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("clickable steps fire onChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Stepper current={0} clickable onChange={onChange}>
        <Stepper.Step label="A" />
        <Stepper.Step label="B" />
      </Stepper>
    );
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("vertical orientation applies the modifier class", () => {
    const { container } = renderWithTheme(
      <Stepper current={0} orientation="vertical">
        <Stepper.Step label="A" />
      </Stepper>
    );
    expect(container.querySelector(".vf-stepper--vertical")).toBeInTheDocument();
  });

  it("dotted variant drops numeric glyph", () => {
    const { container } = renderWithTheme(
      <Stepper current={0} variant="dotted">
        <Stepper.Step label="A" />
        <Stepper.Step label="B" />
      </Stepper>
    );
    const bullets = container.querySelectorAll(".vf-stepper__bullet");
    expect(bullets[0]!.textContent).toBe("");
  });
});
