import { useState } from "react";
import { Combobox } from "voidframe-ui";

const options = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
];

export default function ComboboxRoute() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <Combobox
        label="Fruit"
        options={options}
        value={value}
        onValueChange={setValue}
        placeholder="Type to filter…"
      />
      <p data-testid="value">selected: {value ?? "—"}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
