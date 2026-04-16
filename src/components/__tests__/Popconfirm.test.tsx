import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Popconfirm } from "../Popconfirm";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Popconfirm", () => {
  it("renders trigger element (children)", () => {
    renderWithTheme(
      <Popconfirm title="Confirm?" onConfirm={() => {}}>
        <button>Delete</button>
      </Popconfirm>
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("click trigger opens popover with title", async () => {
    renderWithTheme(
      <Popconfirm title="Are you sure?" onConfirm={() => {}}>
        <button>Delete</button>
      </Popconfirm>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("renders description when provided", async () => {
    renderWithTheme(
      <Popconfirm
        title="Delete?"
        description="This action cannot be undone."
        onConfirm={() => {}}
      >
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("renders icon when provided", async () => {
    renderWithTheme(
      <Popconfirm
        title="Delete?"
        icon={<span data-testid="custom-icon">!</span>}
        onConfirm={() => {}}
      >
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("confirm button fires onConfirm and closes popover", async () => {
    const onConfirm = vi.fn();
    renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={onConfirm}>
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("cancel button fires onCancel and closes popover", async () => {
    const onCancel = vi.fn();
    renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={() => {}} onCancel={onCancel}>
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("custom confirmLabel and cancelLabel render correctly", async () => {
    renderWithTheme(
      <Popconfirm
        title="Sure?"
        onConfirm={() => {}}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      >
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.getByRole("button", { name: "Yes, delete" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "No, keep" })
    ).toBeInTheDocument();
  });

  it("escape key closes popover", async () => {
    renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={() => {}}>
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("controlled: open prop controls visibility, onOpenChange fires", async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Popconfirm
            title="Sure?"
            onConfirm={() => {}}
            open={isOpen}
            onOpenChange={(v) => {
              setIsOpen(v);
              onOpenChange(v);
            }}
          >
            <button>Delete</button>
          </Popconfirm>
          <button onClick={() => setIsOpen(true)} data-testid="open-ext">
            Open
          </button>
        </>
      );
    }
    renderWithTheme(<Controlled />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Open externally
    await userEvent.click(screen.getByTestId("open-ext"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Click trigger to toggle (close)
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uncontrolled: defaultOpen sets initial state", () => {
    renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={() => {}} defaultOpen>
        <button>Delete</button>
      </Popconfirm>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("disabled prop prevents trigger from opening", async () => {
    renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={() => {}} disabled>
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("danger variant: confirm button has danger styling class", async () => {
    renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={() => {}} confirmVariant="danger">
        <button>Delete</button>
      </Popconfirm>
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn.className).toContain("vf-button--danger");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Popconfirm title="Sure?" onConfirm={() => {}} defaultOpen>
        <button>Delete</button>
      </Popconfirm>
    );
    await expectNoA11yViolations(container);
  });
});
