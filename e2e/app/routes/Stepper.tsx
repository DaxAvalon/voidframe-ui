import { useState } from "react";
import { Stepper } from "voidframe-ui";

export default function StepperRoute() {
  const [current, setCurrent] = useState(0);
  return (
    <>
      <Stepper current={current} clickable onValueChange={setCurrent}>
        <Stepper.Step label="Account" />
        <Stepper.Step label="Billing" />
        <Stepper.Step label="Review" />
      </Stepper>
      <span data-testid="current">{current}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}
