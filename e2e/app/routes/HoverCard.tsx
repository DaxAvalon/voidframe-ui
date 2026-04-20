import { HoverCard, Button } from "voidframe";

export default function HoverCardRoute() {
  return (
    <>
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCard.Trigger asChild>
          <Button data-testid="trigger">Hover me</Button>
        </HoverCard.Trigger>
        <HoverCard.Content data-testid="content">
          <p>Profile preview</p>
        </HoverCard.Content>
      </HoverCard>
      <button data-testid="outside">outside</button>
    </>
  );
}
