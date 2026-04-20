import { PopoverV2, Button } from "voidframe";

export default function PopoverRoute() {
  // Push the trigger near the viewport right edge so Playwright can
  // assert that PopoverV2's anchored positioning flips data-side to
  // "left" instead of clipping off-screen.
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 0 }}>
        <PopoverV2>
          <PopoverV2.Trigger asChild>
            <Button data-testid="trigger">Open popover</Button>
          </PopoverV2.Trigger>
          <PopoverV2.Content placement="right" arrow data-testid="content">
            <p>Popover body</p>
          </PopoverV2.Content>
        </PopoverV2>
      </div>
      <button data-testid="outside">outside</button>
    </>
  );
}
