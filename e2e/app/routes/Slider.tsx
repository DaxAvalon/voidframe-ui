import { useState } from "react";
import { Slider } from "voidframe";

export default function SliderRoute() {
  const [value, setValue] = useState(50);
  return (
    <>
      <Slider
        label="Volume"
        min={0}
        max={100}
        step={5}
        value={value}
        onValueChange={setValue}
        showValue
      />
      <p data-testid="value">value: {value}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
