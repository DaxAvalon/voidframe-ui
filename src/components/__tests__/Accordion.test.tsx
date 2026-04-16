import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Accordion } from "../Accordion";

function BasicAccordion(props: Record<string, unknown> = {}) {
  return (
    <Accordion {...props}>
      <Accordion.Item value="a">
        <Accordion.Trigger>Section A</Accordion.Trigger>
        <Accordion.Content>Content A</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Trigger>Section B</Accordion.Trigger>
        <Accordion.Content>Content B</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Trigger>Section C</Accordion.Trigger>
        <Accordion.Content>Content C</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("renders all triggers", () => {
    renderWithTheme(<BasicAccordion />);
    expect(screen.getByText("Section A")).toBeInTheDocument();
    expect(screen.getByText("Section B")).toBeInTheDocument();
    expect(screen.getByText("Section C")).toBeInTheDocument();
  });

  it("all content is hidden by default", () => {
    renderWithTheme(<BasicAccordion />);
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("opens an item on click (single mode)", async () => {
    renderWithTheme(<BasicAccordion />);
    await userEvent.click(screen.getByText("Section A"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
  });

  it("single mode closes previous when opening new", async () => {
    renderWithTheme(<BasicAccordion type="single" />);
    await userEvent.click(screen.getByText("Section A"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Section B"));
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("multiple mode keeps multiple open", async () => {
    renderWithTheme(<BasicAccordion type="multiple" />);
    await userEvent.click(screen.getByText("Section A"));
    await userEvent.click(screen.getByText("Section B"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("collapsible allows closing the only open item", async () => {
    renderWithTheme(<BasicAccordion collapsible />);
    await userEvent.click(screen.getByText("Section A"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Section A"));
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });

  it("non-collapsible single prevents closing the only open item", async () => {
    renderWithTheme(<BasicAccordion type="single" collapsible={false} />);
    await userEvent.click(screen.getByText("Section A"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Section A"));
    // Should still be open
    expect(screen.getByText("Content A")).toBeInTheDocument();
  });

  it("controlled mode calls onValueChange", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(<BasicAccordion value="" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByText("Section B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("defaultValue opens the specified item", () => {
    renderWithTheme(<BasicAccordion defaultValue="b" />);
    expect(screen.getByText("Content B")).toBeInTheDocument();
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });

  it("triggers have correct aria attributes", async () => {
    renderWithTheme(<BasicAccordion />);
    const trigger = screen.getByText("Section A").closest("button")!;
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("content has region role", async () => {
    renderWithTheme(<BasicAccordion />);
    await userEvent.click(screen.getByText("Section A"));
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("ArrowDown moves focus to next trigger", async () => {
    renderWithTheme(<BasicAccordion />);
    const triggerA = screen.getByText("Section A").closest("button")!;
    triggerA.focus();
    await userEvent.keyboard("{ArrowDown}");
    const triggerB = screen.getByText("Section B").closest("button")!;
    expect(document.activeElement).toBe(triggerB);
  });

  it("ArrowUp moves focus to previous trigger", async () => {
    renderWithTheme(<BasicAccordion />);
    const triggerB = screen.getByText("Section B").closest("button")!;
    triggerB.focus();
    await userEvent.keyboard("{ArrowUp}");
    const triggerA = screen.getByText("Section A").closest("button")!;
    expect(document.activeElement).toBe(triggerA);
  });

  it("Home key focuses first trigger", async () => {
    renderWithTheme(<BasicAccordion />);
    const triggerC = screen.getByText("Section C").closest("button")!;
    triggerC.focus();
    await userEvent.keyboard("{Home}");
    const triggerA = screen.getByText("Section A").closest("button")!;
    expect(document.activeElement).toBe(triggerA);
  });

  it("End key focuses last trigger", async () => {
    renderWithTheme(<BasicAccordion />);
    const triggerA = screen.getByText("Section A").closest("button")!;
    triggerA.focus();
    await userEvent.keyboard("{End}");
    const triggerC = screen.getByText("Section C").closest("button")!;
    expect(document.activeElement).toBe(triggerC);
  });

  it("disabled item cannot be toggled", async () => {
    renderWithTheme(
      <Accordion>
        <Accordion.Item value="a" disabled>
          <Accordion.Trigger>Disabled</Accordion.Trigger>
          <Accordion.Content>Hidden</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
    await userEvent.click(screen.getByText("Disabled"));
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("multiple defaultValue opens multiple items", () => {
    renderWithTheme(<BasicAccordion type="multiple" defaultValue={["a", "b"]} />);
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("caret shows open/closed indicators", async () => {
    const { container } = renderWithTheme(<BasicAccordion />);
    const carets = container.querySelectorAll(".vf-accordion__caret");
    expect(carets[0]!.textContent).toBe("\u25b8"); // closed
    await userEvent.click(screen.getByText("Section A"));
    expect(carets[0]!.textContent).toBe("\u25be"); // open
  });
});
