import { useState } from "react";
import { RadioGroup } from "voidframe-ui";

const options = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
];

export default function RadioGroupRoute() {
  const [value, setValue] = useState("m");
  return (
    <>
      <RadioGroup
        label="Size"
        options={options}
        value={value}
        onValueChange={setValue}
      />
      <p data-testid="value">value: {value}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
