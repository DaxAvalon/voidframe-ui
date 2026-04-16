// Tests for DrawerV2 compound component

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DrawerV2 } from "../DrawerCompound";

describe("DrawerV2", () => {
  it("renders trigger button", () => {
    renderWithTheme(
      <DrawerV2>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("trigger has correct aria attributes", () => {
    renderWithTheme(
      <DrawerV2>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    const btn = screen.getByRole("button", { name: "Open" });
    expect(btn).toHaveAttribute("aria-haspopup", "dialog");
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("opens drawer on trigger click", async () => {
    renderWithTheme(
      <DrawerV2>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Drawer Content</DrawerV2.Content>
      </DrawerV2>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Drawer Content")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders title with correct id for aria-labelledby", async () => {
    renderWithTheme(
      <DrawerV2>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>
          <DrawerV2.Title>My Title</DrawerV2.Title>
        </DrawerV2.Content>
      </DrawerV2>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const title = screen.getByText("My Title");
    expect(title.tagName).toBe("H2");
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", title.id);
  });

  it("calls onOpenChange when opening", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <DrawerV2 onOpenChange={onOpenChange}>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes on DrawerV2.Close click", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <DrawerV2 onOpenChange={onOpenChange}>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>
          <DrawerV2.Close>X</DrawerV2.Close>
        </DrawerV2.Content>
      </DrawerV2>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("X")).toBeInTheDocument();
    await userEvent.click(screen.getByText("X"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders default close button text when no children", async () => {
    renderWithTheme(
      <DrawerV2 defaultOpen>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>
          <DrawerV2.Close />
        </DrawerV2.Content>
      </DrawerV2>
    );
    // The default close button text is the multiplication sign
    const closeBtn = screen.getByRole("button", { name: "Close" });
    expect(closeBtn).toBeInTheDocument();
  });

  it("renders header, body, and footer sub-components", async () => {
    renderWithTheme(
      <DrawerV2 defaultOpen>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>
          <DrawerV2.Header>Header</DrawerV2.Header>
          <DrawerV2.Body>Body</DrawerV2.Body>
          <DrawerV2.Footer>Footer</DrawerV2.Footer>
        </DrawerV2.Content>
      </DrawerV2>
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(document.querySelector(".vf-drawer-v2__header")).toBeInTheDocument();
    expect(document.querySelector(".vf-drawer-v2__body")).toBeInTheDocument();
    expect(document.querySelector(".vf-drawer-v2__footer")).toBeInTheDocument();
  });

  it("applies side class", async () => {
    renderWithTheme(
      <DrawerV2 side="left" defaultOpen>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(document.querySelector(".vf-drawer-v2--left")).toBeInTheDocument();
    expect(document.querySelector(".vf-drawer-v2__panel--left")).toBeInTheDocument();
  });

  it("uses controlled open prop", () => {
    const { rerender } = renderWithTheme(
      <DrawerV2 open={false}>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <DrawerV2 open={true}>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders backdrop in modal mode and closes on click", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <DrawerV2 defaultOpen onOpenChange={onOpenChange}>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    const backdrop = document.querySelector(".vf-drawer-v2__backdrop");
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(backdrop!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("trigger asChild clones child element", async () => {
    renderWithTheme(
      <DrawerV2>
        <DrawerV2.Trigger asChild>
          <span data-testid="custom">Click me</span>
        </DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    const trigger = screen.getByTestId("custom");
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("close asChild clones child element", async () => {
    renderWithTheme(
      <DrawerV2 defaultOpen>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>
          <DrawerV2.Close asChild>
            <span data-testid="custom-close">Dismiss</span>
          </DrawerV2.Close>
        </DrawerV2.Content>
      </DrawerV2>
    );
    expect(screen.getByTestId("custom-close")).toBeInTheDocument();
  });

  it("sets aria-modal on dialog in modal mode", async () => {
    renderWithTheme(
      <DrawerV2 defaultOpen modal>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("applies adaptive class by default", async () => {
    renderWithTheme(
      <DrawerV2 defaultOpen>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(document.querySelector(".vf-drawer-v2__panel--adaptive")).toBeInTheDocument();
  });

  it("does not apply adaptive class when adaptive=false", async () => {
    renderWithTheme(
      <DrawerV2 defaultOpen>
        <DrawerV2.Trigger>Open</DrawerV2.Trigger>
        <DrawerV2.Content adaptive={false}>Content</DrawerV2.Content>
      </DrawerV2>
    );
    expect(document.querySelector(".vf-drawer-v2__panel--adaptive")).not.toBeInTheDocument();
  });
});
