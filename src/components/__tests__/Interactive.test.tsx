import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collapsible, Kbd, Modal, Tabs, Toast } from "../Interactive";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Tabs", () => {
  function BasicTabs({
    value,
    defaultValue,
    onValueChange,
  }: {
    value?: string;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
  }) {
    return (
      <Tabs value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
          <Tabs.Trigger value="b">Beta</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="a">alpha panel</Tabs.Panel>
        <Tabs.Panel value="b">beta panel</Tabs.Panel>
      </Tabs>
    );
  }

  it("renders all tab labels with role=tab", () => {
    renderWithTheme(<BasicTabs defaultValue="a" />);
    expect(screen.getByRole("tab", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Beta" })).toBeInTheDocument();
  });

  it("sets aria-selected on the active tab", () => {
    renderWithTheme(<BasicTabs defaultValue="b" />);
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
    renderWithTheme(<BasicTabs defaultValue="a" />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("emits onValueChange with selected value", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(<BasicTabs value="a" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("arrow-right navigates to next tab", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(<BasicTabs value="a" onValueChange={onValueChange} />);
    screen.getByRole("tab", { name: "Alpha" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("renders only the active panel by default", () => {
    renderWithTheme(<BasicTabs defaultValue="a" />);
    expect(screen.getByText("alpha panel")).toBeInTheDocument();
    expect(screen.queryByText("beta panel")).not.toBeInTheDocument();
  });

  it("wires aria-controls and aria-labelledby between trigger and panel", () => {
    renderWithTheme(<BasicTabs defaultValue="a" />);
    const trigger = screen.getByRole("tab", { name: "Alpha" });
    const panel = screen.getByRole("tabpanel");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
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
      <Modal open={false} onDismiss={() => {}} title="TITLE">
        hello
      </Modal>
    );
    expect(screen.queryByText("TITLE")).not.toBeInTheDocument();
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    renderWithTheme(
      <Modal open onDismiss={() => {}} title="HEADER">
        content
      </Modal>
    );
    expect(screen.getByText("HEADER")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("close button triggers onDismiss", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <Modal open onDismiss={onDismiss} title="X">
        body
      </Modal>
    );
    await userEvent.click(screen.getByText("×"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
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
