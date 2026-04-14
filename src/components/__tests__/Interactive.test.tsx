import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collapsible, Kbd, Modal, Tabs, Toast } from "../Interactive";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Tabs", () => {
  const tabs = [
    { key: "a", label: "Alpha" },
    { key: "b", label: "Beta" },
  ];

  it("renders all tab labels with role=tab", () => {
    renderWithTheme(<Tabs tabs={tabs} active="a" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Beta" })).toBeInTheDocument();
  });

  it("sets aria-selected on the active tab", () => {
    renderWithTheme(<Tabs tabs={tabs} active="b" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("wraps in role=tablist", () => {
    renderWithTheme(<Tabs tabs={tabs} active="a" onChange={() => {}} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("emits onChange with selected key", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Tabs tabs={tabs} active="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("arrow-right navigates to next tab", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Tabs tabs={tabs} active="a" onChange={onChange} />);
    screen.getByRole("tablist").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Collapsible", () => {
  it("is closed by default", () => {
    renderWithTheme(<Collapsible title="LOGS">hidden</Collapsible>);
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("opens on header click", async () => {
    renderWithTheme(<Collapsible title="LOGS">inner</Collapsible>);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("inner")).toBeInTheDocument();
  });

  it("sets aria-expanded correctly", async () => {
    renderWithTheme(<Collapsible title="T">x</Collapsible>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("respects defaultOpen", () => {
    renderWithTheme(
      <Collapsible title="T" defaultOpen>
        body
      </Collapsible>
    );
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});

describe("Modal", () => {
  it("renders nothing when closed", () => {
    renderWithTheme(
      <Modal open={false} onClose={() => {}} title="TITLE">
        hello
      </Modal>
    );
    expect(screen.queryByText("TITLE")).not.toBeInTheDocument();
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    renderWithTheme(
      <Modal open onClose={() => {}} title="HEADER">
        content
      </Modal>
    );
    expect(screen.getByText("HEADER")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("close button triggers onClose", async () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Modal open onClose={onClose} title="X">
        body
      </Modal>
    );
    await userEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Toast", () => {
  it("info renders role=status (polite)", () => {
    renderWithTheme(<Toast message="Hello" />);
    expect(screen.getByRole("status")).toHaveTextContent("Hello");
  });

  it("danger renders role=alert (assertive)", () => {
    renderWithTheme(<Toast message="boom" type="danger" />);
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
  });

  it("returns null when visible=false", () => {
    renderWithTheme(<Toast message="Hello" visible={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("shows dismiss button when onDismiss given", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(<Toast message="x" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it.each(["info", "success", "warning"] as const)(
    "type=%s uses role=status",
    (type) => {
      renderWithTheme(<Toast message="x" type={type} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    }
  );
});

describe("Kbd", () => {
  it("renders key text", () => {
    renderWithTheme(<Kbd keys="⌘K" />);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });
});
