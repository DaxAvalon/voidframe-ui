import { Tooltip, TooltipProvider, Button } from "voidframe-ui";

export default function TooltipRoute() {
  // TooltipProvider with a short skipDelayDuration so the "rapid re-hover
  // bypasses delay" flow is observable within test time budgets.
  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={200}>
      <div style={{ display: "flex", gap: 12 }}>
        <Tooltip content="First tip">
          <Button data-testid="trigger-a">Hover A</Button>
        </Tooltip>
        <Tooltip content="Second tip">
          <Button data-testid="trigger-b">Hover B</Button>
        </Tooltip>
      </div>
      <button data-testid="outside">outside</button>
    </TooltipProvider>
  );
}
