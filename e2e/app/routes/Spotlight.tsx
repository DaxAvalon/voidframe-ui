import { useState } from "react";
import { Spotlight, Button } from "voidframe-ui";

export default function SpotlightRoute() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: "flex", gap: 12 }}>
        <button id="spot-a" type="button">
          Anchor A
        </button>
        <button id="spot-b" type="button">
          Anchor B
        </button>
      </div>
      <Button data-testid="start" onClick={() => setOpen(true)}>
        Start tour
      </Button>
      <Spotlight
        open={open}
        onOpenChange={setOpen}
        steps={[
          {
            target: "#spot-a",
            title: "Step one",
            content: "This is the first anchor.",
            placement: "bottom",
          },
          {
            target: "#spot-b",
            title: "Step two",
            content: "This is the second anchor.",
            placement: "bottom",
          },
        ]}
      />
      <button data-testid="outside">outside</button>
    </>
  );
}
