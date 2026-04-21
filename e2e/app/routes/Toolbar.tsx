import { useState } from "react";
import { Toolbar } from "voidframe";

export default function ToolbarRoute() {
  const [align, setAlign] = useState<string>("left");
  return (
    <>
      <Toolbar orientation="horizontal">
        <Toolbar.Button data-testid="bold">B</Toolbar.Button>
        <Toolbar.Button data-testid="italic">I</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.ToggleGroup
          type="single"
          value={align}
          onValueChange={(v) => setAlign(typeof v === "string" ? v : "")}
        >
          <Toolbar.ToggleItem value="left" data-testid="toggle-left">
            L
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="center" data-testid="toggle-center">
            C
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="right" data-testid="toggle-right">
            R
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>
      <span data-testid="align">{align}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}
