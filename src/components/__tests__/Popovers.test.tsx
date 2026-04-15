import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoverCard, PopoverV2 } from "../Popovers";
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
});
