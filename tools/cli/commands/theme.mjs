import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const KNOWN = ["dark", "light", "midnight", "grey"];

const TEMPLATE = `// Voidframe theme override — edit and wire via <VoidframeProvider theme={...}>.
import { {{BASE}}Theme, type ThemeOverrides } from "voidframe";

export const theme: ThemeOverrides = {
  ...{{BASE}}Theme,
  // Override any token below. Unlisted values fall through to the base theme.
  // Example:
  // "--vf-accent": "#ff7a00",
  // "--vf-border-2": "#2b2b2b",
};
`;

export async function themeCommand({ name, out = "voidframe.theme.ts", log = console }) {
  if (!KNOWN.includes(name)) {
    log.error(
      `✖ Unknown theme "${name}". Valid: ${KNOWN.join(", ")}.`
    );
    return 2;
  }
  const dest = resolve(out);
  const contents = TEMPLATE.replace(/{{BASE}}/g, name);
  await writeFile(dest, contents, "utf-8");
  log.log(`✔ Wrote ${dest}`);
  log.log(`  Wire it:`);
  log.log(`    import { theme } from "./voidframe.theme";`);
  log.log(`    <VoidframeProvider theme={theme}>...</VoidframeProvider>`);
  return 0;
}
