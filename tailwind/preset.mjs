// ESM entry for the Tailwind preset. Re-exports the single CommonJS source of
// truth so `import preset from "voidframe-ui/tailwind"` and
// `require("voidframe-ui/tailwind")` yield the same object.
import preset from "./preset.cjs";

export default preset;
