import { useState } from "react";
import { MultiSelect } from "voidframe";

const options = [
  { value: "alpha", label: "Alpha" },
  { value: "bravo", label: "Bravo" },
  { value: "charlie", label: "Charlie" },
  { value: "delta", label: "Delta" },
];

export default function MultiSelectRoute() {
  const [values, setValues] = useState<string[]>(["alpha", "bravo"]);
  return (
    <>
      <MultiSelect
        label="Tags"
        options={options}
        value={values}
        onValueChange={setValues}
      />
      <p data-testid="values">selected: {values.join(",") || "—"}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
