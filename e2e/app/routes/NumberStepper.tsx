import { useState } from "react";
import { NumberStepper } from "voidframe";

export default function NumberStepperRoute() {
  const [value, setValue] = useState(5);
  return (
    <>
      <NumberStepper
        label="Qty"
        defaultValue={5}
        min={0}
        max={10}
        step={1}
        onValueChange={setValue}
      />
      <span data-testid="value">{value}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}
