import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoverCard, PopoverV2, Tooltip, TooltipProvider, Backdrop } from "../Popovers";
import { Button } from "../Button";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("PopoverV2", () => {
  it("opens when the trigger is clicked (uncontrolled)", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <PopoverV2>
        <PopoverV2.Trigger>Open</PopoverV2.Trigger>
        <PopoverV2.Content>Body</PopoverV2.Content>
      </PopoverV2>
    );
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("opens when the trigger is clicked (controlled)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const Controlled = () => {
      return (
        <PopoverV2 open={false} onOpenChange={onOpenChange}>
          <PopoverV2.Trigger>Open</PopoverV2.Trigger>
          <PopoverV2.Content>Body</PopoverV2.Content>
        </PopoverV2>
      );
    };
    renderWithTheme(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("opens through an asChild <Button> trigger", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <PopoverV2>
        <PopoverV2.Trigger asChild>
          <Button>Open popover</Button>
        </PopoverV2.Trigger>
        <PopoverV2.Content>Body</PopoverV2.Content>
      </PopoverV2>
    );
    await user.click(screen.getByRole("button", { name: "Open popover" }));
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <PopoverV2 defaultOpen>
        <PopoverV2.Trigger>Open</PopoverV2.Trigger>
        <PopoverV2.Content>Body</PopoverV2.Content>
      </PopoverV2>
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });
});

describe("PopoverV2 - additional", () => {
  it("renders arrow when arrow=true", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <PopoverV2 defaultOpen>
        <PopoverV2.Trigger>Open</PopoverV2.Trigger>
        <PopoverV2.Content arrow>Body</PopoverV2.Content>
      </PopoverV2>
    );
    expect(document.querySelector(".vf-popover-v2__arrow")).toBeInTheDocument();
  });

  it("fires onOpenChange(false) on Escape", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(
      <PopoverV2 defaultOpen onOpenChange={onOpenChange}>
        <PopoverV2.Trigger>Open</PopoverV2.Trigger>
        <PopoverV2.Content>Body</PopoverV2.Content>
      </PopoverV2>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Tooltip", () => {
  it("shows tooltip on hover", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip content="Tooltip text" openDelay={0} closeDelay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole("button", { name: "Hover me" }));
    await waitFor(() =>
      expect(screen.getByRole("tooltip")).toBeInTheDocument()
    );
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("second tooltip opens with 0 delay when re-opened within skipDelayDuration", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TooltipProvider delayDuration={1000} skipDelayDuration={500}>
        <Tooltip content="First">
          <button>A</button>
        </Tooltip>
        <Tooltip content="Second">
          <button>B</button>
        </Tooltip>
      </TooltipProvider>
    );
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    // Hover A, wait for open, then leave (sets lastClosedAt).
    await user.hover(a);
    await waitFor(
      () => expect(screen.getByText("First")).toBeInTheDocument(),
      { timeout: 2000 }
    );
    await user.unhover(a);
    await waitFor(() =>
      expect(screen.queryByText("First")).not.toBeInTheDocument()
    );
    // Immediately hover B — should open without waiting ~delayDuration.
    const started = Date.now();
    await user.hover(b);
    await waitFor(() =>
      expect(screen.getByText("Second")).toBeInTheDocument()
    );
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(900);
  });
});

describe("Backdrop", () => {
  it("renders when open", () => {
    const { container } = renderWithTheme(<Backdrop open />);
    expect(container.querySelector(".vf-backdrop")).toBeInTheDocument();
  });

  it("renders nothing when open=false", () => {
    const { container } = renderWithTheme(<Backdrop open={false} />);
    expect(container.querySelector(".vf-backdrop")).not.toBeInTheDocument();
  });

  it("applies blur style", () => {
    const { container } = renderWithTheme(<Backdrop open blur />);
    const el = container.querySelector(".vf-backdrop") as HTMLElement;
    expect(el.style.backdropFilter).toContain("blur");
  });
});

describe("HoverCard", () => {
  it("opens on hover after the open delay", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger asChild>
          <Button>Hover</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>
    );
    expect(screen.queryByText("Card body")).not.toBeInTheDocument();
    await user.hover(screen.getByRole("button", { name: "Hover" }));
    await waitFor(() =>
      expect(screen.getByText("Card body")).toBeInTheDocument()
    );
  });

  it("wraps non-asChild trigger in a span", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>Plain text trigger</HoverCard.Trigger>
        <HoverCard.Content>Content</HoverCard.Content>
      </HoverCard>
    );
    const trigger = screen.getByText("Plain text trigger");
    // Non-asChild trigger should be wrapped in a <span>
    expect(trigger.tagName).toBe("SPAN");
    await user.hover(trigger);
    await waitFor(() =>
      expect(screen.getByText("Content")).toBeInTheDocument()
    );
  });

  it("content onMouseEnter keeps the card open", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <HoverCard openDelay={0} closeDelay={300}>
        <HoverCard.Trigger asChild>
          <Button>Hover</Button>
        </HoverCard.Trigger>
        <HoverCard.Content>Hover Content</HoverCard.Content>
      </HoverCard>
    );
    await user.hover(screen.getByRole("button", { name: "Hover" }));
    await waitFor(() =>
      expect(screen.getByText("Hover Content")).toBeInTheDocument()
    );
    // Move into the content to keep it open (exercises onMouseEnter on content)
    const content = screen.getByText("Hover Content").closest(".vf-hovercard")!;
    await user.hover(content as HTMLElement);
    expect(screen.getByText("Hover Content")).toBeInTheDocument();
  });
});
