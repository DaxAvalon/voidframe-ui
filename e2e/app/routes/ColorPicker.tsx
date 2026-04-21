import { useState } from "react";
import { ColorPicker } from "voidframe-ui";

export default function ColorPickerRoute() {
  const [hex, setHex] = useState("#3366ff");
  return (
    <>
      <ColorPicker
        label="Brand"
        defaultValue="#3366ff"
        swatches={["#ff0000", "#00ff00", "#0000ff"]}
        onValueChange={setHex}
      />
      <span data-testid="hex">{hex}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}
